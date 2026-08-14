import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAblyRest } from "@/lib/ably";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // 1. Save admin message to database
    const adminMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        senderType: "admin",
        content: message,
      },
    });

    // 2. Broadcast message over Ably to the client
    const ably = getAblyRest();
    const channel = ably.channels.get(`conversations:${sessionId}`);

    await channel.publish("message", {
      id: adminMsg.id,
      content: adminMsg.content,
      role: "assistant",
      senderType: "admin",
      createdAt: adminMsg.createdAt.toISOString(),
    });

    // ALSO publish to the global lobby channel
    const lobbyChannel = ably.channels.get("conversations:lobby");
    await lobbyChannel.publish("message-update", {
      sessionId,
      message: {
        id: adminMsg.id,
        content: adminMsg.content,
        role: "assistant",
        senderType: "admin",
        createdAt: adminMsg.createdAt.toISOString(),
      },
    });

    return NextResponse.json(adminMsg);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

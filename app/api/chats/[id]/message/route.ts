import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { realtime } from "@/lib/realtime";
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

    // 2. Broadcast message over Upstash Realtime to the client
    const channel = realtime.channel(`conversations:${sessionId}`);

    await channel.emit("message", {
      id: adminMsg.id,
      content: adminMsg.content,
      role: "assistant",
      senderType: "admin",
      createdAt: adminMsg.createdAt.toISOString(),
    });

    // ALSO publish to the global lobby channel
    await realtime.channel("conversations:lobby").emit("message-update", {
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

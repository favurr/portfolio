import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";
import prisma from "@/lib/prisma";

import { getAblyRest } from "@/lib/ably";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await chatDal.getSession(id);
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await chatDal.deleteSession(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isAiActive } = await req.json();

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { isAiActive },
    });

    // Publish takeover status to the Ably channel so the visitor's ChatWidget shows a notification
    try {
      const ably = getAblyRest();
      const channel = ably.channels.get(`conversations:${id}`);
      await channel.publish("takeover", {
        isAiActive,
        text: isAiActive ? "AI Agent has resumed the conversation." : "Admin joined the conversation.",
      });
    } catch (ablyError) {
      console.error("Failed to publish Ably takeover notification:", ablyError);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

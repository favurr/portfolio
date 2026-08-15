import { NextResponse } from "next/server";
import { realtime } from "@/lib/realtime";

export const runtime = "edge"; // edge-ready for quick execution

export async function POST(req: Request) {
  try {
    const { sessionId, isTyping, clientId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const channel = realtime.channel(`conversations:${sessionId}`);
    await channel.emit("typing", {
      clientId: clientId || "visitor",
      isTyping: !!isTyping,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Typing route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

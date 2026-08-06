import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";

export async function GET(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const session = await chatDal.getSession(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

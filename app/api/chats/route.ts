import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";

export async function GET() {
  try {
    const sessions = await chatDal.getAllSessions();
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

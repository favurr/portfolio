import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createChatSession, getChatSession, getSessionByFingerprint, updateChatSession } from "@/lib/chat-session";
import { checkRateLimit } from "@/lib/rate-limit";

function generateFingerprint(headers: Headers): string {
  const ua = headers.get("user-agent") || "";
  const acceptLanguage = headers.get("accept-language") || "";
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             headers.get("x-real-ip") || 
             "unknown";
  return Buffer.from(`${ip}:${ua}:${acceptLanguage}`).toString("base64").slice(0, 64);
}

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const { success } = await checkRateLimit(`chat:session:${headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`, "default");
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const fingerprint = generateFingerprint(headersList);
    
    let session = await getSessionByFingerprint(fingerprint);
    
    if (!session) {
      session = await createChatSession(fingerprint);
    } else {
      await updateChatSession(session.id, { lastActiveAt: Date.now() });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const { success } = await checkRateLimit(`chat:session:${headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`, "default");
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const fingerprint = generateFingerprint(headersList);
    const session = await createChatSession(fingerprint);

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { processAiResponse } from "@/services/ai-chat";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               headersList.get("x-real-ip") || 
               "unknown";
    
    const { success } = await checkRateLimit(`chat:${ip}`, "strict");
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before sending more messages." }, { status: 429 });
    }

    const { sessionId, message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });
    if (message.length > 4000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await prisma.chatSession.create({ data: {} });
    }

    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        senderType: "visitor",
        content: message,
      },
    });

    if (session.isAiActive) {
      await processAiResponse(session.id);
    }

    const updatedSession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const aiMsg = updatedSession?.messages[0];

    return NextResponse.json({
      sessionId: session.id,
      response: aiMsg?.content || "Message received",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

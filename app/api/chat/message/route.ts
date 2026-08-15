import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";
import { realtime } from "@/lib/realtime";
import { processAiResponse } from "@/services/ai-chat";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId, message, name, email, history } = await req.json();

    if (message === undefined && !email && !name) {
      return NextResponse.json({ error: "Missing payload details" }, { status: 400 });
    }

    const channel = realtime.channel(`conversations:${sessionId}`);

    let session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    // 1. Check if user is submitting the registration/inquiry form
    if (name || email) {
      if (!session) {
        // Create session in DB since it was in-memory only
        session = await prisma.chatSession.create({
          data: {
            id: sessionId,
            name: name || "Anonymous",
            email: email || "",
            isAiActive: true,
          },
        });

        // Insert historical in-memory messages into database in order
        if (history && Array.isArray(history)) {
          for (const msg of history) {
            await prisma.chatMessage.create({
              data: {
                sessionId: session.id,
                role: msg.role,
                senderType: msg.senderType,
                content: msg.content,
              },
            });
          }
        }

        // Broadcast the new registered session to the admin lobby
        await realtime.channel("conversations:lobby").emit("new-session", {
          id: session.id,
          visitorName: session.name,
          visitorEmail: session.email,
          isAiActive: session.isAiActive,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messages: history || [],
          _count: { messages: history ? history.length : 0 },
        });
      } else {
        // Update existing session's contact info
        session = await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            name: name || session.name,
            email: email || session.email,
          },
        });
      }

      return NextResponse.json({
        sessionId: session.id,
        name: session.name,
        email: session.email,
        isAiActive: session.isAiActive,
        isNewSession: false,
      });
    }

    // 2. If it's a message being sent
    if (message) {
      if (session) {
        // Session is registered, save user message to database
        const userMsg = await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: "user",
            senderType: "visitor",
            content: message,
          },
        });

        // Broadcast message to Upstash Realtime
        await channel.emit("message", {
          id: userMsg.id,
          content: userMsg.content,
          role: "user",
          senderType: "visitor",
          createdAt: userMsg.createdAt.toISOString(),
        });

        // Publish update to the global admin lobby
        await realtime.channel("conversations:lobby").emit("message-update", {
          sessionId: session.id,
          message: {
            id: userMsg.id,
            content: userMsg.content,
            role: "user",
            senderType: "visitor",
            createdAt: userMsg.createdAt.toISOString(),
          },
        });

        if (session.isAiActive) {
          await processAiResponse(session.id);
        }
      } else {
        // Session is unregistered (in-memory only)
        // Publish visitor message to Upstash Realtime
        await channel.emit("message", {
          id: `temp-${Date.now()}`,
          content: message,
          role: "user",
          senderType: "visitor",
          createdAt: new Date().toISOString(),
        });

        // Process AI response dynamically with history
        await processAiResponse(sessionId, history);
      }
    }

    return NextResponse.json({
      sessionId,
      isAiActive: session ? session.isAiActive : true,
      isNewSession: false,
    });
  } catch (error: any) {
    console.error("Chat message route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

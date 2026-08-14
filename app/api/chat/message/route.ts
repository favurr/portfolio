import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";
import { getAblyRest } from "@/lib/ably";
import { processAiResponse } from "@/services/ai-chat";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionId, message, name, email } = await req.json();

    if (message === undefined && !email && !name) {
      return NextResponse.json({ error: "Missing payload details" }, { status: 400 });
    }

    let session;
    let isNewSession = false;

    // 1. Get or create the session
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
    }

    const ably = getAblyRest();

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          name: name || null,
          email: email || null,
          isAiActive: true,
        },
      });
      isNewSession = true;

      // Broadcast new session globally to the admin lobby
      const lobbyChannel = ably.channels.get("conversations:lobby");
      await lobbyChannel.publish("new-session", {
        id: session.id,
        name: session.name,
        email: session.email,
        isAiActive: session.isAiActive,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        messages: [],
        _count: { messages: 0 },
      });
    } else {
      // If client supplied user data later, update session
      if (name || email) {
        session = await prisma.chatSession.update({
          where: { id: session.id },
          data: {
            name: name || session.name,
            email: email || session.email,
          },
        });
      }
    }

    const channel = ably.channels.get(`conversations:${session.id}`);

    // 2. If there's an actual message text, process it
    if (message) {
      // Save user message to database
      const userMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "user",
          senderType: "visitor",
          content: message,
        },
      });

      // Broadcast user message to Ably channel
      await channel.publish("message", {
        id: userMsg.id,
        content: userMsg.content,
        role: "user",
        senderType: "visitor",
        createdAt: userMsg.createdAt.toISOString(),
      });

      // ALSO publish to the global lobby channel
      const lobbyChannel = ably.channels.get("conversations:lobby");
      await lobbyChannel.publish("message-update", {
        sessionId: session.id,
        message: {
          id: userMsg.id,
          content: userMsg.content,
          role: "user",
          senderType: "visitor",
          createdAt: userMsg.createdAt.toISOString(),
        },
      });

      // 3. Trigger AI response processing if takeover is not active
      if (session.isAiActive) {
        // Run AI response in the background or await.
        // Awaiting guarantees that the serverless function executes completely before returning.
        await processAiResponse(session.id);
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      name: session.name,
      email: session.email,
      isAiActive: session.isAiActive,
      isNewSession,
    });
  } catch (error: any) {
    console.error("Chat message route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

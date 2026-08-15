import { Elysia, t } from "elysia";
import { chatDal } from "@/dal/chat";
import { realtime } from "@/lib/realtime";
import { processAiResponse } from "@/services/ai-chat";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { handle } from "@upstash/realtime";

const app = new Elysia({ prefix: "/api" })
  // 1. SSE Connection Endpoint
  .get("/realtime", async ({ request }) => {
    return handle({ realtime })(request);
  })

  // 2. Get All Chat Sessions (Admin)
  .get("/chats", async () => {
    return await chatDal.getAllSessions();
  })

  // 3. Get Specific Chat Session (Visitor or Admin)
  .get("/chat/:sessionId", async ({ params: { sessionId }, set }) => {
    const session = await chatDal.getSession(sessionId);
    if (!session) {
      set.status = 404;
      return { error: "Session not found" };
    }
    return session;
  }, {
    params: t.Object({
      sessionId: t.String()
    })
  })

  // 4. Send Message (Visitor)
  .post("/chat/message", async ({ body, set }) => {
    const { sessionId, message, name, email, history } = body;

    if (message === undefined && !email && !name) {
      set.status = 400;
      return { error: "Missing payload details" };
    }

    const channel = realtime.channel(`conversations:${sessionId}`);

    let session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    // A. Check if user is submitting the registration/inquiry form
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

      return {
        sessionId: session.id,
        name: session.name,
        email: session.email,
        isAiActive: session.isAiActive,
        isNewSession: false,
      };
    }

    // B. If a standard chat message is sent
    if (message) {
      if (!session) {
        // Create session in DB immediately as Anonymous
        session = await prisma.chatSession.create({
          data: {
            id: sessionId,
            name: "Anonymous",
            email: "",
            isAiActive: true,
          },
        });

        // Broadcast the new session to the admin lobby
        await realtime.channel("conversations:lobby").emit("new-session", {
          id: session.id,
          visitorName: session.name,
          visitorEmail: session.email,
          isAiActive: session.isAiActive,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messages: [],
          _count: { messages: 0 },
        });
      }

      // Save user message to database
      const userMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "user",
          senderType: "visitor",
          content: message,
        },
      });

      // Broadcast message to Upstash Realtime (user's specific channel)
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
        processAiResponse(session.id).catch((err) => {
          console.error("[API-CHAT] Background processAiResponse error:", err);
        });
      }
    }

    return {
      sessionId,
      isAiActive: session ? session.isAiActive : true,
      isNewSession: false,
    };
  }, {
    body: t.Object({
      sessionId: t.String(),
      message: t.Optional(t.String()),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      history: t.Optional(t.Any()),
    })
  })

  // 5. Typing Indicator Broadcast
  .post("/chat/typing", async ({ body, set }) => {
    const { sessionId, isTyping, clientId } = body;
    if (!sessionId) {
      set.status = 400;
      return { error: "Missing sessionId" };
    }

    const channel = realtime.channel(`conversations:${sessionId}`);
    await channel.emit("typing", {
      clientId: clientId || "visitor",
      isTyping: !!isTyping,
    });

    return { success: true };
  }, {
    body: t.Object({
      sessionId: t.String(),
      isTyping: t.Boolean(),
      clientId: t.Optional(t.String()),
    })
  })

  // 6. Delete Chat Session (Admin)
  .delete("/chats/:id", async ({ params: { id } }) => {
    await chatDal.deleteSession(id);
    return { success: true };
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  // 7. Get Specific Chat Details (Admin)
  .get("/chats/:id", async ({ params: { id }, set }) => {
    const session = await chatDal.getSession(id);
    if (!session) {
      set.status = 404;
      return { error: "Not found" };
    }
    return session;
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  // 8. Update Takeover Status (Admin)
  .put("/chats/:id", async ({ params: { id }, body }) => {
    const { isAiActive } = body;

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { isAiActive },
    });

    try {
      const channel = realtime.channel(`conversations:${id}`);
      await channel.emit("takeover", {
        text: isAiActive ? "AI Agent has resumed the conversation." : "Admin joined the conversation.",
      });
    } catch (realtimeError) {
      console.error("Failed to publish Upstash Realtime takeover notification:", realtimeError);
    }

    return updated;
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      isAiActive: t.Boolean()
    })
  })

  // 9. Manual Admin Reply (Admin)
  .post("/chats/:id/message", async ({ params: { id: sessionId }, body, set }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { message } = body;
    if (!message) {
      set.status = 400;
      return { error: "Message required" };
    }

    const adminMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        senderType: "admin",
        content: message,
      },
    });

    const channel = realtime.channel(`conversations:${sessionId}`);
    await channel.emit("message", {
      id: adminMsg.id,
      content: adminMsg.content,
      role: "assistant",
      senderType: "admin",
      createdAt: adminMsg.createdAt.toISOString(),
    });

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

    return adminMsg;
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      message: t.String()
    })
  });

export type app = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
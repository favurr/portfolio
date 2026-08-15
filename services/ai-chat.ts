import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { chatDal } from "@/dal/chat";
import { realtime } from "@/lib/realtime";
import prisma from "@/lib/prisma";
import { vectorIndex } from "@/lib/vector";
import { SemanticCache } from "@upstash/semantic-cache";

const semanticCache = vectorIndex
  ? new SemanticCache({
      index: vectorIndex,
      minProximity: 0.92,
    })
  : null;

// Select the AI model dynamically based on environment keys
function getActiveModel() {
  if (process.env.NVIDIA_API_KEY) {
    const nvidia = createOpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
    return {
      model: nvidia.chat("meta/llama-3.1-8b-instruct"),
      name: "nvidia-llama-3.1-8b",
    };
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      model: google("gemini-3.5-flash"),
      name: "gemini-3.5-flash",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      model: openai.chat("gpt-4o-mini"),
      name: "gpt-4o-mini",
    };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      model: anthropic("claude-3-5-haiku-20241022"),
      name: "claude-3-5-haiku",
    };
  }
  return {
    model: google("gemini-3.5-flash"),
    name: "gemini-3.5-flash",
  };
}

export async function processAiResponse(
  sessionId: string,
  inMemoryMessages?: { role: "user" | "assistant" | "admin" | "system"; senderType: "visitor" | "assistant" | "admin" | "system"; content: string }[]
) {
  console.log(`[AI-CHAT] Starting processAiResponse for session ID: ${sessionId} (inMemory = ${!!inMemoryMessages})`);
  const channel = realtime.channel(`conversations:${sessionId}`);

  try {
    let messages: { role: "user" | "assistant"; content: string }[] = [];
    let lastUserMessage = "";
    let isRegistered = true;

    if (inMemoryMessages && Array.isArray(inMemoryMessages)) {
      isRegistered = false;
      messages = inMemoryMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      lastUserMessage = [...inMemoryMessages]
        .reverse()
        .find((m) => m.role === "user" || m.senderType === "visitor")?.content || "";
    } else {
      // 1. Fetch conversation history from local database
      const session = await chatDal.getSession(sessionId);
      if (!session) {
        console.warn(`[AI-CHAT] Session not found in database for ID: ${sessionId}`);
        return;
      }
      messages = session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      lastUserMessage = [...session.messages]
        .reverse()
        .find((m) => m.role === "user" || m.senderType === "visitor")?.content || "";
    }

    console.log(`[AI-CHAT] Latest user message for RAG query: "${lastUserMessage}"`);

    // 1.5 Check semantic cache
    if (semanticCache && lastUserMessage) {
      try {
        await channel.emit("status", { text: "Scanning semantic cache..." });
        console.log(`[AI-CHAT] Checking Semantic Cache for query: "${lastUserMessage}"`);
        const cachedResponse = await semanticCache.get(lastUserMessage);
        if (cachedResponse && typeof cachedResponse === "string") {
          console.log(`[AI-CHAT] Semantic Cache HIT! Response: "${cachedResponse}"`);
          
          // Stream the cached response chunk by chunk to client (3 words per chunk) to avoid out of order delivery
          const words = cachedResponse.split(" ");
          const chunks: string[] = [];
          for (let i = 0; i < words.length; i += 3) {
            chunks.push(words.slice(i, i + 3).join(" ") + " ");
          }
          for (const chunk of chunks) {
            await channel.emit("token", { text: chunk });
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          if (isRegistered) {
            const savedMsg = await prisma.chatMessage.create({
              data: {
                sessionId,
                role: "assistant",
                senderType: "assistant",
                content: cachedResponse,
                modelUsed: "semantic-cache",
                latency: 0,
              },
            });

            await realtime.channel("conversations:lobby").emit("message-update", {
              sessionId,
              message: {
                id: savedMsg.id,
                content: cachedResponse,
                role: "assistant",
                senderType: "assistant",
                createdAt: savedMsg.createdAt.toISOString(),
              },
            });
          }

          await channel.emit("done", {
            sessionId,
          });
          return;
        }
      } catch (cacheErr) {
        console.error("[AI-CHAT] Semantic cache lookup failed:", cacheErr);
      }
    }

    // 2. Perform semantic search using Upstash Vector if available
    let contextBlock = "";

    if (vectorIndex && lastUserMessage) {
      try {
        await channel.emit("status", { text: "Analyzing query & scanning catalog..." });
        console.log(`[AI-CHAT] Querying Upstash Vector for query: "${lastUserMessage}"`);
        const results = await vectorIndex.query({
          data: lastUserMessage,
          topK: 6,
          includeMetadata: true,
        });

        console.log(`[AI-CHAT] Upstash Vector matched ${results.length} results.`);
        const knowledgeFacts: string[] = [];
        const projectsFacts: string[] = [];

        for (const match of results) {
          const meta = match.metadata as any;
          if (!meta) continue;
          if (meta.type === "knowledge") {
            knowledgeFacts.push(`Fact (${meta.title || "General"}): ${match.data}`);
          } else if (meta.type === "project") {
            projectsFacts.push(`Project (${meta.title || "Project"}): ${match.data}`);
          }
        }

        if (knowledgeFacts.length > 0) {
          contextBlock += "\n\nRELEVANT FACTS ABOUT FAVURR:\n" + knowledgeFacts.join("\n");
        }
        if (projectsFacts.length > 0) {
          contextBlock += "\n\nRELEVANT PROJECTS OF FAVURR:\n" + projectsFacts.join("\n");
        }

        if (results.length > 0) {
          await channel.emit("status", { text: `Found matches. Synthesizing response...` });
        } else {
          await channel.emit("status", { text: "Synthesizing answer..." });
        }
      } catch (err) {
        console.error("[AI-CHAT] Error querying Upstash Vector:", err);
        await channel.emit("status", { text: "Synthesizing answer..." });
      }
    } else {
      await channel.emit("status", { text: "Synthesizing answer..." });
    }

    // Define context-rich system prompt
    const systemPrompt = `You are a helpful AI assistant on the portfolio website (Favurr). Your name is Orion.
You represent Favurr, a Design Engineer, and Fullstack Developer based in Lagos, Nigeria.
Be conversational, helpful, and professional. Keep your responses concise and friendly.
Always write and format your responses in clean Markdown (use headers, bold text, bullet points, or paragraphs). Break up long blocks of text into separate, readable paragraphs with clear margins.
Answer questions about Favurr's work, experience, background, availability, and skills.

Here is some context loaded from Favurr's database matching the visitor's query:${contextBlock || "\n(No direct matches found. Answer generally based on what you know or ask the user to clarify.)"}

Use this context to answer the user's question accurately. Cite projects or details from the context where appropriate.
If the question is about something you don't know and is not in the context, suggest they leave their details by outputting "[CLAIM_FORM]" in your response so Favurr can follow up personally. Do not make up answers.

CRITICAL CAPABILITIES:
1. **Details Form**: If the user wants to leave their details, wants you to tell Favurr to reach out, or says thank you/concludes a helpful chat, output the exact token "[CLAIM_FORM]" inline at the end of your response to show them the contact details capture form.`;

    const activeModel = getActiveModel();
    console.log(`[AI-CHAT] Selected active model provider: ${activeModel.name}`);

    // 4. Stream AI response
    await channel.emit("status", { text: "Generating response..." });
    const startTime = Date.now();
    console.log(`[AI-CHAT] Invoking streamText...`);
    
    const result = streamText({
      model: activeModel.model,
      system: systemPrompt,
      messages,
    });

    console.log(`[AI-CHAT] Resolving response textStream...`);
    let fullResponse = "";
    let chunkCount = 0;
    let buffer = "";

    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      buffer += chunk;
      chunkCount++;
      if (chunkCount === 1) {
        console.log(`[AI-CHAT] First token chunk received: "${chunk.trim()}"`);
      }
      
      // Emit if buffer is moderately long or contains whitespace/newline to keep streaming natural and fast
      if (buffer.length >= 24 || chunk.includes("\n") || chunk.includes(" ")) {
        await channel.emit("token", { text: buffer });
        buffer = "";
      }
    }

    if (buffer) {
      await channel.emit("token", { text: buffer });
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-CHAT] Streaming complete. Total chunks = ${chunkCount}. Full response length = ${fullResponse.length} chars. Latency = ${latency}ms`);

    if (fullResponse.length === 0) {
      console.warn("[AI-CHAT] WARNING: Generated response is empty!");
    } else if (semanticCache && lastUserMessage) {
      try {
        await semanticCache.set(lastUserMessage, fullResponse);
        console.log("[AI-CHAT] Stored response in Semantic Cache.");
      } catch (cacheErr) {
        console.error("[AI-CHAT] Semantic Cache set failed:", cacheErr);
      }
    }

    if (isRegistered) {
      // 5. Save the finalized response to the local database
      const savedMsg = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          senderType: "assistant",
          content: fullResponse,
          modelUsed: activeModel.name,
          latency,
        },
      });

      await realtime.channel("conversations:lobby").emit("message-update", {
        sessionId,
        message: {
          id: savedMsg.id,
          content: fullResponse,
          role: "assistant",
          senderType: "assistant",
          createdAt: savedMsg.createdAt.toISOString(),
        },
      });
    }

    // Send complete event with final signal
    await channel.emit("done", {
      sessionId,
    });
    console.log(`[AI-CHAT] Real-time updates successfully broadcasted!`);
  } catch (error: any) {
    console.error("[AI-CHAT] ERROR in processAiResponse:", error);
  }
}

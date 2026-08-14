import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { chatDal } from "@/dal/chat";
import { getAblyRest } from "@/lib/ably";
import prisma from "@/lib/prisma";

// Helper function to extract search keywords from a user message
function extractKeywords(message: string): string[] {
  const clean = message.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");
  const words = clean.split(/\s+/);
  const stopWords = new Set([
    "what", "is", "a", "the", "for", "of", "to", "in", "and", "or", "hub", "page",
    "you", "he", "she", "they", "i", "we", "me", "us", "them", "how", "why", "where",
    "can", "could", "should", "would", "do", "does", "did", "have", "has", "had",
    "get", "got", "make", "made", "know", "tell", "show", "give", "find", "search",
    "about", "with", "from", "on", "at", "by", "an", "this", "that", "these", "those"
  ]);
  
  return words.filter(w => w.length > 1 && !stopWords.has(w));
}

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

export async function processAiResponse(sessionId: string) {
  console.log(`[AI-CHAT] Starting processAiResponse for session ID: ${sessionId}`);
  const ably = getAblyRest();
  const channel = ably.channels.get(`conversations:${sessionId}`);

  try {
    // 1. Fetch conversation history from local database
    const session = await chatDal.getSession(sessionId);
    if (!session) {
      console.warn(`[AI-CHAT] Session not found in database for ID: ${sessionId}`);
      return;
    }

    console.log(`[AI-CHAT] Retrieved session with ${session.messages.length} messages. isAiActive = ${session.isAiActive}`);

    // Map conversation messages
    const messages = session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Get latest user message to perform RAG search
    const lastUserMessage = [...session.messages]
      .reverse()
      .find((m) => m.role === "user" || m.senderType === "visitor")?.content || "";

    console.log(`[AI-CHAT] Latest user message for RAG query: "${lastUserMessage}"`);

    // 2. Perform server-side keyword RAG searches
    const keywords = extractKeywords(lastUserMessage);
    console.log(`[AI-CHAT] Extracted search keywords: ${JSON.stringify(keywords)}`);

    let matchedKnowledge: any[] = [];
    let matchedProjects: any[] = [];

    if (keywords.length > 0) {
      // Query Knowledge Base Entries matching keywords
      matchedKnowledge = await prisma.knowledgeEntry.findMany({
        where: {
          enabled: true,
          OR: keywords.map(kw => ({
            OR: [
              { title: { contains: kw, mode: "insensitive" } },
              { content: { contains: kw, mode: "insensitive" } }
            ]
          }))
        },
        take: 3
      });

      // Query Projects catalog matching keywords
      matchedProjects = await prisma.project.findMany({
        where: {
          status: { not: "archived" },
          OR: keywords.map(kw => ({
            OR: [
              { title: { contains: kw, mode: "insensitive" } },
              { description: { contains: kw, mode: "insensitive" } },
              { overview: { contains: kw, mode: "insensitive" } }
            ]
          }))
        },
        take: 3
      });
    }

    console.log(`[AI-CHAT] RAG Matches: ${matchedKnowledge.length} knowledge items, ${matchedProjects.length} projects.`);

    // 3. Compile injected context block
    let contextBlock = "";
    
    if (matchedKnowledge.length > 0) {
      contextBlock += "\n\nRELEVANT FACTS ABOUT EMEKA:\n";
      matchedKnowledge.forEach((item, idx) => {
        contextBlock += `Fact #${idx + 1} (${item.title}): ${item.content}\n`;
      });
    }

    if (matchedProjects.length > 0) {
      contextBlock += "\n\nRELEVANT PROJECTS OF EMEKA:\n";
      matchedProjects.forEach((proj, idx) => {
        contextBlock += `Project #${idx + 1} (${proj.title}): ${proj.description} (Category: ${proj.category}, Year: ${proj.year})\n`;
      });
    }

    // Define context-rich system prompt
    const systemPrompt = `You are a helpful AI assistant on Emeka's portfolio website (Favurr). 
You represent Emeka, a Design Engineer, Photographer, and Frontend Developer based in Lagos, Nigeria.
Be conversational, helpful, and professional. Keep your responses concise and friendly.
Answer questions about Emeka's work, experience, background, availability, and skills.

Here is some context loaded from Emeka's database matching the visitor's query:${contextBlock || "\n(No direct matches found. Answer generally based on what you know or ask the user to clarify.)"}

Use this context to answer the user's question accurately. Cite projects or details from the context where appropriate.
If the question is about something you don't know and is not in the context, suggest they leave their details by outputting "[CLAIM_FORM]" in your response so Emeka can follow up personally. Do not make up answers.

CRITICAL CAPABILITIES:
1. **Details Form**: If the user wants to leave their details, wants you to tell Emeka to reach out, or says thank you/concludes a helpful chat, output the exact token "[CLAIM_FORM]" inline at the end of your response to show them the contact details capture form.
2. **Multiple Messages**: If you want to send multiple separate messages (e.g. to break up points or sound more human), insert "[SPLIT]" on a new line between paragraphs. The system will separate them into multiple bubbles in real time.`;

    const activeModel = getActiveModel();
    console.log(`[AI-CHAT] Selected active model provider: ${activeModel.name}`);

    // 4. Stream AI response
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

    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      chunkCount++;
      if (chunkCount === 1) {
        console.log(`[AI-CHAT] First token chunk received: "${chunk.trim()}"`);
      }
      channel.publish("token", { text: chunk });
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-CHAT] Streaming complete. Total chunks = ${chunkCount}. Full response length = ${fullResponse.length} chars. Latency = ${latency}ms`);

    if (fullResponse.length === 0) {
      console.warn("[AI-CHAT] WARNING: Generated response is empty!");
    }

    // 5. Save the finalized response to the local database, splitting by [SPLIT] if needed
    const parts = fullResponse.split("[SPLIT]").map(p => p.trim()).filter(Boolean);
    const lobbyChannel = ably.channels.get("conversations:lobby");

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const savedMsg = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          senderType: "assistant",
          content: part,
          modelUsed: activeModel.name,
          latency: Math.round(latency / parts.length),
        },
      });
      console.log(`[AI-CHAT] AI message part ${i+1}/${parts.length} saved with ID: ${savedMsg.id}`);

      // Publish new message update to the lobby
      await lobbyChannel.publish("message-update", {
        sessionId,
        message: {
          id: savedMsg.id,
          content: part,
          role: "assistant",
          senderType: "assistant",
          createdAt: savedMsg.createdAt.toISOString(),
        },
      });
    }

    // Send complete event with final signal
    await channel.publish("done", {
      sessionId,
      partsCount: parts.length,
    });
    console.log(`[AI-CHAT] Real-time updates successfully broadcasted!`);
  } catch (error: any) {
    console.error("[AI-CHAT] ERROR in processAiResponse:", error);
    await channel.publish("error", { message: error.message });
  }
}

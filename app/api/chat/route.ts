import { NextResponse } from "next/server";
import { chatDal } from "@/dal/chat";
import { knowledgeDal } from "@/dal/knowledge";
import { projectDal } from "@/dal/project";
import { experienceDal } from "@/dal/experience";
import { getAIResponse, type ChatMessage } from "@/lib/ai-providers";

async function buildSystemPrompt(): Promise<string> {
  const [knowledgeEntries, projects, experiences] = await Promise.all([
    knowledgeDal.getEnabledEntries(),
    projectDal.getFeaturedProjects(),
    experienceDal.getVisibleExperiences(),
  ]);

  const knowledgeBlock = knowledgeEntries.length > 0
    ? `\n\nHere is what you know about Emeka:\n${knowledgeEntries.map((e: any) => `- ${e.title}: ${e.content}`).join("\n")}`
    : "";

  const projectsBlock = projects.length > 0
    ? `\n\nEmeka's projects:\n${projects.map((p: any) => `- ${p.title}: ${p.description}`).join("\n")}`
    : "";

  const experienceBlock = experiences.length > 0
    ? `\n\nEmeka's ventures/experience:\n${experiences.map((e: any) => `- ${e.title} at ${e.company} (${e.startDate}–${e.endDate || "Present"})`).join("\n")}`
    : "";

  return `You are a helpful AI assistant on Emeka's portfolio website (Favurr). You represent Emeka, a Design Engineer and Frontend Developer based in Lagos, Nigeria. Be conversational, helpful, and professional. Keep responses concise and friendly.${knowledgeBlock}${projectsBlock}${experienceBlock}

If someone asks something you don't know about Emeka, suggest they reach out via the contact form or email at ceo.emeka@favurr.site.`;
}

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    // Get or create session
    let session;
    if (sessionId) {
      session = await chatDal.getSession(sessionId);
    }
    if (!session) {
      session = await chatDal.createSession();
    }

    // Save user message
    await chatDal.addMessage(session.id, "user", message);

    // Build conversation history
    const fullSession = await chatDal.getSession(session.id);
    const history: ChatMessage[] = (fullSession?.messages || []).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Get AI response
    const systemPrompt = await buildSystemPrompt();
    const response = await getAIResponse(history, systemPrompt);

    // Save assistant response
    await chatDal.addMessage(session.id, "assistant", response);

    return NextResponse.json({ sessionId: session.id, response });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

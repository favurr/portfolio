export type AIProvider = "gemini" | "openai" | "nvidia" | "openrouter";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const PROVIDERS: Record<AIProvider, {
  url: string;
  transform: (messages: ChatMessage[], systemPrompt: string) => any;
  extract: (data: any) => string;
  auth: (key: string) => string;
  authType: "query" | "header";
}> = {
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    transform: (messages, systemPrompt) => ({
      contents: messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
    extract: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
    auth: (key) => `key=${key}`,
    authType: "query",
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    transform: (messages, systemPrompt) => ({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
    extract: (data) => data.choices?.[0]?.message?.content || "No response",
    auth: (key) => `Bearer ${key}`,
    authType: "header",
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    transform: (messages, systemPrompt) => ({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
    }),
    extract: (data) => data.choices?.[0]?.message?.content || "No response",
    auth: (key) => `Bearer ${key}`,
    authType: "header",
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    transform: (messages, systemPrompt) => ({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
    extract: (data) => data.choices?.[0]?.message?.content || "No response",
    auth: (key) => `Bearer ${key}`,
    authType: "header",
  },
};

export async function getAIResponse(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const providerOrder: AIProvider[] = ["gemini", "openai", "nvidia", "openrouter"];
  const envKeys: Record<AIProvider, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    nvidia: process.env.NVIDIA_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  };

  for (const provider of providerOrder) {
    const key = envKeys[provider];
    if (!key) continue;

    const config = PROVIDERS[provider];
    const body = config.transform(messages, systemPrompt);

    try {
      const url = config.authType === "query" ? `${config.url}?${config.auth(key)}` : config.url;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (config.authType === "header") headers["Authorization"] = config.auth(key);

      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) continue;
      const data = await res.json();
      return config.extract(data);
    } catch {
      continue;
    }
  }

  return "I apologize, but I'm currently unable to respond. Please try again later or reach out via the contact form.";
}

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

async function testSdkTools() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return;

  const nvidia = createOpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  console.log("Testing Vercel AI SDK multi-step tool call to NVIDIA...");
  try {
    const { text, steps } = await generateText({
      model: nvidia.chat("meta/llama-3.1-8b-instruct"),
      maxSteps: 5,
      prompt: "What projects does Emeka have? Search for it.",
      tools: {
        searchProjects: {
          description: "Search Emeka's projects and case studies catalog.",
          parameters: {
            type: "object" as const,
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
          execute: async ({ query }) => {
            console.log(`-> Tool searchProjects executed with query: "${query}"`);
            return [
              { title: "Favurr", description: "Design engineering portfolio" },
              { title: "Photography Hub", description: "Visual memories capture" }
            ];
          },
        },
      },
    });

    console.log(`Number of steps run: ${steps.length}`);
    steps.forEach((step, i) => {
      console.log(`Step ${i + 1} finishReason: ${step.finishReason}`);
      if (step.text) console.log(`Step ${i + 1} text: "${step.text}"`);
    });
    console.log("Final text result:", text);
  } catch (e: any) {
    console.error("SDK Error:", e);
  }
}

testSdkTools();

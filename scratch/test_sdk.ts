import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

async function testSdk() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return;

  const nvidia = createOpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  console.log("Testing Vercel AI SDK call to NVIDIA...");
  try {
    const { text } = await generateText({
      model: nvidia.chat("meta/llama-3.1-8b-instruct"),
      prompt: "Say hello in one word",
    });

    console.log("SDK Text result:", text);
  } catch (e: any) {
    console.error("SDK Error:", e);
    if (e.url) console.error("URL:", e.url);
    if (e.statusCode) console.error("Status Code:", e.statusCode);
    if (e.responseBody) console.error("Response Body:", e.responseBody);
  }
}

testSdk();

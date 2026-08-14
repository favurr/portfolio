async function testTools() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return;

  console.log("Testing tool call inference on NVIDIA NIM...");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: "What is the weather in Lagos?" }],
        tools: [
          {
            type: "function",
            function: {
              name: "getWeather",
              description: "Get the current weather",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" }
                },
                required: ["location"]
              }
            }
          }
        ],
        tool_choice: "auto",
      }),
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response body:", text);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

testTools();

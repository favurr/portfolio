async function testInference() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error("NVIDIA_API_KEY is not defined in the environment!");
    return;
  }

  console.log("Testing inference request to NVIDIA NIM...");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: "Say hello in one word" }],
        max_tokens: 10,
      }),
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response body:", text);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

testInference();

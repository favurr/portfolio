async function testNvidia() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error("NVIDIA_API_KEY is not defined in the environment!");
    return;
  }

  console.log("Fetching NVIDIA models...");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error("Response body:", text);
      return;
    }

    const data = await res.json();
    console.log("Available models:");
    data.data.forEach((m: any) => {
      console.log(`- ${m.id}`);
    });
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

testNvidia();

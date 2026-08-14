import Ably from "ably";

if (!process.env.ABLY_API_KEY) {
  throw new Error("Missing ABLY_API_KEY environment variable");
}

// Global serverless helper instance for Ably REST
let ablyRest: Ably.Rest | null = null;

export function getAblyRest() {
  if (!ablyRest) {
    ablyRest = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
    });
  }
  return ablyRest;
}

import { Index } from "@upstash/vector";

const url = process.env.UPSTASH_VECTOR_REST_URL;
const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!url || !token) {
  console.warn("⚠️ Upstash Vector environment variables are missing. Semantic search will be disabled.");
}

export const vectorIndex = url && token
  ? new Index({ url, token })
  : null;

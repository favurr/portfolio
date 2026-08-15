import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn("⚠️ Upstash Redis environment variables are missing for Realtime.");
}

const redis = new Redis({
  url: url || "",
  token: token || "",
});

// Zod schemas defining all typed events for real-time messaging
const schema = {
  // Lobby events
  "new-session": z.object({
    id: z.string(),
    visitorName: z.string().nullable().optional(),
    visitorEmail: z.string().nullable().optional(),
    isAiActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    messages: z.array(z.any()).optional(),
    _count: z.object({
      messages: z.number(),
    }).optional(),
  }),
  "message-update": z.object({
    sessionId: z.string(),
    message: z.object({
      id: z.string().optional(),
      role: z.string(),
      senderType: z.string(),
      content: z.string(),
      createdAt: z.string().optional(),
    }),
  }),
  // Conversation events
  status: z.object({
    text: z.string(),
  }),
  token: z.object({
    text: z.string(),
  }),
  done: z.object({
    sessionId: z.string(),
  }),
  message: z.object({
    id: z.string().optional(),
    role: z.string(),
    senderType: z.string(),
    content: z.string(),
    createdAt: z.string().optional(),
  }),
  takeover: z.object({
    text: z.string(),
  }),
  typing: z.object({
    clientId: z.string(),
    isTyping: z.boolean(),
  }),
};

export const realtime = new Realtime({
  schema,
  redis,
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

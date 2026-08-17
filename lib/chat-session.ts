import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days
const SESSION_PREFIX = "chat:session:";

export interface ChatSessionData {
  id: string;
  createdAt: number;
  lastActiveAt: number;
  messageCount: number;
  isRegistered: boolean;
  visitorName?: string;
  visitorEmail?: string;
  clientFingerprint?: string;
}

export async function createChatSession(clientFingerprint?: string): Promise<ChatSessionData> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const sessionData: ChatSessionData = {
    id: sessionId,
    createdAt: now,
    lastActiveAt: now,
    messageCount: 0,
    isRegistered: false,
    clientFingerprint,
  };
  
  await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(sessionData), { ex: SESSION_TTL });
  
  if (clientFingerprint) {
    await redis.set(`chat:fingerprint:${clientFingerprint}`, sessionId, { ex: SESSION_TTL });
  }
  
  return sessionData;
}

export async function getChatSession(sessionId: string): Promise<ChatSessionData | null> {
  const data = await redis.get<string>(`${SESSION_PREFIX}${sessionId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as ChatSessionData;
  } catch {
    return null;
  }
}

export async function updateChatSession(sessionId: string, updates: Partial<ChatSessionData>): Promise<ChatSessionData | null> {
  const existing = await getChatSession(sessionId);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates, lastActiveAt: Date.now() };
  await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(updated), { ex: SESSION_TTL });
  return updated;
}

export async function getSessionByFingerprint(fingerprint: string): Promise<ChatSessionData | null> {
  const sessionId = await redis.get<string>(`chat:fingerprint:${fingerprint}`);
  if (!sessionId) return null;
  return getChatSession(sessionId);
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const session = await getChatSession(sessionId);
  if (session?.clientFingerprint) {
    await redis.del(`chat:fingerprint:${session.clientFingerprint}`);
  }
  await redis.del(`${SESSION_PREFIX}${sessionId}`);
}

export async function incrementMessageCount(sessionId: string): Promise<void> {
  const session = await getChatSession(sessionId);
  if (session) {
    await updateChatSession(sessionId, { messageCount: session.messageCount + 1 });
  }
}
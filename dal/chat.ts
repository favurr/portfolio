import prisma from "@/lib/prisma";

export const chatDal = {
  async createSession(data?: { name?: string; email?: string }) {
    return prisma.chatSession.create({ data: data || {} });
  },
  async addMessage(sessionId: string, role: string, content: string) {
    // Also touch session updatedAt
    await prisma.chatSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } });
    return prisma.chatMessage.create({ data: { sessionId, role, content } });
  },
  async getSession(id: string) {
    return prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  },
  async getAllSessions() {
    return prisma.chatSession.findMany({
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" },
    });
  },
  async deleteSession(id: string) {
    return prisma.chatSession.delete({ where: { id } });
  },
};

import prisma from "@/lib/prisma";

export const knowledgeDal = {
  async getEnabledEntries() {
    return prisma.knowledgeEntry.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    });
  },
  async getAllEntries() {
    return prisma.knowledgeEntry.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
  },
  async createEntry(data: { title: string; content: string; category?: string; enabled?: boolean; order?: number }) {
    return prisma.knowledgeEntry.create({ data });
  },
  async updateEntry(id: string, data: Partial<{ title: string; content: string; category: string; enabled: boolean; order: number }>) {
    return prisma.knowledgeEntry.update({ where: { id }, data });
  },
  async deleteEntry(id: string) {
    return prisma.knowledgeEntry.delete({ where: { id } });
  },
};

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getEnabledEntriesCached = unstable_cache(
  async () => {
    return prisma.knowledgeEntry.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    });
  },
  [CACHE_TAGS.knowledge],
  { revalidate: 60, tags: [CACHE_TAGS.knowledge] }
);

export const knowledgeDal = {
  async getEnabledEntries() {
    return getEnabledEntriesCached();
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

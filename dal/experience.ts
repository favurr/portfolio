import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getVisibleExperiencesCached = unstable_cache(
  async () => {
    return prisma.experience.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
  },
  [CACHE_TAGS.experiences],
  { revalidate: 60, tags: [CACHE_TAGS.experiences] }
);

export const experienceDal = {
  async getVisibleExperiences() {
    return getVisibleExperiencesCached();
  },
  async getAllExperiences() {
    return prisma.experience.findMany({ orderBy: { order: "asc" } });
  },
  async createExperience(data: { title: string; company: string; description?: string; startDate: string; endDate?: string; order?: number; visible?: boolean }) {
    return prisma.experience.create({ data });
  },
  async updateExperience(id: string, data: Partial<{ title: string; company: string; description: string; startDate: string; endDate: string | null; order: number; visible: boolean }>) {
    return prisma.experience.update({ where: { id }, data });
  },
  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } });
  },
};

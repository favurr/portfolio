import prisma from "@/lib/prisma";

export const experienceDal = {
  async getVisibleExperiences() {
    return prisma.experience.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
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

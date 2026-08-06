import prisma from "@/lib/prisma";

export const settingsDal = {
  async getSettings() {
    return prisma.setting.findUnique({
      where: { id: "global" },
    });
  },

  async updateSettings(data: {
    siteTitle: string;
    description: string;
    contactEmail?: string | null;
    socialLinks?: any;
    seoDefaults?: any;
  }) {
    return prisma.setting.upsert({
      where: { id: "global" },
      update: data,
      create: {
        id: "global",
        ...data,
      },
    });
  },
};

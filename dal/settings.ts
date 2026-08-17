import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getSettingsCached = unstable_cache(
  async () => {
    return prisma.setting.findUnique({
      where: { id: "global" },
    });
  },
  [CACHE_TAGS.settings],
  { revalidate: 60, tags: [CACHE_TAGS.settings] }
);

export const settingsDal = {
  async getSettings() {
    return getSettingsCached();
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

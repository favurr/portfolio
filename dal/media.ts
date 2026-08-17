import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getMediaItemsCached = unstable_cache(
  async (projectId?: string) => {
    return prisma.media.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  [CACHE_TAGS.media()],
  { revalidate: 60, tags: [CACHE_TAGS.media()] }
);

const getMediaItemByIdCached = unstable_cache(
  async (id: string) => {
    return prisma.media.findUnique({
      where: { id },
    });
  },
  [CACHE_TAGS.media(), "id"],
  { revalidate: 60, tags: [CACHE_TAGS.media()] }
);

export const mediaDal = {
  async getMediaItems(projectId?: string) {
    return getMediaItemsCached(projectId);
  },

  async createMediaItem(data: {
    url: string;
    key: string;
    width?: number;
    height?: number;
    alt?: string;
    fileSize?: number;
    mimeType?: string;
    projectId?: string;
  }) {
    return prisma.media.create({
      data,
    });
  },

  async deleteMediaItem(id: string) {
    return prisma.media.delete({
      where: { id },
    });
  },

  async getMediaItemById(id: string) {
    return getMediaItemByIdCached(id);
  },
};

import prisma from "@/lib/prisma";

export const mediaDal = {
  async getMediaItems() {
    return prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });
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
    return prisma.media.findUnique({
      where: { id },
    });
  },
};

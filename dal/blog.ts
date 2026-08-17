import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getPublishedPostsCached = unstable_cache(
  async () => {
    return prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
  },
  [CACHE_TAGS.blog],
  { revalidate: 60, tags: [CACHE_TAGS.blog] }
);

const getPostBySlugCached = unstable_cache(
  async (slug: string) => {
    return prisma.blogPost.findUnique({ where: { slug } });
  },
  [CACHE_TAGS.blog, "slug"],
  { revalidate: 60, tags: [CACHE_TAGS.blog] }
);

export const blogDal = {
  async getPublishedPosts() {
    return getPublishedPostsCached();
  },
  async getPostBySlug(slug: string) {
    return getPostBySlugCached(slug);
  },
  async getAllPosts() {
    return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  },
  async createPost(data: { title: string; slug: string; excerpt?: string; content?: string; coverImage?: string; tags?: string[]; status?: string; publishedAt?: Date }) {
    return prisma.blogPost.create({ data });
  },
  async updatePost(id: string, data: Partial<{ title: string; slug: string; excerpt: string; content: string; coverImage: string; tags: string[]; status: string; publishedAt: Date | null }>) {
    return prisma.blogPost.update({ where: { id }, data });
  },
  async deletePost(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  },
};

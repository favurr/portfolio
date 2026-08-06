import prisma from "@/lib/prisma";

export const blogDal = {
  async getPublishedPosts() {
    return prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
  },
  async getPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({ where: { slug } });
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

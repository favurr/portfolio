import prisma from "@/lib/prisma";

export const contactDal = {
  async createSubmission(data: { name: string; email: string; subject?: string; message: string }) {
    return prisma.contactSubmission.create({ data });
  },
  async getSubmissions() {
    return prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });
  },
  async markAsRead(id: string) {
    return prisma.contactSubmission.update({ where: { id }, data: { read: true } });
  },
  async markAsUnread(id: string) {
    return prisma.contactSubmission.update({ where: { id }, data: { read: false } });
  },
  async deleteSubmission(id: string) {
    return prisma.contactSubmission.delete({ where: { id } });
  },
  async getUnreadCount() {
    return prisma.contactSubmission.count({ where: { read: false } });
  },
};

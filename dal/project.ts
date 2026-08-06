import prisma from "@/lib/prisma";

export const projectDal = {
  async getProjects() {
    return prisma.project.findMany({
      orderBy: { order: "asc" },
    });
  },

  async getPublishedProjects() {
    // Show all projects that are not drafts or archived
    return prisma.project.findMany({
      where: {
        status: { in: ["live", "in progress"] }
      },
      orderBy: { order: "asc" },
    });
  },

  async getActiveProjectsCount() {
    return prisma.project.count({
      where: {
        status: { in: ["live", "in progress"] }
      }
    });
  },

  async getFeaturedProjects() {
    // Featured on home dictates whether it shows on public homepage route
    return prisma.project.findMany({
      where: {
        featured: true
      },
      orderBy: { order: "asc" },
    });
  },

  async getProjectBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async getNextProject(currentOrder: number, currentId: string) {
    // Use compound cursor: (order, id) to handle tied order values
    const next = await prisma.project.findFirst({
      where: {
        id: { not: currentId },
        status: { in: ["live", "in progress"] },
        OR: [
          { order: { gt: currentOrder } },
          { order: currentOrder, id: { gt: currentId } },
        ],
      },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    if (next) return next;

    // Wrap around to the very first active project (not self)
    return prisma.project.findFirst({
      where: {
        id: { not: currentId },
        status: { in: ["live", "in progress"] },
      },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
  },

  async getPreviousProject(currentOrder: number, currentId: string) {
    // Use compound cursor: (order, id) to handle tied order values
    const prev = await prisma.project.findFirst({
      where: {
        id: { not: currentId },
        status: { in: ["live", "in progress"] },
        OR: [
          { order: { lt: currentOrder } },
          { order: currentOrder, id: { lt: currentId } },
        ],
      },
      orderBy: [{ order: "desc" }, { id: "desc" }],
    });

    if (prev) return prev;

    // Wrap around to the very last active project (not self)
    return prisma.project.findFirst({
      where: {
        id: { not: currentId },
        status: { in: ["live", "in progress"] },
      },
      orderBy: [{ order: "desc" }, { id: "desc" }],
    });
  },

  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async createProject(data: {
    title: string;
    slug: string;
    description: string;
    featuredImage: string;
    userId: string;
  }) {
    return prisma.project.create({
      data,
    });
  },

  async updateProject(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string;
      featuredImage: string;
      published: boolean;
      featured: boolean;
      order: number;
      repository: string;
      liveDemo: string;
      year: number;
      client: string;
      duration: string;
      seoTitle: string;
      seoDescription: string;
      seoImage: string;
    }>
  ) {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  async deleteProject(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  },

  async reorderProjects(projectIds: string[]) {
    return prisma.$transaction(
      projectIds.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  },

  async createSection(projectId: string, componentKey: string, order: number) {
    return prisma.projectSection.create({
      data: {
        projectId,
        componentKey,
        order,
      },
    });
  },

  async updateSection(
    sectionId: string,
    data: Partial<{
      title: string;
      subtitle: string;
      content: string;
      props: any;
    }>
  ) {
    return prisma.projectSection.update({
      where: { id: sectionId },
      data,
    });
  },

  async reorderSections(sectionIds: string[]) {
    return prisma.$transaction(
      sectionIds.map((id, index) =>
        prisma.projectSection.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  },

  async deleteSection(sectionId: string) {
    return prisma.projectSection.delete({
      where: { id: sectionId },
    });
  },
};

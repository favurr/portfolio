import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

const getPublishedProjectsCached = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: {
        status: { in: ["live", "in progress"] }
      },
      orderBy: { order: "asc" },
    });
  },
  [CACHE_TAGS.projects],
  { revalidate: 60, tags: [CACHE_TAGS.projects] }
);

const getActiveProjectsCountCached = unstable_cache(
  async () => {
    return prisma.project.count({
      where: {
        status: { in: ["live", "in progress"] }
      }
    });
  },
  [CACHE_TAGS.projects, "count"],
  { revalidate: 60, tags: [CACHE_TAGS.projects] }
);

const getFeaturedProjectsCached = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: {
        featured: true
      },
      orderBy: { order: "asc" },
    });
  },
  [CACHE_TAGS.projects, "featured"],
  { revalidate: 60, tags: [CACHE_TAGS.projects] }
);

const getProjectBySlugCached = unstable_cache(
  async (slug: string) => {
    return prisma.project.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });
  },
  [CACHE_TAGS.projects, "slug"],
  { revalidate: 60, tags: [CACHE_TAGS.projects] }
);

export const projectDal = {
  async getProjects() {
    return prisma.project.findMany({
      orderBy: { order: "asc" },
    });
  },

  async getPublishedProjects() {
    return getPublishedProjectsCached();
  },

  async getActiveProjectsCount() {
    return getActiveProjectsCountCached();
  },

  async getFeaturedProjects() {
    return getFeaturedProjectsCached();
  },

  async getProjectBySlug(slug: string) {
    return getProjectBySlugCached(slug);
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

  // Single-transaction batch save: project meta + N sections in ONE round-trip
  async batchSaveProject(
    projectId: string,
    projectData: Partial<{
      title: string; slug: string; description: string; featuredImage: string;
      published: boolean; featured: boolean; order: number; repository: string;
      liveDemo: string; year: number; client: string; duration: string;
      projectType: string[]; category: string; device: string; industry: string;
      role: string; overview: string; status: string;
      seoTitle: string; seoDescription: string; seoImage: string;
    }>,
    sections: Array<{
      id: string;
      title?: string | null;
      subtitle?: string | null;
      content?: string | null;
      props?: any;
    }>
  ) {
    return prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: projectData,
      }),
      ...sections.map((s) =>
        prisma.projectSection.update({
          where: { id: s.id },
          data: {
            title: s.title,
            subtitle: s.subtitle,
            content: s.content,
            props: s.props,
          },
        })
      ),
    ]);
  },
};

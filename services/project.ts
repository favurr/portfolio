import { projectDal } from "@/dal/project";
import { mediaDal } from "@/dal/media";
import { settingsDal } from "@/dal/settings";
import { revalidatePath } from "next/cache";

export const projectService = {
  async getProjects() {
    return projectDal.getProjects();
  },

  async getProjectBySlug(slug: string) {
    return projectDal.getProjectBySlug(slug);
  },

  async createProject(data: {
    title: string;
    slug: string;
    description: string;
    featuredImage: string;
    userId: string;
  }) {
    const project = await projectDal.createProject(data);
    revalidatePath("/projects");
    revalidatePath("/");
    return project;
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
      projectType: string[];
      category: string;
      device: string;
      industry: string;
      role: string;
      overview: string;
      status: string;
      seoTitle: string;
      seoDescription: string;
      seoImage: string;
    }>
  ) {
    const project = await projectDal.updateProject(id, data);
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/projects");
    revalidatePath("/");
    return project;
  },

  async deleteProject(id: string) {
    const project = await projectDal.getProjectById(id);
    const result = await projectDal.deleteProject(id);
    if (project) {
      revalidatePath(`/projects/${project.slug}`);
    }
    revalidatePath("/projects");
    revalidatePath("/");
    return result;
  },

  async reorderProjects(projectIds: string[]) {
    const result = await projectDal.reorderProjects(projectIds);
    revalidatePath("/projects");
    revalidatePath("/");
    return result;
  },

  async addSection(projectId: string, componentKey: string) {
    const project = await projectDal.getProjectById(projectId);
    const order = project?.sections.length || 0;
    const section = await projectDal.createSection(projectId, componentKey, order);
    if (project) revalidatePath(`/projects/${project.slug}`);
    return section;
  },

  async updateSection(
    projectId: string,
    sectionId: string,
    data: Partial<{
      title: string;
      subtitle: string;
      content: string;
      props: any;
    }>
  ) {
    const result = await projectDal.updateSection(sectionId, data);
    const project = await projectDal.getProjectById(projectId);
    if (project) revalidatePath(`/projects/${project.slug}`);
    return result;
  },

  // One round-trip: project meta + dirty sections in a single DB transaction
  async batchSaveProject(
    projectId: string,
    projectData: any,
    sections: Array<{ id: string; title?: string | null; subtitle?: string | null; content?: string | null; props?: any }>
  ) {
    const results = await projectDal.batchSaveProject(projectId, projectData, sections);
    const project = results[0] as any;
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/projects");
    revalidatePath("/");
    return project;
  },

  async reorderSections(projectId: string, sectionIds: string[]) {
    const result = await projectDal.reorderSections(sectionIds);
    const project = await projectDal.getProjectById(projectId);
    if (project) revalidatePath(`/projects/${project.slug}`);
    return result;
  },

  async deleteSection(projectId: string, sectionId: string) {
    const result = await projectDal.deleteSection(sectionId);
    const project = await projectDal.getProjectById(projectId);
    if (project) revalidatePath(`/projects/${project.slug}`);
    return result;
  },
};

export const mediaService = {
  async getMediaItems(projectId?: string) {
    return mediaDal.getMediaItems(projectId);
  },

  async registerMediaItem(data: {
    url: string;
    key: string;
    width?: number;
    height?: number;
    alt?: string;
    fileSize?: number;
    mimeType?: string;
    projectId?: string;
  }) {
    return mediaDal.createMediaItem(data);
  },

  async deleteMediaItem(id: string) {
    const media = await mediaDal.getMediaItemById(id);
    // Cloudflare R2 file deletion API integration can be called here
    return mediaDal.deleteMediaItem(id);
  },
};

export const settingsService = {
  async getSettings() {
    return settingsDal.getSettings();
  },

  async updateSettings(data: {
    siteTitle: string;
    description: string;
    contactEmail?: string | null;
    socialLinks?: any;
    seoDefaults?: any;
  }) {
    const settings = await settingsDal.updateSettings(data);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return settings;
  },
};

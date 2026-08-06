"use server";

import { projectService, mediaService, settingsService } from "@/services/project";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProjectSchema, SettingsSchema } from "@/lib/validation";

async function verifyAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createProjectAction(payload: any) {
  const session = await verifyAuth();
  if (!payload.title) {
    throw new Error("Project Title is required");
  }
  
  // Set default initial slug if missing
  const slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  return projectService.createProject({
    title: payload.title,
    slug: slug,
    description: payload.description || "",
    featuredImage: payload.featuredImage || "",
    userId: session.user.id,
  });
}

export async function updateProjectAction(id: string, payload: any) {
  await verifyAuth();
  // Support partial updates for auto-saving
  return projectService.updateProject(id, payload);
}

export async function deleteProjectAction(id: string) {
  await verifyAuth();
  return projectService.deleteProject(id);
}

export async function reorderProjectsAction(projectIds: string[]) {
  await verifyAuth();
  return projectService.reorderProjects(projectIds);
}

export async function addSectionAction(projectId: string, componentKey: string) {
  await verifyAuth();
  return projectService.addSection(projectId, componentKey);
}

export async function updateSectionAction(projectId: string, sectionId: string, payload: any) {
  await verifyAuth();
  return projectService.updateSection(projectId, sectionId, payload);
}

export async function reorderSectionsAction(projectId: string, sectionIds: string[]) {
  await verifyAuth();
  return projectService.reorderSections(projectId, sectionIds);
}

export async function deleteSectionAction(projectId: string, sectionId: string) {
  await verifyAuth();
  return projectService.deleteSection(projectId, sectionId);
}

export async function updateSettingsAction(payload: any) {
  await verifyAuth();
  const valid = SettingsSchema.parse(payload);
  return settingsService.updateSettings(valid);
}

import { unstable_cache } from "next/cache";

export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {}
) {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate ?? 60,
    tags: options.tags ?? [],
  });
}

export const CACHE_TAGS = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  blog: "blog",
  blogPost: (slug: string) => `blog:${slug}`,
  experiences: "experiences",
  settings: "settings",
  media: (projectId?: string) => `media:${projectId || "all"}`,
  knowledge: "knowledge",
} as const;

export function revalidateTag(tag: string) {
  // This is a no-op at runtime, used with next/cache
  // Actual revalidation happens via revalidatePath in server actions
}
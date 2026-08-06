export const sectionRegistry = {
  "rich-text": () => import("@/components/sections/rich-text"),
  "gallery": () => import("@/components/sections/gallery"),
} as const;

export type SectionComponentKey = keyof typeof sectionRegistry;

import { z } from "zod";

export const ProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  description: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable().or(z.literal("")),
  repository: z.string().optional().nullable().or(z.literal("")),
  liveDemo: z.string().optional().nullable().or(z.literal("")),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  client: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  projectType: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  status: z.string().optional(),
  seoTitle: z.string().max(70, "SEO title should not exceed 70 characters").optional().nullable(),
  seoDescription: z.string().max(160, "SEO description should not exceed 160 characters").optional().nullable(),
  seoImage: z.string().optional().nullable().or(z.literal("")),
});

export const ProjectSectionSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  props: z.record(z.string(), z.any()).optional().nullable(),
});

export const SettingsSchema = z.object({
  siteTitle: z.string().min(2, "Site title must be at least 2 characters"),
  description: z.string().min(5, "Site description must be at least 5 characters"),
  contactEmail: z.string().email("Must be a valid email address").optional().nullable().or(z.literal("")),
  socialLinks: z.record(z.string(), z.string().url("Social link must be a valid URL")).optional().nullable(),
  seoDefaults: z.object({
    ogImage: z.string().url().optional().nullable(),
    twitterHandle: z.string().optional().nullable(),
  }).optional().nullable(),
});

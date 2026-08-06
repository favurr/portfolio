"use client";

import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiShadcnui,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiPrisma,
  SiNeon,
  SiMongodb,
  SiZod,
  SiResend,
  SiPnpm,
  SiBun,
  SiBiome,
  SiVercel,
  SiCloudflare,
  SiDocker,
} from "react-icons/si";

interface TechBadgeProps {
  slug: string;
}

const TECH_CONFIG: Record<
  string,
  { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  typescript: { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  react: { name: "React", icon: SiReact, color: "#61DAFB" },
  nextjs: { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
  tailwindcss: { name: "Tailwind CSS v4", icon: SiTailwindcss, color: "#06B6D4" },
  shadcnui: { name: "shadcn/ui", icon: SiShadcnui, color: "#ffffff" },
  nodejs: { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  express: { name: "Express", icon: SiExpress, color: "#ffffff" },
  postgresql: { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  prisma: { name: "Prisma ORM", icon: SiPrisma, color: "#2D3748" },
  neon: { name: "Neon Postgres", icon: SiNeon, color: "#00E599" },
  mongodb: { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  betterauth: { name: "Better Auth", icon: SiNextdotjs, color: "#61DAFB" },
  zod: { name: "Zod", icon: SiZod, color: "#3E67B1" },
  resend: { name: "Resend", icon: SiResend, color: "#ffffff" },
  pnpm: { name: "pnpm", icon: SiPnpm, color: "#F69220" },
  bun: { name: "Bun", icon: SiBun, color: "#FBF0DF" },
  biome: { name: "Biome", icon: SiBiome, color: "#60A5FA" },
  vercel: { name: "Vercel", icon: SiVercel, color: "#ffffff" },
  cloudflare: { name: "Cloudflare R2", icon: SiCloudflare, color: "#F38020" },
  docker: { name: "Docker", icon: SiDocker, color: "#2496ED" },
};

export function TechBadge({ slug }: TechBadgeProps) {
  const item = TECH_CONFIG[slug];
  if (!item) return null;

  const Icon = item.icon;

  return (
    <span
      className="group flex items-center gap-2 font-mono text-xs text-foreground bg-muted/40 hover:bg-muted border border-border/60 rounded-md px-3 py-1.5 transition-all cursor-default"
      style={{ ["--brand-color" as string]: item.color }}
    >
      <Icon className="w-3.5 h-3.5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:text-[var(--brand-color)] transition-all duration-300" />
      <span>{item.name}</span>
    </span>
  );
}

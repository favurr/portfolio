"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import gsap from "gsap";
import Image from "next/image";

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImage?: string | null;
  liveDemo?: string | null;
  repository?: string | null;
}

interface ProjectListProps {
  projects: ProjectItem[];
}

function getProjectTags(slug: string) {
  if (slug.includes("hermes")) return ["NEXTJS", "TAILWIND", "GSAP", "POSTGRES"];
  if (slug.includes("shippost")) return ["REACT", "TAILWIND", "OPENAI", "VERCEL"];
  return ["NEXTJS", "TAILWIND", "GSAP", "PRISMA"];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = floatingRef.current;
    if (!el) return;

    // Mirror the cursor dot exactly: xPercent/yPercent center it, x/y track the mouse.
    // Position off-screen initially so first hover has no visible travel.
    gsap.set(el, { xPercent: -50, yPercent: -50, x: -9999, y: -9999, opacity: 0, scale: 0.9 });

    // quickTo: the only thing that drives position — never call gsap.set(x/y) after this
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const handleMouseEnter = (id: string, img?: string | null) => {
    setHoveredId(id);
    if (!img) return;
    setActiveImage(img);

    // Only animate opacity + scale — x/y are driven purely by quickTo above
    gsap.to(floatingRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    gsap.to(floatingRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.25,
      ease: "power2.in",
    });
  };

  const isAnyHovered = hoveredId !== null;

  return (
    <>
      {/* Floating cursor image — mirrors the cursor dot technique exactly */}
      <div
        ref={floatingRef}
        className="pointer-events-none fixed top-0 left-0 z-50 overflow-hidden shadow-2xl"
        style={{ width: "420px", height: "260px" }}
      >
        {activeImage && (
          <Image
            src={activeImage}
            alt="Project Preview"
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col divide-y divide-border/40">
        {projects.map((project) => {
          const tags = getProjectTags(project.slug);
          const isHovered = hoveredId === project.id;
          const isDimmed = isAnyHovered && !isHovered;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              onMouseEnter={() => handleMouseEnter(project.id, project.featuredImage)}
              onMouseLeave={handleMouseLeave}
              className="group/item relative block py-8"
              style={{
                opacity: isDimmed ? 0.3 : 1,
                transition: "opacity 300ms ease",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <h3 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
                    {project.title}
                  </h3>
                  <p className="font-sans text-sm sm:text-base text-muted-foreground line-clamp-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-widest shrink-0 self-start md:self-auto">
                  <div className="flex items-center gap-2">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="relative w-4 h-4 text-foreground ml-1">
                    <ArrowUpRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-100 group-hover/item:opacity-0 group-hover/item:scale-75" />
                    <ArrowRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

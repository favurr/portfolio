import Link from "next/link";
import { projectDal } from "@/dal/project";
import { ProjectsAnimations } from "./components/ProjectsAnimations";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const revalidate = 60; // Cache parameters

export const metadata = {
  title: "Selected Work | Favurr — Design Engineer",
  description: "Explore selected full-stack applications, AI trading systems, and design engineering projects built by Favurr.",
};

export default async function ProjectsPage() {
  const projects = await projectDal.getPublishedProjects();
  const totalCount = projects.length;

  return (
    <ProjectsAnimations>
      <main className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-6xl">
          {/* Hero Section */}
          <div className="max-w-4xl mb-16 md:mb-20">
            <div className="projects-hero-text font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Selected Work
            </div>
            <h1 className="projects-hero-text font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
              Crafted with <span className="italic font-normal">purpose</span> <br className="hidden sm:block" />
              &amp; precision.
            </h1>
            <p className="projects-hero-text font-sans mt-8 text-base sm:text-lg text-muted-foreground max-w-[54ch] leading-relaxed">
              A curated index of production applications, AI systems, and interactive digital products engineered for performance, security, and memorable user experiences.
            </p>
          </div>

          {/* Bento Projects Grid Section */}
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center text-muted-foreground font-mono text-sm">
              No projects published yet. Authenticate at Studio to toggle visibility settings.
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-x-8 gap-y-12">
              {projects.map((project, index) => {
                // Determine Bento Grid classes based on list index
                let gridSpanClass = "col-span-12"; // Default fallback (Row 1: 1st project full width)
                let aspectClass = "aspect-[21/9]";

                if (index === 0) {
                  // Slot 1: Spans full width
                  gridSpanClass = "col-span-12";
                  aspectClass = "aspect-[21/9] md:aspect-[21/8]";
                } else if (index === 1 || index === 2) {
                  // Slots 2 & 3: Split row equally under Row 1
                  gridSpanClass = "col-span-12 md:col-span-6";
                  aspectClass = "aspect-video";
                } else if (index === 3) {
                  // Slot 4: Spans 3/4 width (grid columns 8 of 12)
                  gridSpanClass = "col-span-12 md:col-span-8";
                  aspectClass = "aspect-[16/10]";
                } else if (index === 4 || index === 5) {
                  // Slots 5 & 6: Stacked vertically in remaining 1/4 width (grid columns 4 of 12)
                  gridSpanClass = "col-span-12 md:col-span-4";
                  aspectClass = "aspect-[4/3] md:aspect-[1.5/1]";
                } else {
                  // Remainder: Spans 1/4 row each (grid columns 3 of 12)
                  gridSpanClass = "col-span-12 sm:col-span-6 md:col-span-3";
                  aspectClass = "aspect-square";
                }

                // Format project index numbers
                const itemIndexStr = String(index + 1).padStart(2, "0");
                const totalCountStr = String(totalCount).padStart(2, "0");

                return (
                  <div key={project.id} className={`${gridSpanClass} space-y-4 group`}>
                    {/* Media Card Showcase wrapper */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="block overflow-hidden rounded-2xl border border-border/60 bg-muted/10 relative cursor-pointer"
                    >
                      <div className={`${aspectClass} w-full relative overflow-hidden`}>
                        {project.featuredImage?.endsWith(".mp4") ? (
                          <video
                            src={project.featuredImage}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <img
                            src={project.featuredImage || "/placeholder.jpg"}
                            alt={project.title}
                            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500 ease-out"
                          />
                        )}
                        
                        {/* Overlay status tag for Work In Progress / Archived states */}
                        {project.status !== "live" && (
                          <span className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded bg-background/90 text-foreground border border-border/40 backdrop-blur z-10">
                            {project.status}
                          </span>
                        )}

                        {/* Top-right sliding projectType tags falling banner on card hover */}
                        {project.projectType && project.projectType.length > 0 && (
                          <div className="absolute top-0 right-4 flex flex-col items-end gap-1.5 transform -translate-y-full opacity-0 group-hover:translate-y-4 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
                            {project.projectType.map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded bg-foreground text-background font-bold shadow-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Meta Spec Bar underneath the card */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-mono pt-1 text-muted-foreground">
                      <div className="col-span-10 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground/60">{project.year || "2026"}</span>
                          <span className="text-border/40">&bull;</span>
                          <Link href={`/projects/${project.slug}`} className="hover:underline">
                            <span className="font-sans text-sm font-medium text-foreground tracking-tight">
                              {project.title}
                            </span>
                          </Link>
                          <span className="text-border/40">|</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                            {project.category || "Design Dev"}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/50">
                          <span>{project.device || "Universal"}</span>
                          <span className="px-1.5 font-sans">|</span>
                          <span>{project.industry || "General"}</span>
                        </div>
                      </div>

                      {/* Calculated Project Index Tag */}
                      <div className="col-span-2 text-right self-start font-mono text-[10px] text-muted-foreground/45 pt-0.5">
                        {itemIndexStr} / {totalCountStr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Banner */}
          <div className="mt-28 border-t border-border/40 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                Have a project vision in mind?
              </h3>
              <p className="font-sans text-sm text-muted-foreground mt-1">
                Let's turn your idea into a performant digital asset.
              </p>
            </div>
            <a
              href="mailto:ceo.emeka@favurr.site"
              className="group/btn font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-muted/30 hover:bg-muted text-foreground px-6 py-3 rounded-full transition-all inline-flex items-center gap-2"
            >
              <span>Get In Touch</span>
              <span className="relative w-3.5 h-3.5 inline-block">
                <ArrowUpRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-300 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
                <ArrowRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-300 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
              </span>
            </a>
          </div>
        </div>
      </main>
    </ProjectsAnimations>
  );
}

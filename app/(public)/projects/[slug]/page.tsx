import Link from "next/link";
import { notFound } from "next/navigation";
import { projectDal } from "@/dal/project";
import { SectionRenderer } from "@/components/project/section-renderer";
import { ProjectDetailAnimations } from "./components/ProjectDetailAnimations";
import { ArrowUpRight, ArrowRight, ArrowLeft } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await projectDal.getProjectBySlug(slug);

  // Block archived projects from public view
  if (!project || project.status === "archived") {
    return { title: "Project Not Found | Favurr" };
  }

  return {
    title: `${project.title} — Case Study | Favurr`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await projectDal.getProjectBySlug(slug);

  // Block archived projects from public view
  if (!project || project.status === "archived") {
    notFound();
  }

  // Fetch count of published projects in database
  const activeCount = await projectDal.getActiveProjectsCount();

  // Fetch next & previous projects in sequence
  const nextProject = await projectDal.getNextProject(project.order, project.id);
  const prevProject = await projectDal.getPreviousProject(project.order, project.id);

  return (
    <ProjectDetailAnimations>
      <main className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-6xl">
          {/* Top Bar Navigation */}
          <div className="project-hero-text flex items-center justify-between mb-16 pb-6 border-b border-border/40">
            <Link
              href="/projects"
              className="group/back inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover/back:-translate-x-1" />
              <span>Back to Selected Work</span>
            </Link>
            <div className="flex items-center gap-3">
              {project.status === "in progress" && (
                <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  Work in Progress
                </span>
              )}
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Project Archive <span aria-hidden="true">&bull;</span> {project.year || "2026"}
              </span>
            </div>
          </div>

          {/* Hero Headline & Intro Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
            <div className="lg:col-span-8 space-y-6">
              <span className="project-hero-text font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {project.category || "Design Engineering"}
              </span>
              <h1 className="project-hero-text font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.05]">
                {project.title}
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pt-10 space-y-6">
              <p className="project-hero-text font-sans text-base sm:text-lg text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Action Buttons */}
              <div className="project-hero-text flex flex-wrap gap-4 pt-2">
                {project.liveDemo && (
                  <a
                    href={project.liveDemo}
                    target="_blank"
                    rel="noreferrer"
                    className="group/btn active:scale-97 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-5 py-3 rounded-full transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <span>Visit Live Site</span>
                    <span className="relative w-3.5 h-3.5 inline-block">
                      <ArrowUpRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-200 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
                      <ArrowRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-200 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
                    </span>
                  </a>
                )}
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="group/btn active:scale-97 font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-muted/20 hover:bg-muted text-foreground px-5 py-3 rounded-full transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <span>Repository</span>
                    <span className="relative w-3.5 h-3.5 inline-block">
                      <ArrowUpRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-200 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
                      <ArrowRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-200 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* New Expanded Details Spec Grid */}
          <div className="project-hero-text grid grid-cols-2 md:grid-cols-5 gap-8 border-y border-border/40 py-8 mb-20 font-mono text-xs">
            {project.client && (
              <div>
                <span className="block text-muted-foreground uppercase tracking-widest mb-1.5 text-[10px]">Client</span>
                <span className="block text-foreground font-sans text-sm font-medium">{project.client}</span>
              </div>
            )}
            {project.duration && (
              <div>
                <span className="block text-muted-foreground uppercase tracking-widest mb-1.5 text-[10px]">Timeline</span>
                <span className="block text-foreground font-sans text-sm font-medium">{project.duration}</span>
              </div>
            )}
            {project.role && (
              <div>
                <span className="block text-muted-foreground uppercase tracking-widest mb-1.5 text-[10px]">My Role</span>
                <span className="block text-foreground font-sans text-sm font-medium">{project.role}</span>
              </div>
            )}
            {project.device && (
              <div>
                <span className="block text-muted-foreground uppercase tracking-widest mb-1.5 text-[10px]">Device</span>
                <span className="block text-foreground font-sans text-sm font-medium">{project.device}</span>
              </div>
            )}
            {project.projectType && project.projectType.length > 0 && (
              <div>
                <span className="block text-muted-foreground uppercase tracking-widest mb-1.5 text-[10px]">Focus</span>
                <span className="block text-foreground font-sans text-sm font-medium truncate" title={project.projectType.join(", ")}>
                  {project.projectType.join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Brand Introduction Overview Block (Prose Styled Markdown) */}
          {project.overview && (
            <div className="project-hero-text max-w-4xl mb-24 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">Overview</span>
              <div
                className="prose prose-invert max-w-none text-muted-foreground text-base sm:text-lg leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground prose-a:text-foreground prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.overview) }}
              />
            </div>
          )}

          {/* Hero Featured Showcase Image */}
          {project.featuredImage && (
            <div className="project-featured-image mb-28 overflow-hidden rounded-2xl border border-border/60 bg-muted/20 aspect-[16/9] w-full">
              {project.featuredImage.endsWith(".mp4") ? (
                <video src={project.featuredImage} autoPlay muted loop className="w-full h-full object-cover object-top" />
              ) : (
                <img
                  src={project.featuredImage}
                  alt={project.title}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>
          )}

          {/* CMS Dynamic Content Sections */}
          <SectionRenderer sections={project.sections} />

          {/* Previous / Next Projects Navigation Footer Section */}
          {activeCount > 1 && (
            <div className="mt-32 border-t border-border/40">
              {activeCount === 2 ? (
                // Only show next project when exactly 2 projects exist (both reference each other)
                nextProject && nextProject.id !== project.id ? (
                  <Link
                    href={`/projects/${nextProject.slug}`}
                    className="group/next flex flex-col justify-between p-8 sm:p-10 bg-muted/5 hover:bg-muted/10 transition-all duration-300 rounded-none w-full"
                  >
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                        Next Project <span aria-hidden="true">&rarr;</span>
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/80 tracking-wider">
                        <span>{nextProject.year || "2026"}</span>
                        {nextProject.client && (
                          <>
                            <span aria-hidden="true">&bull;</span>
                            <span>{nextProject.client}</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-serif text-2xl sm:text-3xl text-foreground font-normal tracking-tight group-hover/next:text-muted-foreground transition-colors">
                        {nextProject.title}
                      </h4>
                      <p className="font-sans text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                        {nextProject.description}
                      </p>
                    </div>
                  </Link>
                ) : null
              ) : (
                // Show both Previous & Next loops when count > 2
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                  {/* Previous Project Link */}
                  {prevProject && (
                    <Link
                      href={`/projects/${prevProject.slug}`}
                      className="group/prev flex flex-col justify-between p-8 sm:p-10 bg-muted/5 hover:bg-muted/10 transition-all duration-300 rounded-none"
                    >
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          <span aria-hidden="true">&larr;</span> Previous Project
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/80 tracking-wider">
                          <span>{prevProject.year || "2026"}</span>
                          {prevProject.client && (
                            <>
                              <span aria-hidden="true">&bull;</span>
                              <span>{prevProject.client}</span>
                            </>
                          )}
                        </div>
                        <h4 className="font-serif text-2xl sm:text-3xl text-foreground font-normal tracking-tight group-hover/prev:text-muted-foreground transition-colors">
                          {prevProject.title}
                        </h4>
                        <p className="font-sans text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {prevProject.description}
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Next Project Link */}
                  {nextProject && (
                    <Link
                      href={`/projects/${nextProject.slug}`}
                      className="group/next flex flex-col justify-between p-8 sm:p-10 bg-muted/5 hover:bg-muted/10 transition-all duration-300 rounded-none text-right items-end"
                    >
                      <div className="space-y-2 w-full">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          Next Project <span aria-hidden="true">&rarr;</span>
                        </span>
                        <div className="flex items-center justify-end gap-2 font-mono text-[11px] text-muted-foreground/80 tracking-wider">
                          <span>{nextProject.year || "2026"}</span>
                          {nextProject.client && (
                            <>
                              <span aria-hidden="true">&bull;</span>
                              <span>{nextProject.client}</span>
                            </>
                          )}
                        </div>
                        <h4 className="font-serif text-2xl sm:text-3xl text-foreground font-normal tracking-tight group-hover/next:text-muted-foreground transition-colors">
                          {nextProject.title}
                        </h4>
                        <p className="font-sans text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {nextProject.description}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Contact CTA Banner */}
          <div className="mt-20 border-t border-border/40 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-serif text-2xl sm:text-4xl text-foreground font-normal">
                Every story deserves to be <span className="italic font-normal">beautifully </span>told.
              </h3>
              <p className="font-sans text-sm max-w-110 text-muted-foreground mt-2">
                Let's create timeless images that celebrate your moments, preserve your memories, and tell your story with intention.
              </p>
            </div>
            <a
              href="mailto:ceo.emeka@favurr.site"
              className="group/btn active:scale-97 font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-muted/30 hover:bg-muted text-foreground px-6 py-3.5 rounded-full transition-all duration-200 inline-flex items-center gap-2"
            >
              <span>Book a Session</span>
              <span className="relative w-3.5 h-3.5 inline-block">
                <ArrowUpRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-300 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
                <ArrowRight className="w-3.5 h-3.5 absolute inset-0 transition-all duration-300 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
              </span>
            </a>
          </div>
        </div>
      </main>
    </ProjectDetailAnimations>
  );
}

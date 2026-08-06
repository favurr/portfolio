import Link from "next/link";
import { projectDal } from "@/dal/project";
import { FolderKanban, Plus, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

export default async function StudioDashboard() {
  const projects = await projectDal.getProjects();
  const publishedCount = projects.filter((p) => p.published).length;
  const draftCount = projects.length - publishedCount;

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Command Center</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-foreground">
            Studio <span className="italic font-normal">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-muted/20 hover:bg-muted text-foreground px-5 py-3 rounded-full transition-all inline-flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>
          <Link
            href="/studio/projects"
            className="font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-5 py-3 rounded-full transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage CMS</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-border/60 bg-muted/10 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total Projects</span>
          <div className="font-serif text-4xl text-foreground font-normal">{projects.length}</div>
        </div>
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">Published Live</span>
          <div className="font-serif text-4xl text-emerald-400 font-normal">{publishedCount}</div>
        </div>
        <div className="p-6 rounded-2xl border border-border/60 bg-muted/10 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Draft Mode</span>
          <div className="font-serif text-4xl text-muted-foreground font-normal">{draftCount}</div>
        </div>
      </div>

      {/* Recent Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground font-normal">Recent CMS Entries</h2>
          <Link
            href="/studio/projects"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="border border-border/40 rounded-2xl divide-y divide-border/40 overflow-hidden bg-muted/10">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-mono text-xs">
              No projects created yet. Click "+ Manage CMS" to add your first project.
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-serif text-xl text-foreground font-normal">{project.title}</div>
                  <div className="font-mono text-xs text-muted-foreground">/{project.slug}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      project.published
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-muted/40 text-muted-foreground border-border"
                    }`}
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

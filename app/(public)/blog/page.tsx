import { blogDal } from "@/dal/blog";
import { TransitionLink } from "@/components/transition-provider";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export const revalidate = 60; // Cache for 60 seconds

export const metadata = {
  title: "Thoughts & Stories | Favurr",
  description: "Read the latest essays, photography notes, design thoughts, and creative process writeups by Emeka.",
};

export default async function BlogPage() {
  const posts = await blogDal.getPublishedPosts();

  return (
    <main className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-background">
      <div className="mx-auto w-full max-w-5xl">
        {/* Editorial Header */}
        <div className="max-w-3xl mb-20">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Writer & Photographer
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
            Thoughts &amp; <br />
            <span className="italic font-normal">Process.</span>
          </h1>
          <p className="font-sans mt-8 text-base sm:text-lg text-muted-foreground max-w-[50ch] leading-relaxed">
            A quiet space where I share notes on visual culture, photography techniques, creative experiments, and behind-the-scenes stories of my ventures.
          </p>
        </div>

        {/* Blog Post List */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/40 p-16 text-center text-muted-foreground font-mono text-xs">
            No essays or notes published yet. Keep an eye out.
          </div>
        ) : (
          <div className="space-y-16">
            {posts.map((post) => {
              const dateStr = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null;

              return (
                <article
                  key={post.id}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pb-16 border-b border-border/20 last:border-b-0"
                >
                  {/* Left block - Date & Tags */}
                  <div className="md:col-span-3 space-y-4">
                    {dateStr && (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-muted/20 text-muted-foreground border border-border/40"
                          >
                            <Tag className="w-2 h-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right block - Title, excerpt & cover image */}
                  <div className="md:col-span-9 space-y-6">
                    <TransitionLink href={`/blog/${post.slug}`} className="block group/title">
                      <h2 className="font-serif text-2xl sm:text-3xl text-foreground group-hover/title:text-muted-foreground transition-colors leading-snug font-normal">
                        {post.title}
                      </h2>
                    </TransitionLink>

                    {post.coverImage && (
                      <TransitionLink
                        href={`/blog/${post.slug}`}
                        className="block aspect-[21/9] w-full overflow-hidden rounded-xl border border-border/40 bg-muted/10 relative"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                      </TransitionLink>
                    )}

                    {post.excerpt && (
                      <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[65ch]">
                        {post.excerpt}
                      </p>
                    )}

                    <div>
                      <TransitionLink
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground hover:text-muted-foreground transition-all"
                      >
                        <span>Read Essay</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </TransitionLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

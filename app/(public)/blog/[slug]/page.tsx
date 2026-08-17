import { blogDal } from "@/dal/blog";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/transition-provider";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 60; // Cache for 60 seconds

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await blogDal.getPostBySlug(slug);

  if (!post || post.status !== "published") {
    return { title: "Post Not Found | Favurr" };
  }

  return {
    title: `${post.title} | Favurr`,
    description: post.excerpt || "Read this essay on Favurr.",
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await blogDal.getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-background">
      <div className="mx-auto w-full max-w-3xl">
        {/* Back Link */}
        <div className="mb-12">
          <TransitionLink
            href="/blog"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Thoughts</span>
          </TransitionLink>
        </div>

        {/* Post Metadata Header */}
        <header className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {dateStr && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/20 border border-border/40 text-[9px]"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-foreground tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-sans text-lg text-muted-foreground leading-relaxed italic border-l-2 border-border/60 pl-4 py-1">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/20 mb-16 relative">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Editorial Body Content */}
        <div 
          className="blog-content prose prose-invert max-w-none font-sans text-base leading-relaxed text-muted-foreground space-y-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />
      </div>
    </article>
  );
}

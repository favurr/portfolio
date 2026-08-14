import { ProjectList } from "@/components/project/ProjectList";
import { projectDal } from "@/dal/project";
import { blogDal } from "@/dal/blog";
import { experienceDal } from "@/dal/experience";
import { TransitionLink } from "@/components/transition-provider";
import { ArrowRight, ArrowUpRight, Calendar } from "lucide-react";
import { HomeAnimations } from "./components/HomeAnimations";
import Image from "next/image";
import { Marquee } from "@/components/shared/marquee";

const SKILLS = [
  "TypeScript", "Next.js", "React", "Node.js", 
  "PostgreSQL", "Prisma ORM", "Tailwind CSS", "System Design"
]

export default async function Home() {
  const featured = await projectDal.getPublishedProjects();
  const latestPosts = await blogDal
    .getPublishedPosts()
    .then((posts) => posts.slice(0, 3));
  const experiences = await experienceDal.getVisibleExperiences();

  return (
    <HomeAnimations>
      {/* 1. Hero Section */}
      <section className="relative min-h-screen md:min-h-dvh flex flex-col justify-between overflow-hidden py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-background">
        {/* Full-bleed high-end background video */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover select-none pointer-events-none"
          >
            <source src="/bg-hero.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Warm cinematic tungsten/bronze blend overlay mask */}
        <div className="absolute inset-0 z-1 w-full h-full bg-linear-to-b from-background/10 via-background/20 to-background backdrop-blur-[1px]" />

        <div className="mx-auto w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Side: Content */}
          <div className="max-w-4xl absolute top-[-50] left-[-90] text-left lg:col-span-8">
            {/* Top badges / meta tags */}
            <div className="hero-text flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-foreground mb-8">
              <span>Fullstack &amp; Frontend Engineer</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] normal-case tracking-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-foreground font-semibold">
                  Available for contract
                </span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-text font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
              Building high-performance <br className="hidden sm:block" />{" "}
              digital <span className="italic font-normal">architectures.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-text font-sans mt-8 text-base sm:text-lg text-foreground/90 max-w-[54ch] leading-relaxed">
              I design robust backend systems and craft frictionless frontend
              interfaces that translate complex logic into premium,
              high-fidelity user experiences.
            </p>
          </div>
        </div>

        {/* Static Scroll hint with bounce animation */}
        <div className="hero-text mt-8 flex z-10 justify-end w-full max-w-6xl mx-auto">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1 select-none animate-bounce">
            Scroll &darr;
          </span>
        </div>
      </section>

      {/* 2. About Section */}
      <section
        id="about"
        className="relative reveal-trigger border-t border-border/40 py-32 px-6 sm:px-8 lg:px-12 bg-background overflow-hidden"
      >
        {/* Soft slate-blue ambient glow spot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-[radial-gradient(circle,rgba(14,165,233,0.018),transparent_70%)] blur-3xl pointer-events-none select-none -z-10" />

        <div className="mx-auto max-w-4xl text-center flex flex-col items-center justify-center">
          <blockquote className="font-serif text-3xl sm:text-5xl lg:text-6xl text-foreground font-light tracking-tight leading-tight max-w-[32ch] italic text-center">
            "I'm Emeka Favour Ezeamaka &mdash; a full-stack design engineer
            building fast, secure, and visually memorable web products."
          </blockquote>
          <div className="md:col-span-7 space-y-4">
            <p className="font-sans max-w-180 mt-12 text-base sm:text-lg text-foreground/90 leading-relaxed">
              I help startups and growing brands gain a competitive advantage by
              building high-performance full-stack web applications. I see code
              not just as logic, but as digital architecture built to perform
              and scale.
            </p>
            <p className="font-sans max-w-180 text-base text-muted-foreground leading-relaxed">
              Based in Lagos, Nigeria. When I'm not writing clean code, you'll
              find me listening to music, playing video games, studying user
              interfaces, or enjoying plantain.
            </p>
          </div>

          <div className="pt-4 w-full">
            <div className="md:col-span-5 flex gap-6 flex-row items-center overflow-hidden">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold shrink-0 mb-0">
                Core Stack
              </h4>

              <div className="relative flex overflow-hidden w-full [--duration:20s] [--gap:0.5rem]">
                <Marquee className="py-1 [--gap:0.5rem]">
                  {SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="bg-muted/40 border border-border/40 rounded-full px-3 py-1 font-mono text-[10px] text-foreground/80 tracking-wide shrink-0 whitespace-nowrap"
                    >
                      {skill}
                    </span>
                  ))}
                </Marquee>

                {/* Fading edge gradients */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Selected Projects Section */}
      <section
        id="projects"
        className="projects-section border-t border-border/40 py-24 px-6 sm:px-8 lg:px-12 bg-background"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Left Label */}
          <div className="lg:col-span-1">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
              Selected Work [{featured.length}]
            </h2>
          </div>
          {/* Right Content */}
          <div className="lg:col-span-3">
            {featured.length === 0 ? (
              <div className="rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground font-mono text-sm">
                <p>
                  CMS projects currently in draft status. Authenticate at Studio
                  to toggle visibility settings.
                </p>
              </div>
            ) : (
              <ProjectList projects={featured} />
            )}
          </div>
        </div>
      </section>

      {/* 3. Experience Section */}
      <section
        id="experience"
        className="experience-section border-t border-border/40 py-24 px-6 sm:px-8 lg:px-12 bg-background"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Left Label */}
          <div className="lg:col-span-1">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
              Featured Ventures
            </h2>
          </div>
          {/* Right Content */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            {experiences.length === 0 ? (
              <div className="rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground font-mono text-sm">
                No ventures listed yet. Authenticate at Studio to add experience
                logs.
              </div>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="exp-item flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/30 last:border-b-0"
                >
                  <div className="max-w-[85%]">
                    <h3 className="text-lg font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {exp.company}{" "}
                      {exp.description && (
                        <span className="normal-case font-sans block mt-1.5 text-muted-foreground/80 font-normal leading-relaxed text-xs">
                          {exp.description}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-2 sm:mt-0 shrink-0">
                    {exp.startDate} &mdash; {exp.endDate || "Present"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Blog/Thoughts Section */}
      <section
        id="blog"
        className="blog-section border-t border-border/40 py-24 px-6 sm:px-8 lg:px-12 bg-background"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-baseline mb-12 pb-4 border-b border-border/20">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Latest Notes
            </h2>
            <TransitionLink
              href="/blog"
              className="group/all inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground hover:text-muted-foreground transition-all"
            >
              <span>View all notes</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/all:translate-x-1" />
            </TransitionLink>
          </div>

          {latestPosts.length === 0 ? (
            <div className="rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground font-mono text-xs">
              No blog posts published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => {
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
                    className="group flex flex-col justify-between p-6 rounded-xl border border-border/30 hover:border-border/80 bg-muted/5 transition-all h-full gap-6"
                  >
                    <div className="space-y-3">
                      {dateStr && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          <span>{dateStr}</span>
                        </div>
                      )}
                      <TransitionLink
                        href={`/blog/${post.slug}`}
                        className="block"
                      >
                        <h3 className="text-xl font-normal text-foreground group-hover:text-muted-foreground transition-colors font-serif leading-snug">
                          {post.title}
                        </h3>
                      </TransitionLink>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <TransitionLink
                      href={`/blog/${post.slug}`}
                      className="font-mono text-xs uppercase tracking-widest text-foreground hover:text-muted-foreground transition-all inline-flex items-center gap-1.5 mt-auto pt-2"
                    >
                      <span>Read Note</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </TransitionLink>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. Contact Section */}
      <section
        id="contact"
        className="relative reveal-trigger border-t border-border/40 py-8 px-6 sm:px-8 lg:px-12 bg-background overflow-hidden"
      >
        {/* Soft amber/copper ambient glow spot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[radial-gradient(circle,rgba(217,119,6,0.145),transparent_70%)] blur-3xl pointer-events-none select-none" />

        <div className="mx-auto max-w-4xl text-center flex flex-col items-center justify-center relative z-10">
          <h3 className="font-serif text-5xl sm:text-7xl text-foreground font-normal tracking-tight max-w-[20ch] leading-[1.15]">
            Let's build something{" "}
            <span className="italic font-normal">exceptional</span>
          </h3>
          <p className="font-sans mt-8 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[50ch]">
            Whether you are scaling a backend platform, designing a design
            system, or looking to build a premium frontend experience, I'd love
            to collaborate.
          </p>

          <div className="mt-12">
            <a
              href="mailto:ceo.emeka@favurr.site"
              className="group/link font-serif text-3xl sm:text-5xl text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-3"
            >
              ceo.emeka@favurr.site
              <span className="relative w-8 h-8 inline-block">
                <ArrowUpRight className="w-8 h-8 absolute inset-0 transition-all duration-300 opacity-100 group-hover/link:opacity-0 group-hover/link:scale-75" />
                <ArrowRight className="w-8 h-8 absolute inset-0 transition-all duration-300 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" />
              </span>
            </a>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-12 font-mono text-xs uppercase tracking-widest text-muted-foreground border-t border-border/20 pt-8 w-full max-w-2xl">
            <a
              href="https://github.com/Favourokereke"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </section>
    </HomeAnimations>
  );
}

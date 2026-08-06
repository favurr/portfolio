import Link from "next/link";
import { AboutAnimations } from "./components/AboutAnimations";
import { TechBadge } from "./components/TechBadge";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About | Favurr — Design Engineer",
  description: "Learn more about Favurr, a full-stack design engineer building polished, high-performance web applications and digital experiences.",
};

export default function AboutPage() {
  const experiences = [
    {
      role: "Senior Software Engineer",
      company: "FAVURR Identity Systems",
      type: "Contract",
      period: "2024 — Present",
      description: "Leading design system architecture and high-performance web applications with Next.js, TypeScript, and custom motion systems.",
    },
    {
      role: "Lead Full Stack Developer",
      company: "MERN & Responsive Platform Projects",
      type: "Remote",
      period: "2022 — 2024",
      description: "Architected end-to-end full-stack web platforms, API infrastructures, and modern responsive user interfaces.",
    },
    {
      role: "Frontend Engineer & UX Designer",
      company: "Google UX Design Architect Projects",
      type: "Lagos",
      period: "2020 — 2022",
      description: "Crafted accessible component libraries, interactive user flows, and micro-animations for high-growth tech initiatives.",
    },
  ];

  const techStack = [
    {
      category: "Frontend & Styling",
      slugs: ["typescript", "react", "nextjs", "tailwindcss", "shadcnui"],
    },
    {
      category: "Backend & Database",
      slugs: ["nodejs", "express", "postgresql", "prisma", "neon", "mongodb"],
    },
    {
      category: "Auth & Validation",
      slugs: ["betterauth", "zod", "resend"],
    },
    {
      category: "Dev Tools & Storage",
      slugs: ["pnpm", "bun", "biome", "vercel", "cloudflare", "docker"],
    },
  ];

  return (
    <AboutAnimations>
      <main className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header Section */}
          <div className="max-w-4xl">
            <div className="about-hero-text font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              About Me
            </div>
            <h1 className="about-hero-text font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
              Obsessed with <span className="italic font-normal">craft</span> <br className="hidden sm:block" />
              &amp; performance.
            </h1>
            <p className="about-hero-text font-sans mt-8 text-base sm:text-lg text-muted-foreground max-w-[54ch] leading-relaxed">
              I'm a full-stack design engineer bridging the gap between design vision and technical execution. Building fast, accessible, and visually memorable web products.
            </p>
          </div>

          {/* Detailed Biography Section */}
          <section className="about-reveal mt-24 border-t border-border/40 pt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-1">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
                Philosophy
              </h2>
            </div>
            <div className="lg:col-span-3 space-y-6 text-foreground/90 font-sans text-base sm:text-lg leading-relaxed max-w-[65ch]">
              <p>
                My name is Emeka Favour Ezeamaka. Online and professionally, I go by <strong className="text-foreground font-medium">Favurr</strong> (pronounced "favour"). 
              </p>
              <p className="text-muted-foreground">
                I don't see websites as just pages on the internet &mdash; I see them as core business assets that generate measurable results. My mission is to help growing brands and startups gain an unfair advantage by building secure, high-performance full-stack applications with smooth user experiences.
              </p>
              <blockquote className="border-l-2 border-foreground/30 pl-4 italic text-foreground text-lg sm:text-xl font-serif py-1 my-4">
                "Behind the scene, Beyond the screen."
              </blockquote>
              <p className="text-muted-foreground">
                To me, users only see the finished interface, but real quality comes from everything happening underneath: the architecture, security, performance, maintainability, and intentional engineering decisions that make a product built to scale.
              </p>
              <p className="text-muted-foreground">
                Outside of building software products and reusable AI tools (like my trading assistant Hermes and launch platform Shippost), you'll find me listening to music, playing video games, exploring photography, or enjoying plantain.
              </p>
            </div>
          </section>

          {/* Work History Section */}
          <section className="about-reveal mt-24 border-t border-border/40 pt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-1">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
                Experience
              </h2>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-10">
              {experiences.map((exp, i) => (
                <div key={i} className="pb-8 border-b border-border/30 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <h3 className="text-xl font-semibold text-foreground">{exp.role}</h3>
                    <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {exp.company} &bull; {exp.type}
                  </p>
                  <p className="font-sans mt-3 text-sm text-muted-foreground leading-relaxed max-w-[60ch]">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Stack */}
          <section className="about-reveal mt-24 border-t border-border/40 pt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-1">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
                My Stack
              </h2>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {techStack.map((stack, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                    <span className="font-mono text-xs text-muted-foreground/60">0{i + 1}</span>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
                      {stack.category}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {stack.slugs.map((slug) => (
                      <TechBadge key={slug} slug={slug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA banner */}
          <section className="about-reveal mt-24 border-t border-border/40 pt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-1">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Next Steps
              </h2>
            </div>
            <div className="lg:col-span-3">
              <h3 className="font-serif text-3xl sm:text-5xl text-foreground font-normal">
                You dream it, <span className="italic font-normal">I code it.</span>
              </h3>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <a
                  href="mailto:ceo.emeka@favurr.site"
                  className="group/link font-serif text-2xl sm:text-3xl text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-2"
                >
                  ceo.emeka@favurr.site
                  <span className="relative w-5 h-5 inline-block">
                    <ArrowUpRight className="w-5 h-5 absolute inset-0 transition-all duration-300 opacity-100 group-hover/link:opacity-0 group-hover/link:scale-75" />
                    <ArrowRight className="w-5 h-5 absolute inset-0 transition-all duration-300 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" />
                  </span>
                </a>
                <Link
                  href="/contact"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-border hover:border-foreground transition-all py-1"
                >
                  Or fill out inquiry form
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AboutAnimations>
  );
}

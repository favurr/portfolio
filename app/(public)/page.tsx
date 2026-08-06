import { ProjectList } from "@/components/project/ProjectList";
import { projectDal } from "@/dal/project";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HomeAnimations } from "./components/HomeAnimations";
import Image from "next/image";

export default async function Home() {
  const featured = await projectDal.getFeaturedProjects();

  return (
    <HomeAnimations>
      {/* 1. Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden py-16 md:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="max-w-4xl text-left lg:col-span-7">
            {/* Top badges / meta tags */}
            <div className="hero-text flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              <span>Photographer & Videographer</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] normal-case tracking-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground font-medium">
                  {" "}
                  Available{" "}
                </span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-text font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
              Capturing stories <br className="hidden sm:block" /> that leave a
              lasting <span className="italic font-normal">impression</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-text font-sans mt-8 text-base sm:text-lg text-muted-foreground max-w-[54ch] leading-relaxed">
              I create timeless photographs and cinematic films that help
              individuals, brands, and businesses tell stories with
              authenticity, creativity, and intention.
            </p>
          </div>

          {/* Right Side: Image Placeholder */}
          <div className="hero-text w-full flex justify-center lg:justify-end lg:col-span-5">
            <div className="relative w-full ">
              <Image
                src="/bg-hero.png"
                alt="Photographer Portrait"
                fill
                className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
        </div>

        {/* Static Scroll hint without bounce animation */}
        <div className="hero-text mt-8 flex justify-end w-full max-w-6xl mx-auto">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase flex items-center gap-1 select-none">
            Scroll &darr;
          </span>
        </div>
      </section>

      {/* 2. About Section */}
      <section
        id="about"
        className="reveal-trigger border-t border-border/40 py-24 px-6 sm:px-8 lg:px-12 bg-background"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Left Sticky label block */}
          <div className="lg:col-span-1">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
              About
            </h2>
          </div>
          {/* Right main content block */}
          <div className="lg:col-span-3 reveal-text">
            <h3 className="font-serif text-3xl sm:text-4xl text-foreground leading-snug tracking-tight font-medium">
              I'm a photographer and videographer passionate about transforming
              moments into compelling visual stories. I work with individuals,
              businesses, and growing brands to create imagery that feels
              authentic, memorable, and impactful.
            </h3>
            <p className="font-sans mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              I don't see photography and filmmaking as simply capturing what's
              in front of the camera—I see them as powerful tools for preserving
              memories, communicating identity, and building brands people
              remember.
            </p>
            <p className="font-sans mt-4 text-base text-muted-foreground leading-relaxed">
              Based in Lagos, Nigeria. When I'm not behind the camera or editing
              my latest project, you'll probably find me exploring new
              locations, studying visual storytelling, listening to music,
              playing video games, or enjoying plantain.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs text-muted-foreground pt-6 border-t border-border/40">
              <span>Photography</span>
              <span>Videography</span>
              <span>Portrait Photography</span>
              <span>Event Coverage</span>
              <span>Commercial Photography</span>
              <span>Brand Content</span>
              <span>Product Photography</span>
              <span>DaVinci Resolve</span>
              <span>Adobe Lightroom</span>
              <span>Adobe Premiere Pro</span>
              <span>Color Grading</span>
            </div>
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
            <div className="exp-item flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/30">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Founder &amp; Creative Director
                </h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  Favurr Studios / Kingdom Creatives &bull; Independent
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground mt-2 sm:mt-0">
                Present
              </span>
            </div>

            <div className="exp-item flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/30">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Commercial Photography
                </h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  Helping businesses create premium visual content that builds
                  trust, strengthens their brand, and connects with their
                  audience.
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground mt-2 sm:mt-0">
                2024 &mdash; Present
              </span>
            </div>

            <div className="exp-item flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Portrait & Lifestyle Photography
                </h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  Creating timeless portraits and lifestyle imagery that capture
                  genuine personality and emotion.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500 mt-2 sm:mt-0">
                2024
              </span>
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

      {/* 5. Contact Section */}
      <section
        id="contact"
        className="reveal-trigger border-t border-border/40 py-24 px-6 sm:px-8 lg:px-12 bg-background"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Left Label */}
          <div className="lg:col-span-1">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold lg:sticky lg:top-24">
              Contact
            </h2>
          </div>
          {/* Right Content */}
          <div className="lg:col-span-3 reveal-text">
            <h3 className="font-serif text-4xl sm:text-6xl text-foreground font-normal tracking-tight">
              Let's create something{" "}
              <span className="italic font-normal">unforgettable</span>
            </h3>
            <p className="font-sans mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
              Whether you're planning a wedding, launching a brand, promoting a
              product, or simply want to capture a meaningful moment, I'd love
              to hear your story.
            </p>

            <div className="mt-10">
              <a
                href="mailto:ceo.emeka@favurr.site"
                className="group/link font-serif text-2xl sm:text-4xl text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-2"
              >
                ceo@favour.site
                <span className="relative w-6 h-6 inline-block">
                  <ArrowUpRight className="w-6 h-6 absolute inset-0 transition-all duration-300 opacity-100 group-hover/link:opacity-0 group-hover/link:scale-75" />
                  <ArrowRight className="w-6 h-6 absolute inset-0 transition-all duration-300 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" />
                </span>
              </a>
            </div>

            <div className="mt-16 flex flex-wrap gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <a
                href="https://github.com/Favourokereke"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </HomeAnimations>
  );
}

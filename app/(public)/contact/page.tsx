import { ContactForm } from "./components/ContactForm";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact | Favurr — Design Engineer",
  description: "Get in touch with Favurr for full-stack engineering, custom design systems, or collaboration inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen py-16 md:py-24 px-6 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header Section */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Get In Touch
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.1]">
            Let's work <span className="italic font-normal">together</span>
          </h1>
          <p className="font-sans mt-8 text-base sm:text-lg text-muted-foreground max-w-[52ch] leading-relaxed">
            Have a project in mind, or want to give your growing brand an unfair advantage? Send a message directly or reach out via email.
          </p>
        </div>

        {/* Form & Direct Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-border/40 pt-16">
          {/* Left Direct Contact Info */}
          <div className="lg:col-span-4 space-y-10">
            <div>
              <span className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Direct Email
              </span>
              <a
                href="mailto:ceo.emeka@favurr.site"
                className="group/link font-serif text-2xl text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-2"
              >
                <span>ceo.emeka@favurr.site</span>
                <span className="relative w-4 h-4 inline-block">
                  <ArrowUpRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-100 group-hover/link:opacity-0 group-hover/link:scale-75" />
                  <ArrowRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" />
                </span>
              </a>
            </div>

            <div>
              <span className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Location
              </span>
              <p className="font-sans text-base text-foreground">
                Lagos, Nigeria <span className="text-muted-foreground font-mono text-xs">(WAT / GMT+1)</span>
              </p>
            </div>

            <div>
              <span className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Social Profiles
              </span>
              <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <a
                  href="https://github.com/Favourokereke"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Github
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Linkedin
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
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}

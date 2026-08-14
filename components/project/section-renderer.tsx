import dynamic from "next/dynamic";
import { sectionRegistry, type SectionComponentKey } from "@/config/section-registry";

interface SectionRendererProps {
  sections: Array<{
    id: string;
    componentKey: string;
    title?: string | null;
    subtitle?: string | null;
    content?: string | null;
    props?: any;
  }>;
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <div className="flex flex-col space-y-20 md:space-y-32">
      {sections.map((section, idx) => {
        const key = section.componentKey as SectionComponentKey;
        if (!(key in sectionRegistry)) {
          return (
            <div key={section.id} className="mx-auto max-w-6xl px-6 py-8 border border-destructive/30 bg-destructive/10 text-destructive rounded-xl font-mono text-sm">
              Missing component definition for componentKey: <span className="font-mono font-bold">{section.componentKey}</span>
            </div>
          );
        }

        const LazyComponent = dynamic(sectionRegistry[key] as any) as React.ComponentType<any>;

        return (
          <section
            key={section.id}
            className="project-section-reveal border-t border-border/40 pt-16 md:pt-24"
            data-animation={section.props?.animation || "slide"}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Section Index / Header Header */}
              <div className="lg:col-span-3 lg:sticky lg:top-28">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-3">
                  0{idx + 1} &bull; Section
                </span>
                {section.title && (
                  <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-medium tracking-tight">
                    {section.title}
                  </h2>
                )}
                {section.subtitle && (
                  <p className="font-sans mt-3 text-sm text-muted-foreground leading-relaxed">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Right Section Main Content */}
              <div className="lg:col-span-9">
                <LazyComponent
                  content={section.content}
                  props={section.props}
                />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

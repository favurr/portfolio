"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProjectDetailAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero entrance
      if (containerRef.current?.querySelector(".project-hero-text")) {
        gsap.from(".project-hero-text", {
          y: 40,
          opacity: 0,
          duration: 1.0,
          stagger: 0.1,
          ease: "power4.out",
        });
      }

      // 2. Featured Image reveal
      if (containerRef.current?.querySelector(".project-featured-image")) {
        gsap.from(".project-featured-image", {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2,
        });
      }

      // 3. Dynamic Section reveals
      const sections = gsap.utils.toArray(".project-section-reveal");
      sections.forEach((section: any) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

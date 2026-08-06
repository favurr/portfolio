"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero text reveal
      if (containerRef.current?.querySelector(".projects-hero-text")) {
        gsap.from(".projects-hero-text", {
          y: 40,
          opacity: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: "power4.out",
        });
      }

      // 2. Project List Item Stagger Reveal
      const items = gsap.utils.toArray(".group\\/item");
      if (items.length > 0) {
        items.forEach((item: any) => {
          gsap.from(item, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

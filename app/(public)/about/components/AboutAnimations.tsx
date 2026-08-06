"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AboutAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero text reveal
      gsap.from(".about-hero-text", {
        y: 40,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: "power4.out",
      });

      // 2. Scroll triggers for about sub-sections
      const revealContainers = gsap.utils.toArray(".about-reveal");
      revealContainers.forEach((container: any) => {
        gsap.from(container, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
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

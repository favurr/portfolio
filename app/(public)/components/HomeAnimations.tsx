"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomeAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline (triggers immediately on mount)
      if (containerRef.current?.querySelector(".hero-text")) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(".hero-text", {
          y: prefersReduced ? 0 : 40,
          opacity: 0,
          duration: prefersReduced ? 0.3 : 1.0,
          stagger: prefersReduced ? 0.05 : 0.1,
        });
      }

      // 2. Dynamic Scroll Trigger for Text Reveals (.reveal-trigger container wraps .reveal-text)
      const revealContainers = gsap.utils.toArray(".reveal-trigger");
      revealContainers.forEach((container: any) => {
        const textElement = container.querySelector(".reveal-text");
        if (textElement) {
          gsap.from(textElement, {
            y: prefersReduced ? 0 : 50,
            opacity: 0,
            duration: prefersReduced ? 0.3 : 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      // 3. Staggered reveal for Project Items in ProjectList
      if (containerRef.current?.querySelector(".group\\/item")) {
        gsap.from(".group\\/item", {
          y: prefersReduced ? 0 : 30,
          opacity: 0,
          duration: prefersReduced ? 0.3 : 0.8,
          stagger: prefersReduced ? 0.04 : 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".projects-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // 4. Staggered reveal for Experience Items
      if (containerRef.current?.querySelector(".exp-item")) {
        gsap.from(".exp-item", {
          x: prefersReduced ? 0 : -20,
          opacity: 0,
          duration: prefersReduced ? 0.3 : 0.8,
          stagger: prefersReduced ? 0.05 : 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".experience-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col">
      {children}
    </div>
  );
}

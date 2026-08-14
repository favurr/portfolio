"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function LayoutAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── Smooth Scroll ──────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Watch for dynamic container height changes (such as client transitions or images loading)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Entry Animations ───────────────────────────────────────────────────
    const ctx = gsap.context(() => {
      gsap.from(".site-header", {
        y: prefersReduced ? 0 : -20,
        opacity: 0,
        duration: prefersReduced ? 0.3 : 0.8,
        ease: "power2.out",
      });
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-350 selection:bg-zinc-800 selection:text-zinc-100"
    >
      {children}
    </div>
  );
}

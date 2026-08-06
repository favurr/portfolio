"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function LayoutAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

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

    // ── Cursor Dot ─────────────────────────────────────────────────────────
    const dot = cursorDotRef.current;
    if (!dot) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(dot, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.6, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // Show cursor only when mouse is inside the viewport
    const onMouseEnter = () => {
      gsap.to(dot, { opacity: 1, duration: 0.3, ease: "power2.out" });
    };

    const onMouseLeave = () => {
      gsap.to(dot, { opacity: 0, duration: 0.3, ease: "power2.in" });
    };

    window.addEventListener("mousemove", onMouseMove);
    // document fires mouseenter/mouseleave when cursor enters/exits the browser window
    document.documentElement.addEventListener("mouseenter", onMouseEnter);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    // ── Entry Animations ───────────────────────────────────────────────────
    const ctx = gsap.context(() => {
      gsap.from(".site-header", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-350 selection:bg-zinc-800 selection:text-zinc-100"
    >
      {/* Cursor follower dot — hidden until mouse enters viewport */}
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2.5 w-2.5 rounded-full bg-foreground mix-blend-difference"
      />
      {children}
    </div>
  );
}

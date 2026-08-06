"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Vertical curtain wipe for client-side navigation.
 * On pathname change: a bar scales up from the bottom covering the viewport,
 * holds briefly while React swaps the page content underneath,
 * then scales down from the top revealing the new page.
 */
export function PageTransition() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  // Guarantee the curtain is invisible on mount via GSAP (not inline styles)
  useEffect(() => {
    if (curtainRef.current) {
      gsap.set(curtainRef.current, { scaleY: 0, transformOrigin: "bottom" });
    }
  }, []);

  useEffect(() => {
    // Skip animation on first mount — the loading screen handles that
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only animate if the pathname actually changed
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const curtain = curtainRef.current;
    if (!curtain) return;

    // Scroll to top instantly so the new page starts at the top
    window.scrollTo(0, 0);

    const tl = gsap.timeline();

    // Wipe in from bottom
    tl.set(curtain, { transformOrigin: "bottom", scaleY: 0 });
    tl.to(curtain, {
      scaleY: 1,
      duration: 0.4,
      ease: "power4.inOut",
    });

    // Brief hold, then switch origin for exit
    tl.set(curtain, { transformOrigin: "top" }, "+=0.05");

    // Wipe out to top — reveals new page content
    tl.to(curtain, {
      scaleY: 0,
      duration: 0.4,
      ease: "power4.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[9998] bg-background pointer-events-none"
      style={{ transform: "scaleY(0)", transformOrigin: "bottom" }}
    />
  );
}

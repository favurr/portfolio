"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (curtainRef.current) {
      gsap.set(curtainRef.current, { scaleY: 0, transformOrigin: "bottom" });
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const curtain = curtainRef.current;
    if (!curtain) return;

    window.scrollTo(0, 0);

    const tl = gsap.timeline();

    tl.set(curtain, { transformOrigin: "bottom", scaleY: 0 });
    tl.to(curtain, {
      scaleY: 1,
      duration: 0.4,
      ease: "power4.inOut",
    });

    tl.set(curtain, { transformOrigin: "top" }, "+=0.05");

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
      className="fixed inset-0 z-9998 bg-background pointer-events-none"
      style={{ transform: "scaleY(0)", transformOrigin: "bottom" }}
    />
  );
}

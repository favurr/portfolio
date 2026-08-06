"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const line = lineRef.current;
    const subtitle = subtitleRef.current;
    const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];

    if (!overlay || !line || !subtitle || letters.length === 0) {
      // Bail safely — still call onComplete so the app isn't stuck
      onComplete();
      return;
    }

    // Set initial states
    gsap.set(letters, { y: 60, opacity: 0, rotateX: -90 });
    gsap.set(line, { scaleX: 0 });
    gsap.set(subtitle, { opacity: 0, y: 10 });

    // One single timeline — no nested callbacks
    const tl = gsap.timeline({
      onComplete,
    });

    // 1. Letters stagger in
    tl.to(letters, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "power4.out",
    });

    // 2. Line expands
    tl.to(line, {
      scaleX: 1,
      duration: 0.5,
      ease: "power3.inOut",
    }, "-=0.25");

    // 3. Subtitle appears
    tl.to(subtitle, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    }, "-=0.15");

    // 4. Hold
    tl.to({}, { duration: 0.5 });

    // 5. Everything fades out together
    tl.to([...letters, line, subtitle], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power3.in",
    });

    // 6. Overlay slides up and away — last step in the same timeline
    tl.to(overlay, {
      yPercent: -100,
      duration: 0.7,
      ease: "power4.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  const name = "FAVURR";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      style={{ perspective: "600px", willChange: "transform" }}
    >
      <div
        className="flex items-center justify-center gap-[0.04em] select-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {name.split("").map((char, i) => (
          <span
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            className="font-serif text-6xl sm:text-8xl md:text-9xl font-medium tracking-[0.05em] text-foreground inline-block"
            style={{ transformOrigin: "center bottom" }}
          >
            {char}
          </span>
        ))}
      </div>

      <div
        ref={lineRef}
        className="mt-6 h-px w-24 bg-foreground/40 origin-center"
      />

      <span
        ref={subtitleRef}
        className="mt-4 font-sans text-[11px] uppercase tracking-[0.35em] text-muted-foreground font-medium"
      >
        Design &amp; Engineering
      </span>
    </div>
  );
}

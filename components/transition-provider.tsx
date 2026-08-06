"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

interface TransitionContextType {
  navigateWithTransition: (href: string) => void;
  curtainRef: React.RefObject<HTMLDivElement | null>;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function useTransitionNavigator() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransitionNavigator must be used within a TransitionProvider");
  }
  return context;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isNavigatingRef = useRef(false);

  // Monitor pathname changes to trigger the curtain reveal phase
  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain || !isNavigatingRef.current) return;

    // The route change has completed. Reset flag.
    isNavigatingRef.current = false;

    // 3. Sweep the curtain away towards the top to reveal the new page content.
    gsap.set(curtain, { transformOrigin: "top" });
    gsap.to(curtain, {
      scaleY: 0,
      duration: 0.45,
      ease: "power4.inOut",
      onComplete: () => {
        setIsTransitioning(false);
      },
    });
  }, [pathname]);

  const navigateWithTransition = useCallback((href: string) => {
    const curtain = curtainRef.current;
    if (!curtain) {
      router.push(href);
      return;
    }

    if (isTransitioning) return;

    // Normalize URLs to compare (ignore trailing slashes)
    const currentNormalized = pathname.replace(/\/$/, "") || "/";
    const targetNormalized = href.replace(/\/$/, "") || "/";

    // If navigating to the exact same page, just play a quick blink curtain wipe 
    // to give feedback without getting stuck on a blank route change state
    if (currentNormalized === targetNormalized) {
      setIsTransitioning(true);
      const tl = gsap.timeline();
      tl.set(curtain, { transformOrigin: "bottom", scaleY: 0 });
      tl.to(curtain, {
        scaleY: 1,
        duration: 0.35,
        ease: "power3.inOut",
      });
      tl.set(curtain, { transformOrigin: "top" }, "+=0.05");
      tl.to(curtain, {
        scaleY: 0,
        duration: 0.35,
        ease: "power3.inOut",
        onComplete: () => {
          setIsTransitioning(false);
        }
      });
      return;
    }

    setIsTransitioning(true);
    isNavigatingRef.current = true;

    // 1. Wipe curtain in from bottom to cover the screen.
    gsap.set(curtain, { transformOrigin: "bottom", scaleY: 0 });
    gsap.to(curtain, {
      scaleY: 1,
      duration: 0.45,
      ease: "power4.inOut",
      onComplete: () => {
        // 2. ONLY switch the route after the curtain has completely covered the view.
        router.push(href);
      },
    });
  }, [router, pathname, isTransitioning]);

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, curtainRef }}>
      {children}
      {/* Shared Transition Curtain overlay */}
      <div
        ref={curtainRef}
        className="fixed inset-0 z-9998 bg-background pointer-events-none"
        style={{ transform: "scaleY(0)", transformOrigin: "bottom" }}
      />
    </TransitionContext.Provider>
  );
}

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function TransitionLink({ href, children, onClick, ...props }: TransitionLinkProps) {
  const { navigateWithTransition } = useTransitionNavigator();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
      navigateWithTransition(href);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

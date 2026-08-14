"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa6";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const animatingRef = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-4 h-4 rounded-full" />;
  }

  const currentTheme = resolvedTheme || theme;

  const toggleTheme = async (event: React.MouseEvent) => {
    if (animatingRef.current) return;

    // No View Transition API support — plain swap
    if (!document.startViewTransition) {
      setTheme(currentTheme === "dark" ? "light" : "dark");
      return;
    }

    animatingRef.current = true;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    // ── Origin point: center of the button element ──────────────────────────
    // We read the rect synchronously (before any async work) so the position
    // is always accurate even if the navbar is sticky/transformed.
    const btn = buttonRef.current;
    const rect = btn?.getBoundingClientRect();

    // Fallback to click position if rect is unavailable
    const x = rect ? rect.left + rect.width / 2 : event.clientX;
    const y = rect ? rect.top + rect.height / 2 : event.clientY;

    // Max radius to reach the farthest viewport corner from the origin
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // ── View Transition ─────────────────────────────────────────────────────
    // startViewTransition:
    //   1. Captures a screenshot of the current page (old snapshot)
    //   2. Runs the callback — which updates the DOM to the new theme
    //   3. Captures a screenshot of the new page (new snapshot)
    //   4. Plays both snapshots as pseudo-elements on top of each other
    //
    // We then clip ::view-transition-new(root) to a growing circle,
    // revealing the new theme from the button origin.
    const transition = document.startViewTransition(() => {
      // Directly toggle the class on <html> so the DOM update is synchronous
      // inside the transition callback — next-themes reads this class.
      const root = document.documentElement;
      if (nextTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      // Keep next-themes in sync so it doesn't fight us on the next render
      setTheme(nextTheme);
    });

    // Wait for both snapshots to be captured
    await transition.ready;

    // Animate the new-theme snapshot from a pinpoint to full screen
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );

    await transition.finished;
    animatingRef.current = false;
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className="relative rounded-full text-foreground hover:text-foreground cursor-pointer transition-colors"
      aria-label="Toggle Theme"
    >
      {currentTheme === "dark" ? (
        <FaSun className="h-3.5 w-3.5" />
      ) : (
        <FaMoon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

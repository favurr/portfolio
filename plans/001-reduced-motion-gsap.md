# 001 — prefers-reduced-motion integration for GSAP

- **Status**: DONE
- **Commit**: 5bdf22c
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files (`app/(public)/components/HomeAnimations.tsx`, `app/(public)/components/LayoutAnimations.tsx`)

## Problem

The landing page and public layout use GSAP timeline animations for hero entry, header entry, text scroll reveals, and list staggers. However, these animations do not respect the user's system accessibility preference for reduced motion (`prefers-reduced-motion: reduce`). This can cause disorientation or motion sickness for sensitive users.

Verbatims:
- `app/(public)/components/HomeAnimations.tsx` lines 14-74:
```typescript
      // 1. Hero Entrance Timeline (triggers immediately on mount)
      if (containerRef.current?.querySelector(".hero-text")) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(".hero-text", {
          y: 40,
          opacity: 0,
          duration: 1.0,
          stagger: 0.1,
        });
      }
```

- `app/(public)/components/LayoutAnimations.tsx` lines 58-63:
```typescript
      gsap.from(".site-header", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
```

## Target

Respect `prefers-reduced-motion: reduce` dynamically by disabling all spatial translation offsets (e.g. `y`, `x`) while retaining essential opacity fades, ensuring page load remains clear and accessible.

```typescript
// Target layout animation structure checking matchesMedia
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.from(".site-header", {
  y: prefersReduced ? 0 : -20,
  opacity: 0,
  duration: prefersReduced ? 0.3 : 0.8,
  ease: "power2.out",
});
```

## Repo conventions to follow

- Client-side checks should use `window.matchMedia("(prefers-reduced-motion: reduce)").matches` inside `useEffect` logic.
- Animate opacity transition at shorter duration under reduced motion to keep transitions snappier.

## Steps

1. In `app/(public)/components/HomeAnimations.tsx`, check for reduced motion preference:
   ```typescript
   const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   ```
2. Update the Hero Entrance timeline in `HomeAnimations.tsx` to omit `y` translation offset when `prefersReduced` is true, and scale duration down to `0.3`:
   ```typescript
   tl.from(".hero-text", {
     y: prefersReduced ? 0 : 40,
     opacity: 0,
     duration: prefersReduced ? 0.3 : 1.0,
     stagger: prefersReduced ? 0.05 : 0.1,
   });
   ```
3. Update the Text Reveal ScrollTrigger animations in `HomeAnimations.tsx`:
   ```typescript
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
   ```
4. Update the Project Items reveal stagger in `HomeAnimations.tsx`:
   ```typescript
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
   ```
5. Update the Experience Items stagger in `HomeAnimations.tsx`:
   ```typescript
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
   ```
6. In `app/(public)/components/LayoutAnimations.tsx`, capture `prefersReduced`:
   ```typescript
   const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   ```
7. Update Header entrance animation in `LayoutAnimations.tsx` to respect reduced motion:
   ```typescript
   gsap.from(".site-header", {
     y: prefersReduced ? 0 : -20,
     opacity: 0,
     duration: prefersReduced ? 0.3 : 0.8,
     ease: "power2.out",
   });
   ```

## Boundaries

- Do NOT change any Lenis smooth scroll properties unless the platform detects it needs to be bypassed under reduced motion.
- Do NOT alter class names, element structural order, or layout tokens.

## Verification

- **Mechanical**: Run `npm run build` to verify there are no compilation errors.
- **Feel check**:
  1. Open Chrome DevTools, press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`), type "Rendering" and select "Show Rendering".
  2. Scroll down to "Emulate CSS media feature prefers-reduced-motion" and select "prefers-reduced-motion: reduce".
  3. Reload the landing page. Verify all components fade in cleanly without vertical or horizontal movement.

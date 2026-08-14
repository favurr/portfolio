# 003 — snappier cursor tracking and preview image follows

- **Status**: DONE
- **Commit**: 5bdf22c
- **Severity**: MEDIUM
- **Category**: Physicality / Cohesion
- **Estimated scope**: 2 files (`app/(public)/components/LayoutAnimations.tsx`, `components/project/ProjectList.tsx`)

## Problem

The cursor dot follower and the floating project preview follow card lag excessively behind the actual mouse pointer due to slow GSAP `quickTo` tween durations (`0.6` and `0.5` seconds respectively). This makes the interface feel heavy and sluggish instead of snap-responsive.

Verbatims:
- `app/(public)/components/LayoutAnimations.tsx` lines 34-35:
```typescript
    const xTo = gsap.quickTo(dot, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.6, ease: "power3.out" });
```

- `components/project/ProjectList.tsx` lines 43-44:
```typescript
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
```

## Target

Reduce the interpolation lag duration to standard snappier values (between `0.2` and `0.3` seconds) for a highly physical, lightweight cursor follow experience.

```typescript
// Target settings for quickTo
const xTo = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
const yTo = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });
```

## Repo conventions to follow

- GSAP `quickTo` is the preferred way to mutate coordinates dynamically. Keep using `power3.out` easing for speed deceleration.

## Steps

1. In `app/(public)/components/LayoutAnimations.tsx` lines 34-35, update duration parameter values from `0.6` to `0.25`:
   ```typescript
   const xTo = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
   const yTo = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });
   ```
2. In `components/project/ProjectList.tsx` lines 43-44, update duration parameter values from `0.5` to `0.3`:
   ```typescript
   const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "power3.out" });
   const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3.out" });
   ```

## Boundaries

- Do NOT change the cursor dot markup size, color, or shape.
- Do NOT alter coordinates offsets.

## Verification

- **Mechanical**: Run `npm run build` to verify there are no compilation errors.
- **Feel check**:
  1. Hover your cursor over the screen. Ensure the cursor follower dot tracks right behind the true cursor with minimal drift.
  2. Hover over projects in the list. The project preview card should glide under the cursor immediately and smoothly.

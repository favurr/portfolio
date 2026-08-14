# 002 — hover and touch pointer accessibility for ProjectList

- **Status**: DONE
- **Commit**: 5bdf22c
- **Severity**: MEDIUM
- **Category**: Accessibility / Physicality
- **Estimated scope**: 1 file (`components/project/ProjectList.tsx`)

## Problem

In `components/project/ProjectList.tsx`, hover effects are activated on all pointer devices including touch pointers (mobile/tablet). Because touch screens trigger `onMouseEnter` on a tap but do not consistently trigger `onMouseLeave` when releasing or tapping away, hover states (dimming other projects and displaying the floating preview image) can become permanently "stuck" on mobile screens. Additionally, under reduced motion, list opacity transitions should be simplified.

Verbatims:
- `components/project/ProjectList.tsx` lines 106-116:
```typescript
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              onMouseEnter={() => handleMouseEnter(project.id, project.featuredImage)}
              onMouseLeave={handleMouseLeave}
              className="group/item relative block py-8"
              style={{
                opacity: isDimmed ? 0.3 : 1,
                transition: "opacity 300ms ease",
              }}
            >
```

## Target

Ensure hover mouse-tracking preview animations and dimming states are only active on pointers that support hover capability (`@media (hover: hover) and (pointer: fine)`). Ensure the state checks are safe on mobile and disable opacity dimming if reduced motion is enabled.

## Repo conventions to follow

- Hover capability detection is natively done via CSS selectors or modern JS media queries.
- Respect reduced motion by dropping the opacity dimming effect.

## Steps

1. In `components/project/ProjectList.tsx`, add standard React hooks to track if the browser supports hover and reduced motion preferences:
   ```typescript
   const [hasHover, setHasHover] = useState(false);
   const [prefersReduced, setPrefersReduced] = useState(false);

   useEffect(() => {
     setHasHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
     setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
   }, []);
   ```
2. Update `onMouseEnter` trigger logic on the project `<Link>` element to only fire when `hasHover` is true:
   ```typescript
   onMouseEnter={() => hasHover && handleMouseEnter(project.id, project.featuredImage)}
   onMouseLeave={() => hasHover && handleMouseLeave()}
   ```
3. Update the inline style opacity computation to ignore dimming when `prefersReduced` is true:
   ```typescript
   style={{
     opacity: (isDimmed && !prefersReduced) ? 0.3 : 1,
     transition: "opacity 300ms ease",
   }}
   ```

## Boundaries

- Do NOT change project routing URLs, link layouts, or text colors.
- Do NOT disable tap animations on touch devices if they are non-stuck hover events.

## Verification

- **Mechanical**: Run `npm run build` to verify there are no compilation errors.
- **Feel check**:
  1. Open the website on a simulated mobile view in DevTools (Toggle Device Toolbar).
  2. Tap on a project item. Confirm that the preview popup image does NOT appear and other project items do not stay dimmed at 0.3 opacity.
  3. Verify keyboard tab focus still highlights/navigates correctly.

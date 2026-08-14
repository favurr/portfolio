# 004 — CSS transition curve token integration

- **Status**: DONE
- **Commit**: 5bdf22c
- **Severity**: LOW
- **Category**: Cohesion & Tokens
- **Estimated scope**: 1 file (`components/project/ProjectList.tsx`)

## Problem

In `components/project/ProjectList.tsx`, CSS transitions for project item hovers are configured using hardcoded `ease` functions. This does not reuse custom easing tokens, leading to potential inconsistency across CSS-animated list blocks.

Verbatims:
- `components/project/ProjectList.tsx` line 114:
```typescript
                transition: "opacity 300ms ease",
```

## Target

Align standard hover transitions with professional cubic-bezier easing tokens, making them consistent with the brand's layout animations.

```typescript
// Target CSS transition setting
transition: "opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)",
```

## Repo conventions to follow

- Easing custom properties (like `--ease-out`) are defined in global stylesheet tokens. In React inline styles, use their raw string equivalents if variables cannot be accessed.

## Steps

1. In `components/project/ProjectList.tsx` line 114, update the `transition` string value:
   ```typescript
   transition: "opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)",
   ```

## Boundaries

- Do NOT change structural styles (padding, borders, margins) of list link items.

## Verification

- **Mechanical**: Run `npm run build` to verify there are no compilation errors.
- **Feel check**:
  1. Hover slowly over project links. Observe that the opacity change starts rapidly and decelerates smoothly at the end.

# SHADCN.md

# shadcn/ui Guidelines

> Standards for using and extending shadcn/ui components.

shadcn/ui is the foundation of the component library—not the finished design.

Every component should feel native to the portfolio.

---

# Philosophy

Treat shadcn/ui as a starting point.

Do not build a website that looks like the default shadcn examples.

Customize thoughtfully while preserving accessibility.

---

# Principles

* Composition over customization.
* Accessibility over appearance.
* Consistency over novelty.
* Simplicity over complexity.

---

# Installation

* Use the official shadcn CLI.
* Only install components that are actually used.
* Avoid adding components "just in case."

Unused components should not exist in the codebase.

---

# Component Ownership

There are three categories of components:

### 1. Base Components

Directly from shadcn/ui.

Examples:

* Button
* Input
* Dialog
* Card
* Sheet

These should remain close to upstream unless customization is necessary.

---

### 2. Wrapped Components

Application-specific wrappers around shadcn components.

Examples:

* PrimaryButton
* ProjectCard
* SectionCard
* HeroButton

These contain project-specific styling and behavior.

---

### 3. Feature Components

Built from multiple base components.

Examples:

* Navbar
* ProjectHero
* Timeline
* Gallery
* ContactForm
* SectionRenderer

---

# Customization Rules

Allowed:

* New variants
* Better spacing
* Improved typography
* Additional accessibility
* Project-specific composition

Avoid:

* Rewriting components unnecessarily
* Breaking accessibility
* Large forks from upstream
* Modifying components without clear purpose

---

# Styling

Use Tailwind utilities.

Avoid custom CSS when utility classes are sufficient.

Maintain consistent spacing, radius, typography, and shadows across all components.

---

# Variants

Prefer variants over duplicate components.

Good:

* Button

  * default
  * secondary
  * outline
  * ghost
  * destructive

Avoid creating multiple button components for visual differences alone.

---

# Forms

Use shadcn form primitives with:

* React Hook Form
* Zod

Validation should be clear, accessible, and consistent.

---

# Dialogs

Dialogs should:

* Trap focus
* Support keyboard navigation
* Close predictably
* Avoid unnecessary nesting

Prefer sheets or drawers when appropriate.

---

# Tables

Use tables only for tabular data.

Do not use tables for layout.

---

# Cards

Cards should not become the default layout solution.

Ask first:

"Does this actually need a card?"

Whitespace and typography are often better than another bordered container.

---

# Icons

Use Lucide React exclusively.

Icons should support content—not replace it.

---

# Motion

Animations should be implemented with GSAP.

Avoid relying on CSS-only animations for major interactions.

See GSAP.md.

---

# Accessibility

Every customized component must preserve:

* Keyboard support
* Focus visibility
* Screen reader compatibility
* Semantic HTML
* ARIA attributes where appropriate

Never sacrifice accessibility for aesthetics.

---

# Updates

When updating shadcn/ui:

* Review breaking changes.
* Keep local customizations minimal.
* Prefer extending rather than heavily modifying upstream components.

---

# Guiding Principle

Every component should feel like it belongs to **this portfolio**, not like it was copied from a UI library.

Users should recognize the quality of the experience—not the framework behind it.

# AGENTS.md

> Source of truth for every AI agent, contributor, and future version of this project.

This document defines how this portfolio is designed, built, and maintained. If another document conflicts with this one, **AGENTS.md takes precedence**.

---

# Mission

Build a portfolio that feels handcrafted, premium, and memorable while remaining maintainable.

The portfolio is not just a collection of projects.

It is the best demonstration of my design thinking, engineering ability, and attention to detail.

Every decision should improve one of these:

* User experience
* Visual quality
* Performance
* Accessibility
* Maintainability
* Storytelling

---

# Core Principles

## 1. Quality over quantity

Never add a feature simply because other portfolios have it.

Every section must have a purpose.

If removing something improves clarity, remove it.

---

## 2. Simplicity wins

Choose the simplest solution that scales.

Avoid unnecessary abstractions.

Avoid premature optimization.

---

## 3. Story first

Projects should tell stories.

Visitors should understand:

* The problem
* The process
* The solution
* The outcome

Not just see screenshots.

---

## 4. Motion has purpose

Animations exist to:

* guide attention
* communicate hierarchy
* explain state
* improve perceived performance

Animations must never exist just because GSAP can do them.

---

## 5. Everything should feel intentional

Nothing should feel randomly placed.

Spacing, typography, animation, layout, colors, and interactions should feel connected.

---

# Design Philosophy

This project follows the philosophies popularized by high-quality frontend and design engineering references such as:

* frontend-design
* impeccable
* Emil Kowalski's design engineering approach
* Taste Skill

skills are located in .agents/skills

These are guiding principles—not templates to copy.

# AI Design Workflow

Every frontend task should follow this process.

## Phase 1 — Think

Apply the frontend-design philosophy.

* Define the visual thesis.
* Establish hierarchy.
* Remove unnecessary UI.
* Decide on composition before components.

## Phase 2 — Design

Apply Taste Skill.

* Infer layout from the brief.
* Choose an appropriate design system.
* Avoid generic AI layouts.
* Produce one cohesive visual direction.

## Phase 3 — Engineer

Apply Emil Kowalski's design engineering principles.

* Build interactions with purpose.
* Use GPU-friendly transforms.
* Respect reduced motion.
* Prioritize perceived performance.

## Phase 4 — Refine

Apply the Impeccable workflow.

* Audit
* Arrange
* Typeset
* Animate
* Polish

Do not consider a feature complete until all refinement passes have been applied.

## Design Rules

Prefer:

* whitespace over borders
* hierarchy over decoration
* typography over excessive colors
* composition over more components
* clarity over cleverness
* subtle motion over dramatic effects
* consistency over novelty

Avoid:

* generic hero sections
* random gradients
* unnecessary glassmorphism
* inconsistent spacing
* UI copied from component libraries without refinement
* placeholder content in production

---

# Engineering Philosophy

The codebase should be easy to understand months later.

Optimize for readability before cleverness.

Future AI agents should immediately understand how the project works.

---

# Technology

Follow STACK.md.

Do not introduce new technologies unless there is a clear reason.

If the existing stack already solves the problem, use it.

---

# Development Rules

## Components

Build small.

Compose larger interfaces from smaller components.

Avoid giant files.

Prefer composition over inheritance.

---

## Reusability

If something is repeated:

* twice → consider extracting it
* three times → extract it

Do not create reusable components prematurely.

---

## Naming

Use descriptive names.

Good:

* ProjectCard
* SectionRenderer
* ProjectHero

Bad:

* Card2
* Thing
* ComponentA

---

## Folder Organization

Keep folders predictable.

Group related files together.

Avoid deeply nested directories.

---

# CMS Rules

Projects are content.

Never hardcode project pages.

Every project must be rendered from CMS data.

The frontend should not care what order sections appear.

Instead:

Project

↓

Ordered Sections

↓

Section Renderer

↓

UI

This allows projects to feel unique while sharing the same system.

---

# Section System

Hero is always first.

Next Project is always last.

Everything else is reorderable.

Each section is self-contained.

Each section owns:

* rendering
* validation
* animations
* styles

The renderer only decides where to place it.

---

# Section Renderer

There should only be one renderer.

Never create:

* ProjectRendererV2
* AlternateRenderer
* CustomRenderer

Instead:

Improve the existing renderer.

---

# Data Access Layer (DAL)

All database access must go through the Data Access Layer.

Never query Prisma directly from:

* React components
* Pages
* Layouts
* Server Actions

Correct flow:

UI

↓

Server Action / Route Handler

↓

DAL

↓

Prisma

DAL responsibilities:

* database queries
* filtering
* pagination
* validation
* transformations

---

# GSAP

GSAP is the only animation library.

Do not introduce:

* Framer Motion
* Motion One
* Anime.js

Animation priorities:

1. Hero entrance
2. Scroll reveals
3. Section transitions
4. Page transitions
5. Hover interactions

Animation guidelines:

* Keep animations smooth.
* Avoid long delays.
* Avoid over-animating.
* Prefer timelines over scattered animations.
* Respect `prefers-reduced-motion`.
* Clean up animations properly.

See GSAP.md.

---

# Shadcn/UI

Use shadcn/ui as the component foundation.

Do not use components unchanged by default.

Every component should feel like part of the portfolio.

Customize:

* spacing
* typography
* sizing
* variants
* interactions

Avoid making the site look like a default shadcn template.

See COMPONENTS/SHADCN.md.

---

# Accessibility

Every feature should remain usable with:

* keyboard navigation
* screen readers
* reduced motion
* proper focus states

Accessibility is required, not optional.

---

# Performance

Performance is a feature.

Prefer:

* Server Components
* optimized images
* code splitting
* lazy loading
* dynamic imports when appropriate

Avoid unnecessary client components.

Avoid unnecessary JavaScript.

Measure before optimizing.

---

# SEO

Every page should include:

* metadata
* Open Graph
* canonical URL
* structured data where appropriate

Projects should generate SEO automatically.

See SEO.md.

---

# Styling

Use Tailwind CSS.

Avoid inline styles unless absolutely necessary.

Use design tokens.

Keep spacing consistent.

Maintain a clear visual rhythm.

---

# Error Handling

Never silently ignore errors.

Provide useful logs.

Fail gracefully.

---

# Documentation

Whenever architecture changes:

Update:

* PRODUCT.md
* ROADMAP.md
* CHANGELOG.md

If conventions change:

Update AGENTS.md.

Documentation is part of the project.

---

# Before Building Any Feature

Ask:

Does this improve the portfolio?

Does it improve maintainability?

Does it improve storytelling?

Does it improve the user experience?

If the answer is no, reconsider the implementation.

---

# Definition of Done

A feature is complete when it:

* works correctly
* is accessible
* performs well
* looks polished
* follows the design system
* follows project conventions
* is documented if necessary
* is maintainable
* does not introduce unnecessary complexity

If any of these are missing, the feature is not finished.


# How to work with me

A guide for contributors and future AI agents.

* use bunx instead of npx

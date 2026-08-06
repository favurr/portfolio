# STACK.md

# Technology Stack

> The official technology stack and engineering conventions for this project.

This document defines the technologies, libraries, patterns, and architectural decisions used throughout the portfolio. Any proposed additions should have a clear technical or product justification.

---

# Philosophy

The stack should prioritize:

* Simplicity
* Performance
* Developer experience
* Accessibility
* Type safety
* Scalability
* Long-term maintainability

Avoid adding dependencies that duplicate existing functionality.

---

# Frontend

## Framework

* Next.js (App Router)

Use React Server Components by default.

Only opt into Client Components when browser APIs, local state, or client-side interactivity are required.

---

## Language

* TypeScript

TypeScript should be used everywhere.

Avoid `any`.

Prefer strict typing.

---

## Runtime

* Node.js

Use the current supported LTS version unless project requirements dictate otherwise.

---

# Styling

## CSS Framework

* Tailwind CSS v4

Use utility-first styling.

Avoid custom CSS unless necessary.

---

## Component Library

* shadcn/ui

Use shadcn/ui as the design foundation.

Components should be customized to match the portfolio rather than appearing as default shadcn components.

See:

COMPONENTS/SHADCN.md

---

## Icons

* Lucide React

Avoid mixing multiple icon libraries.

---

## Fonts

Use self-hosted fonts through Next.js Font optimization whenever possible.

Typography should remain consistent across the application.

---

# Animation

## Library

* GSAP

GSAP is the only animation library used.

Use GSAP for:

* page transitions
* hero animations
* scroll-triggered animations
* stagger effects
* timeline-based animations
* interaction polish

Avoid introducing:

* Framer Motion
* Motion One
* Anime.js

See:

GSAP.md

---

# State Management

Prefer React's built-in capabilities.

Order of preference:

1. Server Components
2. URL state
3. React state
4. Context

Avoid global state unless genuinely required.

---

# Forms

Use:

* React Hook Form
* Zod

Validation should exist both on the client and the server.

---

# Authentication

Use:

* Better Auth

Authentication is only required for Studio.

The public portfolio should remain fully accessible.

---

# Database

## ORM

* Prisma

Prisma is the single source of truth for the database schema.

Do not bypass Prisma.

---

## Database

* PostgreSQL

Designed for structured relational data and future scalability.

---

## Data Access

All database operations must go through the Data Access Layer.

Never access Prisma directly from:

* components
* pages
* layouts
* server actions

See:

DAL.md

---

# Storage

## Images & Media

* Cloudflare R2

Use R2 for storing project assets and uploaded media.

Do not commit uploaded assets to the repository.

---

# Email

Use:

* Resend

Used for:

* contact form
* portfolio notifications
* future Studio notifications

---

# Validation

Use:

* Zod

Validation rules should be shared where possible.

Never trust client-side validation alone.

---

# Data Fetching

Prefer:

* Server Components
* Server Actions
* Route Handlers

Avoid unnecessary client-side fetching.

---

# Content Management

Projects are managed through Studio.

Projects should never be hardcoded into the application.

The frontend renders structured project data from the database.

---

# Project Architecture

High-level flow:

```text
Browser

↓

Next.js App

↓

Server Action / Route Handler

↓

Data Access Layer

↓

Prisma

↓

PostgreSQL
```

---

# File Upload Flow

```text
Studio

↓

Upload

↓

Cloudflare R2

↓

Database Reference

↓

Frontend Rendering
```

---

# Rendering Strategy

Prefer:

* Static rendering when appropriate
* Dynamic rendering only when necessary
* Incremental updates where beneficial

Choose the simplest rendering strategy that satisfies the product requirements.

---

# SEO

Use Next.js Metadata API.

Generate metadata dynamically for project pages.

Support:

* Open Graph
* Twitter Cards
* Canonical URLs
* Sitemap
* robots.txt
* Structured Data

See:

SEO.md

---

# Accessibility

Every feature should support:

* keyboard navigation
* focus management
* semantic HTML
* reduced motion
* screen readers

Accessibility is a core requirement.

---

# Performance

Prioritize:

* React Server Components
* Image optimization
* Code splitting
* Lazy loading
* Dynamic imports where appropriate
* Minimal JavaScript

Measure before optimizing.

---

# Error Handling

Provide meaningful error messages.

Fail gracefully.

Avoid exposing internal implementation details.

---

# Code Quality

Use:

* ESLint
* Prettier

Maintain consistent formatting and linting across the project.

---

# Testing

V1 does not require comprehensive automated testing.

Focus on:

* functionality
* responsiveness
* accessibility
* cross-browser compatibility

Testing strategy can expand in future versions.

---

# Deployment

Deploy using:

* Vercel

Production deployments should remain simple and repeatable.

---

# Dependency Rules

Before adding a dependency, ask:

* Does the framework already solve this?
* Can this be built with existing libraries?
* Is the maintenance cost justified?

Avoid dependency bloat.

---

# Future Stack

Potential future additions include:

* MDX support
* Search
* Analytics
* Real-time messaging
* Push notifications
* Desktop companion
* Mobile companion

Future technologies should integrate with the existing architecture rather than replacing it.

---

# Stack Principles

The stack should remain:

* modern
* stable
* performant
* accessible
* maintainable

Technology choices should support the product—not define it.

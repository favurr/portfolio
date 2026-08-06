# ARCHITECTURE.md

# System Architecture

> The canonical architecture for the portfolio.

This document defines how the application is structured, how data flows through the system, and where code belongs.

When in doubt, follow this document over personal preference.

---

# Architecture Philosophy

The portfolio should be:

* Server-first
* Content-driven
* Component-based
* CMS-powered
* Type-safe
* Scalable
* Maintainable
* Performance-focused

The architecture should make adding new projects require **zero frontend code**.

---

# High-Level Architecture

```text
Browser

↓

Next.js App Router

↓

Server Components
Client Components
Server Actions
Route Handlers

↓

Service Layer

↓

Data Access Layer (DAL)

↓

Prisma ORM

↓

PostgreSQL

↓

Cloudflare R2
```

Each layer has a single responsibility.

---

# Layers

## Browser

Responsible for:

* Rendering HTML
* User interaction
* Form submission
* Navigation

The browser never communicates directly with the database.

---

## Next.js

Responsible for:

* Routing
* Rendering
* Metadata
* Streaming
* Server Actions
* Route Handlers

Next.js coordinates the application.

It should not contain business logic.

---

## Server Components

Default rendering strategy.

Responsibilities:

* Fetch data
* Render HTML
* Compose layouts

Server Components may:

* call Services
* render UI

Server Components should never:

* mutate data
* access Prisma directly

---

## Client Components

Only when interactivity is required.

Examples:

* Forms
* Drag-and-drop
* GSAP animations
* Theme switching
* Rich interactions

Avoid unnecessary `"use client"`.

---

## Server Actions

Responsible for mutations.

Examples:

* Create project
* Publish project
* Upload media
* Reorder sections

Server Actions should:

* validate input
* verify authentication
* call Services
* revalidate cache

They should never access Prisma directly.

---

## Route Handlers

Used for:

* Better Auth
* Webhooks
* APIs
* File uploads
* External integrations

Keep Route Handlers thin.

---

# Service Layer

The Service Layer contains business logic.

Examples:

```text
publishProject()

duplicateProject()

uploadMedia()

reorderSections()

deleteProject()
```

Services coordinate multiple operations.

Example:

```text
Publish Project

↓

Validate

↓

Update Database

↓

Revalidate Cache

↓

Return Result
```

Services may call multiple DAL methods.

---

# Data Access Layer

The DAL is responsible only for database operations.

Responsibilities:

* queries
* inserts
* updates
* deletes
* transactions

Never place business logic inside the DAL.

See DAL.md.

---

# Prisma

Prisma translates DAL requests into SQL.

No other layer imports Prisma.

---

# Database

PostgreSQL is the source of truth.

Cloudflare R2 stores files.

The database stores metadata.

---

# Request Lifecycle

## Reading Data

```text
Browser

↓

Server Component

↓

Service

↓

DAL

↓

Prisma

↓

Database

↓

DAL

↓

Service

↓

Server Component

↓

Browser
```

---

## Mutating Data

```text
Browser

↓

Server Action

↓

Authentication

↓

Validation

↓

Service

↓

DAL

↓

Prisma

↓

Database

↓

Cache Revalidation

↓

Browser
```

---

# Folder Structure

```text
src/

app/

actions/

services/

dal/

components/

hooks/

lib/

types/

schemas/

config/

styles/
```

Every folder should have a clear responsibility.

---

# Component Architecture

```text
components/

ui/

layout/

navigation/

shared/

sections/

studio/
```

---

## UI

Customized shadcn/ui components.

Examples:

* Button
* Dialog
* Input
* Select

---

## Layout

Structural components.

Examples:

* Navbar
* Footer
* Container
* PageHeader

---

## Navigation

Navigation-specific components.

Examples:

* Desktop Navigation
* Mobile Navigation
* Breadcrumbs

---

## Shared

Reusable components used across multiple features.

Examples:

* EmptyState
* LoadingSpinner
* Badge
* SectionTitle

---

## Sections

Project content renderers.

Examples:

* Gallery
* Timeline
* Rich Text
* Metrics
* Tech Stack

---

## Studio

CMS components.

Examples:

* Sidebar
* Section Editor
* Media Picker
* Property Panel

---

# Section Registry

The application should never use a large switch statement.

Instead use a registry.

```ts
export const sectionRegistry = {
  hero: HeroSection,
  richText: RichTextSection,
  gallery: GallerySection,
  featureGrid: FeatureGridSection,
  techStack: TechStackSection,
  timeline: TimelineSection,
  metrics: MetricsSection,
  links: LinksSection,
}
```

Rendering becomes:

```text
Section

↓

Registry

↓

React Component

↓

Rendered UI
```

Adding a new section should only require:

* creating the component
* registering it
* adding the CMS editor

---

# Project Architecture

Each project consists of:

```text
Hero

↓

Ordered Sections

↓

Next Project
```

Only the Hero and Next Project positions are fixed.

Everything else is CMS-driven.

---

# Rendering Strategy

## Static

Use for:

* Home
* About

---

## ISR

Use for:

* Projects
* Project pages

Revalidate when content changes.

---

## Dynamic

Use only when required.

Examples:

* Studio
* Authentication
* User sessions

---

# Authentication

Authentication should occur inside the Studio layout.

Avoid middleware unless absolutely necessary.

Example:

```text
Studio Layout

↓

Check Session

↓

Redirect if Unauthorized

↓

Render Studio
```

---

# Validation

Every mutation should follow:

```text
Request

↓

Zod

↓

Service

↓

DAL
```

Never trust client input.

---

# Media

Files are uploaded to Cloudflare R2.

Database stores:

* URL
* key
* dimensions
* metadata

Large binaries never enter PostgreSQL.

---

# Caching

After successful mutations:

* revalidatePath()
* revalidateTag() (future)

The Service Layer owns cache invalidation.

---

# Animations

GSAP should live inside isolated Client Components.

Avoid turning entire pages into Client Components for animation.

---

# State Management

Prefer:

* Server Components
* URL state
* React state

Avoid introducing global state unless necessary.

If global state becomes necessary, evaluate it carefully before adding a library.

---

# Error Handling

Every layer should return meaningful errors.

```text
Database Error

↓

DAL

↓

Service

↓

Server Action

↓

User-friendly Message
```

Never expose internal errors to users.

---

# Future Scalability

The architecture should support future additions without restructuring.

Examples:

* Blog
* Chat
* Analytics
* AI
* Desktop app
* Mobile app
* Public API

Adding these features should extend the existing architecture rather than replace it.

---

# Guiding Principles

Before writing code, ask:

* Does this belong in the correct layer?
* Can an existing Service or DAL method be reused?
* Does this keep business logic out of the UI?
* Will this architecture still make sense in two years?

If the answer is **no**, redesign before implementing.

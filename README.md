# README.md

# Portfolio

A modern, CMS-driven portfolio built with Next.js, designed to showcase my work through polished storytelling, purposeful motion, and a maintainable content architecture.

The portfolio is both my personal website and one of my flagship projects. It demonstrates my approach to design, frontend engineering, backend architecture, accessibility, performance, and product thinking.

---

## Features

### Public Website

* Home
* About
* Projects
* Dynamic Project Pages
* Contact
* Responsive Design
* SEO Optimized
* GSAP Animations

### Studio

* Authentication
* Dashboard
* Project Management
* Dynamic Project Builder
* Section Reordering
* Media Management
* Portfolio Settings

---

## Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* GSAP
* Lucide React

### Backend

* Next.js Server Actions
* Route Handlers
* Better Auth

### Database

* PostgreSQL
* Prisma ORM

### Storage

* Cloudflare R2

### Validation

* Zod
* React Hook Form

### Email

* Resend

### Deployment

* Vercel

---

## Documentation

Project documentation lives in the repository root.

| Document             | Purpose                                |
| -------------------- | -------------------------------------- |
| AGENTS.md            | Project rules and AI development guide |
| PRODUCT.md           | Product vision and requirements        |
| ROADMAP.md           | Development roadmap                    |
| STACK.md             | Official technology stack              |
| SCHEMA.md            | Database architecture                  |
| DAL.md               | Data Access Layer architecture         |
| GSAP.md              | Animation guidelines                   |
| SEO.md               | SEO strategy                           |
| COMPONENTS/SHADCN.md | Component conventions                  |
| CHANGELOG.md         | Project history                        |
| docs/FUTURE.md       | Future ideas                           |

These documents are considered the project's source of truth.

---

## Project Structure

```text
src/
│
├── app/
├── components/
├── dal/
├── lib/
├── actions/
├── hooks/
├── types/
├── utils/
└── styles/
```

The exact structure may evolve, but should always remain simple and predictable.

---

## Architecture

```text
Browser

↓

Next.js

↓

Server Components
Server Actions
Route Handlers

↓

Data Access Layer

↓

Prisma

↓

PostgreSQL

↓

Cloudflare R2
```

---

## Development Principles

* Server Components by default.
* Client Components only when necessary.
* Business logic belongs in the DAL.
* Projects are managed through the Studio.
* Project pages are rendered dynamically.
* GSAP is the only animation library.
* Accessibility is required.
* Performance is a feature.
* SEO is built in from the beginning.

---

## Project Pages

Each project is generated from structured content.

A project consists of:

* Hero
* Ordered content sections
* Next Project

Only the Hero and Next Project positions are fixed.

All other sections are configurable through the Studio.

---

## Studio

The Studio allows complete management of the portfolio.

Supported functionality includes:

* Creating projects
* Editing projects
* Publishing projects
* Uploading media
* Reordering sections
* Managing portfolio settings

No frontend code should be required to add a new project.

---

## Animations

The project uses GSAP for all motion.

Animations are designed to:

* guide attention
* improve storytelling
* reinforce hierarchy
* enhance perceived performance

Animations should remain subtle, performant, and accessible.

---

## SEO

Every public page includes:

* Metadata
* Open Graph
* Twitter Cards
* Canonical URLs
* Structured Data
* Sitemap
* robots.txt

Project pages generate SEO dynamically.

---

## Accessibility

Accessibility is a first-class feature.

The application supports:

* Keyboard navigation
* Semantic HTML
* Focus management
* Screen readers
* Reduced motion

---

## Performance

The project prioritizes:

* Server Components
* Optimized images
* Minimal JavaScript
* Code splitting
* Lazy loading
* Fast page loads

Performance should never be sacrificed for unnecessary visual effects.

---

## Getting Started

Install dependencies.

```bash
pnpm install
```

Run the development server.

```bash
pnpm dev
```

Open your browser.

```text
http://localhost:3000
```

---

## Environment Variables

The project requires several environment variables.

Typical categories include:

* Database
* Authentication
* Cloudflare R2
* Email
* Application URL

Do not commit secrets to the repository.

---

## Deployment

Production deployment is handled through Vercel.

Before deployment:

* Configure environment variables.
* Run database migrations.
* Verify uploads.
* Verify authentication.
* Test SEO.
* Confirm accessibility.
* Check performance.

---

## Contributing

Before making changes:

1. Read **AGENTS.md**.
2. Review the relevant documentation.
3. Follow the established architecture.
4. Keep the codebase consistent.
5. Update documentation if necessary.
6. Update `CHANGELOG.md` for notable changes.

---

## Philosophy

This portfolio is built as a product—not a template.

Every feature, interaction, and design decision should contribute to a polished, memorable experience while keeping the codebase maintainable and scalable.

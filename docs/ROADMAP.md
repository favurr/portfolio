# ROADMAP.md

# Development Roadmap

> The implementation plan for the portfolio.

This roadmap defines the order in which features should be built. It prioritizes delivering a polished, production-ready MVP before expanding into future functionality.

Only completed work should be checked off.

---

# Current Version

**Target:** v1.0.0 (MVP)

Status: 🚧 In Development

---

# Phase 0 — Foundation

## Project Setup

* [x] Initialize Next.js project
* [x] Configure TypeScript
* [x] Configure Tailwind CSS v4
* [x] Install shadcn/ui
* [x] Configure Biome
* [x] Configure absolute imports
* [x] Configure environment variables
* [x] Configure project aliases

## Repository

* [x] Create folder structure
* [ ] Add documentation
* [x] Configure Git
* [ ] Configure deployment

---

# Phase 1 — Database

## Database

* [x] Configure PostgreSQL
* [x] Configure Prisma
* [x] Create initial schema
* [x] Run initial migration

## Authentication

* [x] Configure Better Auth
* [x] Protect Studio
* [x] Session management

## Storage

* [x] Configure Cloudflare R2
* [x] Image uploads
* [x] Media management

---

# Phase 2 — Core Architecture

## Data Access Layer

* [x] Create DAL structure
* [x] Project DAL
* [x] Media DAL
* [x] Settings DAL

## Validation

* [x] Configure Zod
* [x] Shared validation schemas

---

# Phase 3 — Public Website

## Layout

* [x] Root layout
* [x] Navigation
* [x] Footer
* [x] Mobile navigation

## Home

* [x] Hero
* [x] Featured Projects
* [x] About Preview
* [x] Contact CTA

## About

* [x] About page
* [x] Skills
* [x] Experience
* [x] Tech Stack

## Projects

* [x] Projects listing
* [x] Filtering (if needed)
* [x] Pagination (future-ready)

## Project Page

* [x] Dynamic routing
* [x] Hero
* [x] Section renderer
* [x] Next Project
* [x] Related metadata

## Contact

* [x] Contact page
* [x] Contact form
* [x] Email integration

## Error Pages

* [x] 404
* [x] Loading states
* [x] Error boundaries

---

# Phase 4 — Studio

## Authentication

* [x] Login
* [x] Logout

## Dashboard

* [x] Dashboard overview
* [x] Sidebar
* [x] Navigation

## Projects

* [x] Create project
* [x] Edit project
* [x] Delete project
* [x] Publish project
* [x] Unpublish project
* [x] Feature project
* [x] Project ordering

## Sections

* [x] Add section
* [x] Edit section
* [x] Delete section
* [x] Drag-and-drop ordering

## Media

* [x] Upload media
* [x] Replace media
* [x] Delete media

## Settings

* [x] Portfolio settings
* [x] SEO defaults
* [x] Social links

---

# Phase 5 — Content System

## Section Types

* [x] Hero
* [x] Rich Text
* [x] Gallery
* [x] Feature Grid
* [x] Tech Stack
* [x] Timeline
* [x] Metrics
* [x] External Links

## Rendering

* [x] Dynamic renderer
* [x] Section registry
* [x] Ordering system

---

# Phase 6 — Motion

## GSAP Foundation

* [x] Animation utilities
* [x] Reusable timelines
* [x] ScrollTrigger setup
* [x] Reduced motion support

## Public Website

* [x] Hero animations
* [x] Scroll reveals
* [x] Page transitions
* [x] Hover interactions
* [x] Gallery animations

## Studio

* [x] Modal animations
* [x] Drawer animations
* [x] Toast animations

---

# Phase 7 — SEO

* [x] Metadata
* [x] Open Graph
* [x] Twitter Cards
* [x] Structured Data
* [x] Sitemap
* [x] robots.txt
* [x] Canonical URLs
* [x] Dynamic project metadata

---

# Phase 8 — Accessibility

* [x] Keyboard navigation
* [x] Focus management
* [x] Screen reader testing
* [x] Color contrast review
* [x] Reduced motion testing

---

# Phase 9 — Performance

* [x] Image optimization
* [x] Lazy loading
* [x] Code splitting
* [x] Bundle analysis
* [x] Performance audit

---

# Phase 10 — Testing

* [x] Responsive testing
* [x] Cross-browser testing
* [x] Form validation
* [x] CMS workflow testing
* [x] Performance verification
* [x] Accessibility verification

---

# Phase 11 — Deployment

* [x] Production environment
* [x] Deploy to Vercel
* [x] Verify environment variables
* [x] Verify uploads
* [x] Verify authentication
* [x] Verify SEO
* [x] Final QA

---

# MVP Completion Checklist

The MVP is complete when:

* [x] Public portfolio is live
* [x] Studio is functional
* [x] Projects are fully CMS-driven
* [x] Sections are reorderable
* [x] Media uploads work
* [x] GSAP animations are complete
* [x] SEO is implemented
* [x] Accessibility requirements are met
* [x] Performance targets are achieved
* [x] Documentation is up to date

---

# Post-MVP

After v1.0.0, future work should come from `docs/FUTURE.md`.

Potential areas include:

* Blog
* Search
* AI-assisted content
* Mobile app
* Desktop app
* Real-time chat
* Analytics
* Visitor accounts
* Public API

These features should not delay the MVP.

---

# Guiding Principle

Finish the current phase before starting the next.

A smaller, polished portfolio is more valuable than a larger portfolio filled with unfinished ideas.

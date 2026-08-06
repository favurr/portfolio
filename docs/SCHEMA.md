# SCHEMA.md

# Database Schema

> The canonical data model for the portfolio.

This document defines the database entities, relationships, and conventions used throughout the application.

The Prisma schema is the implementation.

This document explains **why** the schema exists and how every model relates to one another.

---

# Design Principles

The schema should be:

* Simple
* Explicit
* Extensible
* Normalized where appropriate
* Easy to understand
* Future-proof

The database should model the product, not the UI.

---

# Core Models

V1 consists of only a few core models.

```text
User

Project

ProjectSection

Media

Setting
```

Nothing else should be introduced unless there is a clear product requirement.

---

# Entity Relationship

```text
User
│
├── Projects
│      │
│      ├── Project Sections
│      │
│      └── Media
│
└── Settings
```

---

# User

Represents the authenticated Studio owner.

Responsibilities:

* Authentication
* Authorization
* Ownership
* Preferences

Future:

* Multiple users
* Roles
* Permissions

---

# Project

Represents a single portfolio project.

Examples:

* Constella
* AlphaWealth
* Favurr Digital

A project owns:

* metadata
* sections
* media
* publishing state
* ordering

---

## Project Fields

Required:

* title
* slug
* description
* featuredImage
* published
* featured
* order

Optional:

* repository
* liveDemo
* year
* client
* duration
* seoTitle
* seoDescription
* seoImage

---

# ProjectSection

Every section displayed on a project page.

Examples:

* Overview
* Gallery
* Timeline
* Tech Stack
* Features
* Metrics
* Links

Each section belongs to exactly one project.

Projects can have any number of sections.

---

## ProjectSection Fields

Required:

* projectId
* type
* order

Optional:

* title
* subtitle
* content
* settings

The `settings` field stores section-specific configuration.

---

# Section Types

Supported in V1:

```text
RICH_TEXT

GALLERY

FEATURE_GRID

TECH_STACK

TIMELINE

METRICS

LINKS
```

Additional section types may be added without changing existing projects.

---

# Media

Represents uploaded assets.

Examples:

* Cover images
* Gallery images
* Videos (future)

Media should never be embedded directly inside projects.

Projects reference media.

---

## Media Fields

Required:

* url
* key
* width
* height
* alt

Optional:

* blurDataURL
* caption
* fileSize
* mimeType

Storage provider:

Cloudflare R2

---

# Setting

Stores global portfolio settings.

Examples:

* Site title
* Description
* Social links
* Contact email
* Theme
* SEO defaults

Only one active settings record should exist in V1.

---

# Relationships

## User → Project

One user

↓

Many projects

---

## Project → ProjectSection

One project

↓

Many sections

---

## Project → Media

One project

↓

Many media assets

---

# Ordering

Projects support manual ordering.

```text
Project

↓

order
```

Smaller numbers appear first.

---

Sections also support ordering.

```text
Project

↓

Sections

↓

order
```

The frontend renders sections in ascending order.

---

# Slugs

Every project requires a unique slug.

Example:

```text
constella

alphawealth

favurr-digital
```

Never use IDs in URLs.

---

# Publishing

Projects should support:

```text
Draft

↓

Published

↓

Archived (future)
```

Only published projects appear publicly.

---

# Featured Projects

Projects can be marked as featured.

Featured projects appear:

* Home page
* Featured sections
* Search results (future)

---

# Deletion

Prefer soft deletion in future versions.

For V1, permanent deletion is acceptable.

Deletion should also clean up:

* section records
* unused media references

---

# Validation

Every model should validate:

* required fields
* unique constraints
* field lengths
* relationships

Validation should occur before writing to the database.

---

# Naming

Models:

Singular

```text
Project

Media

Setting
```

Collections:

Plural

```text
Projects

Sections

Settings
```

---

# Future Models

Do not implement these in V1.

Possible future additions:

```text
BlogPost

Category

Tag

Conversation

Message

Notification

Visitor

Analytics

SearchIndex
```

Add models only when the product genuinely requires them.

---

# Schema Evolution

Whenever the schema changes:

* Update Prisma schema.
* Create a migration.
* Update DAL methods if necessary.
* Update this document.

Documentation should remain synchronized with the implementation.

---

# Principles

Before creating a new model, ask:

* Does this represent a real business concept?
* Can the existing schema support this?
* Will this simplify or complicate the product?
* Is this needed for V1?

If the answer is no, do not add it.

---

# Guiding Principle

The schema should model the portfolio as a **content platform**, not as a collection of pages.

Projects are content.

Sections are content.

The frontend is simply responsible for rendering that content.

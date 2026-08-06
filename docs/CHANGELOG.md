# CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

This project follows a simplified version of **Keep a Changelog** and **Semantic Versioning**.

---

# Versioning

The project uses the following version format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.0.0
```

### Major

Breaking changes or significant architectural changes.

Examples:

* New CMS architecture
* Complete redesign
* Database restructuring

---

### Minor

New features that are backwards compatible.

Examples:

* New project section type
* New Studio feature
* New animation preset
* SEO improvements

---

### Patch

Bug fixes and small improvements.

Examples:

* Fixed mobile navigation
* Improved accessibility
* Updated copy
* Animation performance improvements

---

# Changelog Format

Every release should follow this structure.

```text
## [Version] - YYYY-MM-DD

### Added

-

### Changed

-

### Improved

-

### Fixed

-

### Removed

-

### Deprecated

-
```

Only include sections that contain changes.

---

# Unreleased

## [Unreleased]

### Added

* Database content schema in schema.prisma (`Project`, `ProjectSection`, `Media`, `Setting`).
* Direct PostgreSQL Neon integration and clients validation models using Zod.
* Data Access Layer structure (`dal/project.ts`, `dal/media.ts`, `dal/settings.ts`).
* Server Actions routing controller (`app/studio/actions.ts`).
* Business Logic Service Layer (`services/project.ts`).
* Client components registry mapping keys dynamically to dynamic React components.
* Public frontend cases dynamic listing layouts.
* Studio workspace dashboard navigation and layout-level check authentication guards.
* Cloudflare R2 integration via presigned AWS SDK S3 clients.
* Reusable GSAP staggers utilities and SEO metadata construction configurations.

---

# Releases

## [0.1.0] - Initial Release

### Added

* Public portfolio foundation.
* Studio foundation.
* Project management.
* Dynamic project pages.
* Reorderable project sections.
* Core design system.
* Initial animation system.
* SEO foundation.

---

# Logging Rules

Log changes when they affect:

* Features
* Architecture
* Database
* User experience
* Performance
* Accessibility
* Documentation
* Dependencies
* Security

Do not log:

* Temporary debugging
* Work-in-progress experiments
* Comments
* Formatting-only changes
* Local development notes

---

# Writing Guidelines

Each entry should be:

* Short
* Clear
* Specific
* Easy to scan

Good

```text
Added project section reordering.
```

Bad

```text
Worked on some project stuff.
```

---

# Breaking Changes

Whenever a release contains breaking changes, include a dedicated section.

Example:

```text
### Breaking Changes

- Replaced the previous project rendering system.
- Updated the database schema.
```

---

# Migration Notes

If a release requires manual action, include migration instructions.

Example:

```text
### Migration

- Run the latest Prisma migrations.
- Update environment variables.
```

---

# Dependency Updates

Record important dependency upgrades.

Example:

```text
### Updated

- Next.js 16.1
- Prisma 6.x
- Better Auth
```

Do not document every patch update unless it affects the project.

---

# Documentation

Significant documentation updates should be tracked.

Example:

```text
### Documentation

- Updated AGENTS.md.
- Expanded GSAP guidelines.
```

---

# Future Releases

As the project evolves, continue documenting meaningful changes while keeping entries concise and useful.

The changelog should provide a clear history of how the portfolio has evolved over time.

---

# Guiding Principle

If a future contributor wants to know **what changed, when it changed, and why it matters**, the answer should be found in this file.

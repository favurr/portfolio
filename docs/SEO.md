# SEO.md

# Search Engine Optimization

> The SEO strategy for the portfolio.

SEO is a core feature of this project—not an afterthought. Every page should be discoverable, shareable, and optimized for both search engines and social platforms while maintaining fast performance and a great user experience.

---

# Goals

The portfolio should:

* Rank well for my name and brand.
* Rank for relevant technical keywords.
* Generate rich previews on social platforms.
* Produce meaningful metadata automatically.
* Maintain excellent Core Web Vitals.
* Be easily crawlable and indexable.

---

# SEO Principles

* Every page must have a unique purpose.
* Every page must have unique metadata.
* Never duplicate titles or descriptions.
* Optimize for humans first, search engines second.
* Content quality is more important than keyword density.

---

# Metadata

Every page must define:

* Title
* Description
* Canonical URL
* Open Graph metadata
* Twitter Card metadata
* Robots directives (when necessary)

Use the Next.js Metadata API.

Avoid manually injecting `<head>` tags.

---

# Titles

Titles should:

* Be descriptive.
* Include the page purpose.
* Include my name or brand where appropriate.
* Remain concise.

Examples:

Home

```
Favurr — Full Stack Web Developer
```

Projects

```
Projects — Favurr
```

About

```
About — Favurr
```

Project

```
Constella — AI Marketing Operating System
```

---

# Meta Descriptions

Descriptions should:

* Be unique.
* Clearly explain the page.
* Encourage clicks.
* Avoid keyword stuffing.

Every project should have its own description.

---

# Canonical URLs

Every page must define a canonical URL.

Avoid duplicate indexing.

Project pages should always reference their canonical slug.

---

# Open Graph

Every page should define:

* title
* description
* URL
* type
* image
* site name

Project pages should generate Open Graph images dynamically where possible.

---

# Twitter Cards

Use:

Large Summary Card

Each page should include:

* title
* description
* preview image

---

# Structured Data

Use JSON-LD whenever appropriate.

Potential schema types include:

* Person
* WebSite
* Organization
* CreativeWork
* SoftwareApplication
* BreadcrumbList
* Article (future blog)

Project pages should expose structured data that best represents the work.

---

# Sitemap

Generate the sitemap automatically.

Include:

* Home
* About
* Projects
* Contact
* Every published project

Exclude:

* Studio
* Authentication
* Draft content
* Unpublished projects

---

# robots.txt

Allow indexing of all public pages.

Disallow:

* Studio
* Admin routes
* Authentication
* Internal APIs
* Draft content

---

# Project SEO

Each project should support:

* SEO title
* SEO description
* Social image
* Keywords (optional)
* Canonical URL

If not provided, sensible defaults should be generated automatically.

---

# Images

Every image should:

* Include descriptive alt text.
* Be optimized.
* Use modern image formats when appropriate.
* Load at the correct dimensions.

Decorative images should have empty alt text.

---

# URLs

URLs should be:

* short
* readable
* descriptive
* lowercase
* stable

Good

```
/projects/constella
```

Bad

```
/projects/project-123
```

---

# Performance & SEO

SEO depends on performance.

Prioritize:

* Server Components
* Optimized images
* Minimal JavaScript
* Fast loading times
* Efficient caching

Avoid unnecessary client-side rendering.

---

# Core Web Vitals

Target excellent scores for:

* Largest Contentful Paint (LCP)
* Interaction to Next Paint (INP)
* Cumulative Layout Shift (CLS)

Pages should remain responsive on both desktop and mobile.

---

# Accessibility

Good accessibility improves SEO.

Every page should:

* Use semantic HTML.
* Have a single H1.
* Maintain heading hierarchy.
* Support keyboard navigation.
* Include descriptive link text.
* Provide meaningful alt text.

---

# Heading Structure

Every page should follow a logical hierarchy.

```
H1

H2

H3

H4
```

Never skip heading levels purely for styling.

---

# Internal Linking

Projects should link to:

* Previous or next project
* Related pages
* Contact page where appropriate

Internal links should help users discover more content naturally.

---

# Social Sharing

Every public page should generate attractive previews.

Priority:

* Project pages
* Home
* About

Preview images should match the project's branding.

---

# Indexing Rules

Public pages:

✅ Index

Studio:

❌ No Index

Draft projects:

❌ No Index

Authentication pages:

❌ No Index

---

# Analytics

Analytics should never negatively impact performance.

When introduced, prefer privacy-conscious analytics and load them efficiently.

---

# Future SEO

Potential future improvements:

* Dynamic Open Graph image generation
* Breadcrumb structured data
* Search integration
* Blog SEO
* RSS feed
* Portfolio search indexing
* AI-friendly metadata
* Rich snippets

---

# SEO Checklist

Before publishing a page:

* Unique title
* Unique description
* Canonical URL
* Open Graph metadata
* Twitter Card metadata
* Structured data (when appropriate)
* Optimized images
* Alt text
* Correct heading hierarchy
* Internal links
* Fast loading performance
* Mobile responsive
* Accessible

A page is not considered complete until it satisfies this checklist.

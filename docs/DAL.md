# DAL.md

# Data Access Layer

> The official data access architecture for the portfolio.

The Data Access Layer (DAL) is the only part of the application allowed to communicate directly with the database.

Its responsibility is to isolate business logic, database queries, and data transformations from the rest of the application.

---

# Philosophy

The UI should never know how data is stored.

The UI should only request data.

The DAL decides:

* where data comes from
* how it is queried
* how it is validated
* how it is transformed
* what is returned

This separation makes the application easier to maintain, test, and evolve.

---

# Goals

The DAL exists to:

* centralize database access
* prevent duplicated queries
* improve maintainability
* simplify future database changes
* keep business logic out of the UI
* enforce consistent data access

---

# Architecture

```text
Browser

↓

Server Component
or
Server Action
or
Route Handler

↓

Data Access Layer (DAL)

↓

Prisma

↓

PostgreSQL
```

The UI never communicates with Prisma directly.

---

# Rules

## Never import Prisma outside the DAL

Only the DAL may import:

```ts
import { prisma } from "@/lib/prisma"
```

Every other layer communicates with the DAL.

---

## Never query inside components

Bad

```ts
const projects = await prisma.project.findMany()
```

Good

```ts
const projects = await projectDal.getProjects()
```

---

## Never query inside pages

Pages should request data from the DAL.

Pages should not know how the data is retrieved.

---

## Never query inside layouts

Layouts are consumers of data.

They should never contain database logic.

---

## Server Actions

Server Actions may call the DAL.

They should never call Prisma directly.

Example

```text
Server Action

↓

projectDal.publish()

↓

Prisma
```

---

## Route Handlers

API routes should also use the DAL.

Avoid duplicating query logic.

---

# Responsibilities

The DAL is responsible for:

* querying
* filtering
* sorting
* searching
* pagination
* transactions
* authorization checks
* data transformations
* reusable business logic

---

# Not Responsible For

The DAL should not:

* render UI
* validate forms
* format components
* animate data
* perform frontend logic

---

# Folder Structure

```text
src/

lib/
    prisma.ts

dal/
    project.ts
    settings.ts
    media.ts
```

Every resource should have its own DAL module.

---

# Example

```text
dal/

project.ts

media.ts

settings.ts
```

Avoid one giant DAL file.

---

# Naming

Prefer:

```text
projectDal
mediaDal
settingsDal
```

Avoid generic names such as:

```text
database.ts
queries.ts
helpers.ts
utils.ts
```

---

# Method Naming

Use descriptive method names.

Examples

```text
getProjects()

getFeaturedProjects()

getProjectBySlug()

createProject()

updateProject()

publishProject()

deleteProject()

reorderProjects()

reorderSections()
```

Avoid vague names.

---

# Return Types

Always return predictable types.

Prefer explicit interfaces.

Avoid returning raw Prisma responses if transformation improves readability.

---

# Business Logic

Business logic belongs in the DAL.

Example

Instead of

```text
UI

↓

filter featured projects
```

Do

```text
projectDal.getFeaturedProjects()
```

---

# Authorization

Permission checks should happen before database mutations.

Example

```text
User

↓

Authentication

↓

Authorization

↓

DAL

↓

Database
```

Never rely on the frontend for authorization.

---

# Transactions

Use Prisma transactions whenever multiple writes must succeed or fail together.

Examples:

* project creation
* media attachment
* section reordering

Maintain data integrity.

---

# Errors

The DAL should:

* throw meaningful errors
* avoid exposing internal implementation details
* return predictable failure states

Do not silently ignore database errors.

---

# Validation

Input validation should happen before the DAL.

The DAL should assume validated input but still guard against impossible states where appropriate.

Use Zod for request validation.

---

# Caching

Caching strategies belong above the DAL.

The DAL should focus on retrieving and mutating data.

---

# Pagination

Large collections should support pagination.

The DAL should expose pagination helpers rather than forcing every caller to implement them.

---

# Searching

Search logic belongs inside the DAL.

Avoid duplicating search implementations across pages.

---

# Sorting

Sorting should be centralized.

Examples

```text
Newest

Oldest

Featured

Manual Order
```

The DAL decides how sorting is implemented.

---

# Project Ordering

Projects should support manual ordering.

The DAL should expose methods such as:

```text
reorderProjects()

moveProject()
```

The UI should never manipulate ordering directly.

---

# Section Ordering

Each project owns an ordered list of sections.

The DAL manages:

* inserting
* removing
* moving
* updating

The renderer simply consumes the ordered data.

---

# Media

Media access should also pass through the DAL.

Responsibilities include:

* image references
* uploads
* deletions
* metadata

Cloudflare R2 remains the storage provider.

---

# Future Expansion

The DAL should be designed so future features can reuse existing patterns.

Examples:

* blog
* chat
* analytics
* search
* AI features

Adding new modules should not require changing existing ones.

---

# Checklist

Before writing any database code, ask:

* Does this belong in the DAL?
* Can an existing DAL method be reused?
* Is the method name descriptive?
* Does it avoid exposing Prisma to the UI?
* Does it keep business logic centralized?

If the answer to any of these is **no**, refactor before continuing.

---

# Guiding Principle

**The UI describes what it needs.**

**The DAL decides how to get it.**

Everything that touches the database should pass through the Data Access Layer.

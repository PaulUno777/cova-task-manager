# Technical decisions

Short record of choices that are **already made** or **firmly planned** for this assessment. Detailed ADR files are not used—the domain does not justify a large decision archive.

## Modular monolith

**Decision:** Single Spring Boot application with layered packages.

**Why:** User + Task is a small domain. Microservices would add operational cost without benefit.

## H2 + MySQL profiles

**Decision:** Default `h2` profile for fast local run and tests; `mysql` profile for Docker Compose and deployment.

**Why:** Matches assessment requirements and keeps one codebase; only configuration changes.

## JWT authentication (planned)

**Decision:** Stateless JWT validated by Spring Security; same tokens for web and optional Flutter.

**Why:** Simple API-friendly auth without server-side sessions; common for SPA + mobile.

**Status:** Security skeleton only in Phase 1; JWT libraries and filters come with the auth phase.

## TanStack Query (planned)

**Decision:** Server state (tasks, auth session metadata) via TanStack Query on the frontend.

**Why:** Caching, loading/error states, and mutation invalidation without duplicating server data in React state.

**Status:** Not installed until the API client and task features begin.

## Tailwind CSS + shadcn/ui

**Decision:** Tailwind for layout and tokens; shadcn/ui for accessible primitives.

**Why:** Assessment allows Tailwind or shadcn; combining both gives speed and consistent components.

**Status:** Phase 1 shell uses Button and design tokens; more components added as screens ship.

## pnpm for frontend

**Decision:** Use pnpm for frontend dependencies, lockfile, CI, and frontend Docker build.

**Why:** Author preference; faster installs and strict dependency layout.

## Docker

**Decision:** Separate Dockerfiles for backend and frontend; Compose provides MySQL locally.

**Why:** Reproducible builds for CI/CD and GCP later; Compose optional for DB only in early phases.

**Status:** Images build individually; full orchestrated stack is a later step.

## GCP and Flutter (optional)

**Decision:** Deliver core web + backend first; GCP deployment and Flutter only after the main user journey works.

**Why:** Assessment marks CI/CD, GCP, and mobile as bonus; quality of the primary app matters most.

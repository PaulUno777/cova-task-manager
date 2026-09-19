# COVA Task Manager

**A modern full-stack task management application built for the COVA Full-Stack Developer technical assessment.**

![CI](https://github.com/PaulUno777/cova-task-manager/actions/workflows/ci.yml/badge.svg)![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white)![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api) · [Testing](#testing) · [Deployment](#deployment) · [Documentation](#documentation)

---

## Overview

COVA Task Manager is a responsive task management application
developed as part of the COVA Full-Stack Developer technical
assessment.

The application allows authenticated users to create, manage,
search and filter their personal tasks through a modern web
interface.

The backend exposes a REST API designed to be consumed by both
the React web application and the optional Flutter mobile client.

The implementation focuses on:

- clean and maintainable code
- secure authentication
- clear API boundaries
- responsive UX
- automated testing
- containerization
- CI/CD
- straightforward architecture without unnecessary complexity

---

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Secure password hashing
- Protected API endpoints

### Task management

- Create tasks
- Edit tasks
- Delete tasks
- View personal tasks
- Filter by status
- Search tasks
- Pagination

### UX

- Responsive interface
- COVA-inspired visual direction
- Loading states
- Empty states
- Error handling
- Form validation
- Toast feedback
- Accessible interactions

### Engineering

- Spring Boot REST API
- Spring Security
- Spring Data JPA
- MySQL
- H2 development/test profile
- React + Vite + TypeScript
- TanStack Query
- Docker
- GitHub Actions
- Google Cloud deployment

---

## Architecture

The application uses a **modular monolith**.

The domain is intentionally small, so the architecture avoids
unnecessary distributed systems and infrastructure.

```text
                       ┌───────────────┐
                       │     User      │
                       └───────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             React Web App        Flutter Mobile
                                     (optional)
                    │                     │
                    └──────────┬──────────┘
                               │
                          HTTPS / JSON
                               │
                       ┌───────▼────────┐
                       │  Spring Boot   │
                       │      API       │
                       ├────────────────┤
                       │ Spring Security│
                       │ Controllers    │
                       │ Services       │
                       │ Repositories   │
                       └───────┬────────┘
                               │
                          Spring Data JPA
                               │
                       ┌───────▼────────┐
                       │     MySQL      │
                       └────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for the layered package structure
(`domain` → `application` → `infrastructure`/`presentation`) and
[docs/decisions.md](docs/decisions.md) for why each major choice was made.

---

## Getting Started

### Backend (Spring Boot)

Requires Java 21.

```bash
cd backend
./mvnw spring-boot:run
```

By default this runs against an in-memory H2 database (`SPRING_PROFILES_ACTIVE=h2`) — no
setup required. The API is available at `http://localhost:8080`.

To run against MySQL instead:

```bash
docker compose up -d mysql
SPRING_PROFILES_ACTIVE=mysql ./mvnw spring-boot:run
```

Copy [.env.example](.env.example) to `.env` to override the JWT secret, token lifetimes,
or database credentials — see [docs/database.md](docs/database.md) for the profile
details.

### Frontend (React + Vite)

Requires Node 22 and [pnpm](https://pnpm.io).

```bash
cd frontend
pnpm install
pnpm run dev
```

**Status:** the frontend currently ships the Phase 1 application shell only (build
tooling, design tokens, routing skeleton). Authentication and task screens are the next
phase of work — see [docs/architecture.md](docs/architecture.md) for the planned scope.

---

## API

Full contract: [docs/api.md](docs/api.md).

Interactive docs — no authentication required, available whenever the backend is running:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Raw OpenAPI 3.1 spec: `http://localhost:8080/v3/api-docs`

| Method | Endpoint             | Auth                   |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/auth/register` | public                 |
| POST   | `/api/auth/login`    | public                 |
| POST   | `/api/auth/refresh`  | public (refresh token) |
| GET    | `/api/auth/me`       | required               |
| GET    | `/api/tasks`         | required               |
| POST   | `/api/tasks`         | required               |
| PUT    | `/api/tasks/{id}`    | required               |
| DELETE | `/api/tasks/{id}`    | required               |

Authentication returns a short-lived access token (15 min) and a long-lived refresh token
(7 days); see [Token response](docs/api.md#token-response) for the exact shape and how to
use `/api/auth/refresh` to stay signed in.

---

## Testing

```bash
cd backend
./mvnw test
```

Backend integration tests (`TaskApiIntegrationTests`) cover, end-to-end via MockMvc:

- register → login → `/api/auth/me`
- access/refresh token issuance and rejection of the wrong token type in either direction
- unauthenticated requests to `/api/tasks` are rejected
- a user cannot read, update, or delete another user's task (404, not 403 — existence isn't leaked)
- status filtering, search, and pagination only ever return the caller's own tasks

Frontend testing (lint + build) will apply once the task/auth screens exist; see CI below.

---

## CI/CD

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every push and pull request to `main` or `develop`:

- **Backend:** `./mvnw test` on Java 21 (H2 profile, no external services needed)
- **Frontend:** `pnpm install`, `pnpm run lint`, `pnpm run build`

Both jobs must pass before a PR is mergeable.

---

## Deployment

Automated via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push
to `main`: builds both Docker images, pushes to Artifact Registry, deploys both to
**Google Cloud Run** (public, scales to zero), then points the backend's CORS at the
frontend's URL. One-time GCP setup (service account + secrets) is documented in
[`docs/deployment.md`](docs/deployment.md).

Try it locally first with the real multi-stage images:

```bash
docker compose up --build
```

**Known tradeoff:** the deployed backend runs the `h2` (in-memory) profile, not `mysql` —
provisioning Cloud SQL didn't fit the deployment window. MySQL support is fully implemented
and verified locally (see [`docs/database.md`](docs/database.md)); see
[`docs/deployment.md`](docs/deployment.md#known-tradeoff-in-memory-database) for what
switching the live deployment to it would take.

---

## Documentation

| Document | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Layered architecture, package structure |
| [docs/api.md](docs/api.md) | Full REST contract, request/response shapes |
| [docs/database.md](docs/database.md) | Entities, profiles, constraints |
| [docs/decisions.md](docs/decisions.md) | Why each significant technical choice was made |
| [docs/deployment.md](docs/deployment.md) | GCP Cloud Run setup, secrets, known tradeoffs |

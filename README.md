# COVA Task Manager

**A modern full-stack task management application built for the COVA Full-Stack Developer technical assessment.**

![CI](https://github.com/PaulUno777/cova-task-manager/actions/workflows/ci.yml/badge.svg)![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white)![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**🔗 Live app:** [https://cova-task-manager-five.vercel.app](https://cova-task-manager-five.vercel.app) · **API/Swagger:** [https://cova-task-manager-8dun.onrender.com/swagger-ui.html](https://cova-task-manager-8dun.onrender.com/swagger-ui.html) _(Backend is on Render's free tier the first request after idling can take ~30–50s to wake up.)_

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

- Kanban board (To do / In progress / Done) with drag-and-drop status changes
- Create, edit, delete tasks
- Click a task to view full details (description, created/updated timestamps)
- Filter by status, debounced search (2+ characters)

### UX

- Responsive interface (mobile-verified)
- COVA-inspired visual direction
- English/French interface (persisted per-user)
- Installable as a PWA (Add to Home Screen)
- Loading states (skeletons), empty states, error states with retry
- Form validation
- Toast feedback
- Accessible interactions (keyboard-operable cards/dialogs, aria labels on icon buttons)

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
- Deployed on Render + Vercel + Aiven MySQL

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

Defaults to `VITE_API_URL=http://localhost:8080/api` (backend running locally). Copy
[frontend/.env.example](frontend/.env.example) to `frontend/.env` to point it elsewhere (e.g.
the deployed backend).

---

## API

Full contract: [docs/api.md](docs/api.md).

Interactive docs no authentication required, available whenever the backend is running:

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
(7 days);

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
- a user cannot read, update, or delete another user's task (404, not 403 existence isn't leaked)
- status filtering, search, and pagination only ever return the caller's own tasks

Frontend: `pnpm run lint` and `pnpm run build` are gated in CI (see below). No frontend unit
tests yet — a deliberate scope call under time pressure; the full user journey was instead
verified manually end-to-end against the real backend (register, Kanban CRUD, filters,
search, i18n, PWA install, mobile layout).

---

## CI/CD

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every push and pull request to `main` or `develop`:

- **Backend:** `./mvnw test` on Java 21 (H2 profile, no external services needed)
- **Frontend:** `pnpm install`, `pnpm run lint`, `pnpm run build`

Both jobs must pass before a PR is mergeable.

---

## Deployment

**Live app:** [https://cova-task-manager-five.vercel.app](https://cova-task-manager-five.vercel.app)
**Live API / Swagger UI:** [https://cova-task-manager-8dun.onrender.com/swagger-ui.html](https://cova-task-manager-8dun.onrender.com/swagger-ui.html)

- Frontend on **Vercel** (free), backend on **Render** (free, deploys straight from
  `backend/Dockerfile`), database on **Aiven** (free-tier managed **MySQL** the real `mysql`
  Spring profile, not an in-memory fallback). Both platforms redeploy automatically on push to
  `main`.
- Full setup steps and rationale (including why this replaced an earlier, fully-built and
  locally-verified GCP Cloud Run pipeline) are in `[docs/deployment.md](docs/deployment.md)`.
- **Known tradeoff:** Render's free tier sleeps after 15 minutes idle the first request after that takes ~30–50s to wake up, then runs normally.

Try the full stack locally first with the real multi-stage Docker images:

```bash
docker compose up --build
```

This runs MySQL + backend + frontend together visit `http://localhost:8081`.

---

## Documentation

| Document                                     | Contents                                              |
| -------------------------------------------- | ----------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | Layered architecture, package structure               |
| [docs/api.md](docs/api.md)                   | Full REST contract, request/response shapes           |
| [docs/database.md](docs/database.md)         | Entities, profiles, constraints                       |
| [docs/ux.md](docs/ux.md)                     | Design tokens, UI states, i18n, PWA, accessibility    |
| [docs/decisions.md](docs/decisions.md)       | Why each significant technical choice was made        |
| [docs/deployment.md](docs/deployment.md)     | Live URLs, Render/Vercel/Aiven setup, known tradeoffs |

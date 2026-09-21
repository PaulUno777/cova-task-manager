# Technical decisions

Short record of choices that are **already made** or **firmly planned** for this assessment. Detailed ADR files are not used—the domain does not justify a large decision archive.

## Modular monolith

**Decision:** Single Spring Boot application with layered packages.

**Why:** User + Task is a small domain. Microservices would add operational cost without benefit.

## H2 + MySQL profiles

**Decision:** Default `h2` profile for fast local run and tests; `mysql` profile for Docker Compose and deployment.

**Why:** Matches assessment requirements and keeps one codebase; only configuration changes.

## JWT authentication

**Decision:** Stateless JWT validated by Spring Security; same tokens for web and optional Flutter.

**Why:** Simple API-friendly auth without server-side sessions; common for SPA + mobile.

**Status:** Implemented with stateless HMAC-signed bearer tokens. The JWT contains the authenticated user's id and email; the profile and task APIs derive ownership from that identity.

## Short-lived access token + long-lived refresh token

**Decision:** `register`/`login`/`refresh` return an OAuth2-style pair: a 15-minute access
token and a 7-day refresh token (both HMAC-signed JWTs, same secret), distinguished by a
`type: refresh` claim on the refresh token. `POST /api/auth/refresh` exchanges a refresh
token for a new pair. No refresh tokens are persisted server-side.

**Why:** A single 24h token was either too short-lived to feel "signed in" across a normal
session or too long-lived to be a reasonable bearer credential. Splitting the two lets the
access token stay short (limits the blast radius if it leaks) while the refresh token keeps
the client signed in without re-entering credentials. Keeping it stateless (no DB-backed
token table, no rotation/revocation) matches the assessment's scope — the JWT filter simply
rejects a refresh token used as a bearer token and vice versa, which is enough to stop the
two token types from being swapped, without adding persistence for a threat model
(server-side logout, token theft response) this project doesn't need.

## TanStack Query

**Decision:** Server state (tasks) via TanStack Query on the frontend.

**Why:** Caching, loading/error states, and mutation invalidation without duplicating server data in React state.

**Status:** Implemented — `useTasksQuery`/`useCreateTask`/`useUpdateTask`/`useDeleteTask` in `features/tasks/useTasks.ts` drive the whole dashboard; mutations invalidate the `tasks` query key on success.

## Tailwind CSS + shadcn/ui

**Decision:** Tailwind for layout and tokens; shadcn/ui for accessible primitives.

**Why:** Assessment allows Tailwind or shadcn; combining both gives speed and consistent components.

**Status:** Implemented across the app (button, card, dialog, dropdown-menu, select, input, label, textarea, badge, skeleton, alert).

## Hand-rolled i18n (no i18next)

**Decision:** A small context + dictionary (`lib/i18n/`) for EN/FR, not a library like i18next.

**Why:** Two languages and a bounded string set don't justify a dependency with namespaces,
lazy-loading, and interpolation plugins the app doesn't need — a `useTranslation()` hook backed
by two plain objects covers it in ~80 lines, with the same call-site ergonomics.

## Kanban board with drag-and-drop (@dnd-kit)

**Decision:** Tasks are grouped into three status columns (To do / In progress / Done) with
drag-and-drop to change status, using `@dnd-kit/core`. The status filter dropdown collapses
the board to a single column rather than duplicating the grouping.

**Why:** For a task manager, grouping by status is the natural view — a flat filtered list is
strictly less useful once the data model already has three statuses. `@dnd-kit` was chosen
over `react-beautiful-dnd` (unmaintained) for being actively maintained and accessible
(keyboard sensor support); the edit dialog's status field remains the fully keyboard-accessible
way to change status without dragging.

## pnpm for frontend

**Decision:** Use pnpm for frontend dependencies, lockfile, CI, and frontend Docker build.

**Why:** Author preference; faster installs and strict dependency layout.

## Docker

**Decision:** Separate multi-stage Dockerfiles for backend and frontend (frontend built with
Vite, served by nginx with an SPA fallback); Compose orchestrates MySQL + backend + frontend
together for local verification.

**Why:** Reproducible builds independent of any one deployment target; verifying the full
stack locally (`docker compose up --build`) before touching any cloud platform catches
integration bugs (e.g. missing nginx SPA fallback, CORS) for free.

**Status:** Both images build and run correctly individually and orchestrated together —
verified with real container runs, not just a successful build.

## Deployment: Render + Vercel + Aiven, not GCP

**Decision:** Backend on **Render** (free web service, deploys from `backend/Dockerfile`),
frontend on **Vercel** (free static hosting, zero-config Vite detection), database on
**Aiven** (free-tier managed MySQL) reusing the existing `mysql` Spring profile unchanged,
just pointed at Aiven's connection string via `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`.

**Why:** The original plan was Google Cloud Run (a GCP-specific GitHub Actions workflow was built and locally validated Docker images built, ran, and passed real API calls). It was dropped only because there was no GCP free-tier access available at decision time, not for a technical reason. Render + Vercel + Aiven needed zero credit card, connect to GitHub natively (no custom CI/CD workflow required simpler than the GCP path, not just cheaper), and unlike the originally-planned GCP path, which was going to run H2 in-memory for time reasons  actually deploy with real MySQL (Aiven), which is a strictly better outcome.

**Tradeoff accepted:** Render's free tier sleeps after 15 minutes idle; the first request after
that takes ~30–50s to wake the instance. Documented in `docs/deployment.md` rather than hidden.

**Flutter:** implemented in `mobile/` the checklist's own rule ("don't start Flutter before the deployed web version works") was satisfied first, then the mobile client was built against the same deployed/local API. See the Flutter mobile client decision below.

## Token storage: localStorage, not httpOnly cookies

**Decision:** Access and refresh tokens are kept in `localStorage` (`lib/auth-storage.ts`,
single owner) and sent as an `Authorization: Bearer` header, not issued as httpOnly cookies.

**Why:** The assessment brief explicitly permits either. httpOnly cookies would close one gap
(JS can't read the token, so XSS can't directly exfiltrate it) but open another: cookies
auto-attach to requests, so cross-site request forgery becomes the thing to defend against
instead (`SameSite`/CSRF-token mitigation). The frontend and backend are on different origins (Vercel/Render), which is exactly the case where cross-site cookies are fussiest `SameSite=None; Secure` plus exact-origin `Access-Control-Allow-Credentials` on every request, versus the current setup's plain CORS allow-list. It would also mean reworking the api-client (no more manually attaching a header; the browser does it) and issuing/clearing cookies on login/refresh/logout instead of returning tokens in the JSON body a cross-cutting change to an already-implemented, tested, and deployed flow, not a drop-in swap.

**Where this would matter in production:** if the app needed to defend specifically against XSS-based token theft (e.g. it rendered untrusted user content), httpOnly cookies would be the right call despite the added CSRF-handling cost. For this app's actual attack surface no user-generated HTML rendering, task titles/descriptions are shown as plain text/escaped by React the marginal security gain doesn't currently justify the added complexity.

## Flutter mobile client: Provider, dio, simple list (not Kanban)

**Decision:** `mobile/` uses `provider` (`ChangeNotifier`s) for state, `dio` for HTTP,
`flutter_secure_storage` for token persistence, and a searchable/filterable task **list**
rather than porting the web app's Kanban board.

**Why:** The domain is the same small one (`User` + `Task`) the rest of this document argues against over-engineering `provider` covers two screens' worth of session/list state without
Riverpod's or `flutter_bloc`'s extra ceremony, matching the hand-rolled-i18n precedent above.
`dio`'s interceptors make the access-token header plus refresh-on-401 logic a direct port of
`frontend/src/lib/api-client.ts`'s `refreshAccessToken()` (including deduping concurrent 401s
into one shared refresh call) instead of hand-rolled retry code. The assessment brief's own
mobile spec asks for `ListView`, `TextField`, `ElevatedButton` a flat filtered list is both the literal ask and more idiomatic on a phone-sized screen than drag-and-drop columns.

**Token storage:** unlike the web app's `localStorage` decision above, mobile tokens go in
`flutter_secure_storage` (Keychain on iOS, Keystore-backed EncryptedSharedPreferences on Android) the equivalent-effort, platform-native choice, not a tradeoff call the way the web cookie-vs-localStorage decision was.

**Status:** Implemented `lib/core/api/api_client.dart` (interceptor + refresh dedupe),
`lib/core/storage/auth_storage.dart` (secure storage, single owner, mirrors
`lib/auth-storage.ts`), `lib/features/{auth,tasks}/` (repositories + `ChangeNotifier`
providers + screens). See `[mobile/README.md](../mobile/README.md)`.
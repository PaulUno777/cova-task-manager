# Deployment

**Live:**

- Frontend: [https://cova-task-manager-five.vercel.app](https://cova-task-manager-five.vercel.app)
- Backend API / Swagger UI: [https://cova-task-manager-8dun.onrender.com/swagger-ui.html](https://cova-task-manager-8dun.onrender.com/swagger-ui.html)

## Architecture

- **Frontend** → **Vercel**, free tier. Builds `frontend/` with Vite, zero-config framework
detection, `VITE_API_URL` set as a build-time environment variable pointing at the Render
backend. SPA rewrites (`frontend/vercel.json`) so client-side routes don't 404 on refresh.
- **Backend** → **Render**, free web service. Builds and runs `backend/Dockerfile` directly;
listens on Render's dynamically assigned `$PORT` (`server.port: ${PORT:8080}` in
`application.yaml`).
- **Database** → **Aiven**, free-tier managed MySQL. The backend's existing `mysql` Spring profile is used unchanged only `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` point at Aiven instead
of a local Docker container.
- Both Vercel and Render connect directly to the GitHub repo and redeploy on push to `main` no custom CI/CD workflow needed for deployment itself (existing `.github/workflows/ci.yml`
still gates every push/PR with backend tests + frontend lint/build).



## Why not GCP

The original plan was Google Cloud Run a full GitHub Actions workflow (build, push to Artifact Registry, deploy, CORS wiring) was built and verified against real Docker containers locally. It was dropped only because there was no GCP free-tier access available at decision time, not for a technical reason. Render + Vercel + Aiven need no credit card, and as a bonus actually run real MySQL rather than the in-memory H2 fallback the GCP path would have used under time pressure. See `[docs/decisions.md](decisions.md#deployment-render--vercel--aiven-not-gcp)`.

## One-time setup (for reproducing this deployment)

1. **Aiven**: create a free MySQL service at [aiven.io](https://aiven.io). Note the connection
  details (host, port, database name, username, password) Aiven requires TLS, so the JDBC  URL needs `?sslMode=REQUIRED`.
2. **Render**: sign up at [render.com](https://render.com) (GitHub OAuth, no card), "New Web
  Service" → connect the repo → root directory `backend` → environment **Docker** (uses
   `backend/Dockerfile` automatically). Set environment variables:
  - `SPRING_PROFILES_ACTIVE=mysql`
  - `DB_URL=jdbc:mysql://<aiven-host>:<port>/<database>?sslMode=REQUIRED`
  - `DB_USERNAME`, `DB_PASSWORD` from Aiven
  - `JWT_SECRET`a long random string, not the local dev default
  - `CORS_ALLOWED_ORIGINS` the Vercel URL (set after step 3, then redeploy)
3. **Vercel**: sign up at [vercel.com](https://vercel.com) (GitHub OAuth, no card), import the
  repo → root directory `frontend` → framework preset Vite (auto-detected). Set environment
   variable `VITE_API_URL=https://<render-service>.onrender.com/api` (needed at **build** time redeploy after changing it).
4. Circle back to Render and set `CORS_ALLOWED_ORIGINS` to the Vercel URL from step 3, then
  redeploy the backend.



## Known tradeoff: free-tier cold starts

Render's free web services sleep after 15 minutes of inactivity. The first request after that
takes roughly 30–50 seconds to wake the instance back up; subsequent requests are normal
speed. Acceptable for a graded demo, not how this would be run in production (a paid Render
plan, or min-instances on a platform like Cloud Run, avoids it).

## Local full-stack verification

Before ever deploying, verify both images actually work together locally:

```bash
docker compose up --build
```

This runs MySQL + backend (`mysql` profile) + frontend (nginx, pointed at
`http://localhost:8080/api`) visit `http://localhost:8081`. Verified end-to-end (register →
create task → list) before this was ever deployed anywhere.
# Deployment (GCP Cloud Run)

**Status:** automated via [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) on every push to `main`. Requires one-time GCP setup below.

## Architecture

- **Backend** → Cloud Run service `cova-backend`, `h2` profile (in-memory — see [Known tradeoff](#known-tradeoff-in-memory-database) below).
- **Frontend** → Cloud Run service `cova-frontend`, nginx serving the Vite build, `VITE_API_URL` baked in at build time to the backend's live URL.
- Both images are built and pushed to **Artifact Registry**, then deployed to **Cloud Run** with `--allow-unauthenticated` (public URLs).
- Backend is deployed first, then the frontend is built against its URL, then the backend's `CORS_ALLOWED_ORIGINS` is updated to the frontend's URL — this breaks the chicken-and-egg problem of neither URL existing before the other.

## One-time GCP setup (console, no CLI required)

1. **Create or select a project** at [console.cloud.google.com](https://console.cloud.google.com).
2. **Enable APIs**: "APIs & Services" → "Enable APIs and Services" → enable:
   - Cloud Run Admin API
   - Artifact Registry API
3. **Create an Artifact Registry repository**: "Artifact Registry" → "Create Repository":
   - Name: `cova`
   - Format: Docker
   - Region: `us-central1` (must match `GCP_REGION` in the workflow if you change it)
4. **Create a service account**: "IAM & Admin" → "Service Accounts" → "Create Service Account":
   - Name: `github-actions-deployer`
   - Grant roles: **Cloud Run Admin**, **Artifact Registry Writer**, **Service Account User**
5. **Create a JSON key**: open the service account → "Keys" tab → "Add Key" → "Create new key" → JSON. Downloads a file — keep it secret.

## GitHub repo secrets

Repo → Settings → Secrets and variables → Actions → "New repository secret":

| Secret | Value |
| --- | --- |
| `GCP_SA_KEY` | Full contents of the downloaded JSON key file |
| `GCP_PROJECT_ID` | Your GCP project ID (not the display name) |
| `JWT_SECRET` | A long random string — **not** the local dev default in `.env.example` |

Once these three secrets exist, pushing to `main` (or running the workflow manually from the Actions tab) builds, pushes, and deploys both services, printing both URLs in the final job's logs.

## Known tradeoff: in-memory database

The deployed backend runs the `h2` profile (in-memory), not `mysql`, for time reasons — provisioning Cloud SQL, wiring the connector, and managing its credentials is a meaningfully bigger setup than fit in the deployment window. **MySQL support is fully implemented and verified** (see [`docs/database.md`](database.md) — `application-mysql.yaml`, tested end-to-end via `docker compose up -d mysql`), it just isn't what's running in the live demo.

Practical effect: data resets whenever the Cloud Run instance restarts (deploys, or scale-to-zero after idling). Fine for a graded demo; not how this would be run in production.

**To switch the live deployment to MySQL later:** provision Cloud SQL for MySQL, then change `deploy.yml`'s backend `env_vars` to `SPRING_PROFILES_ACTIVE=mysql` plus `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` (ideally as GitHub secrets, with `DB_URL` using the Cloud SQL Unix socket path `jdbc:mysql:///cova_task_manager?socketFactory=com.google.cloud.sql.mysql.SocketFactory&cloudSqlInstance=<connection-name>` and the Cloud SQL JDBC socket factory dependency added to `pom.xml`).

## Local full-stack verification

Before ever touching GCP, verify both images actually work together locally:

```bash
docker compose up --build
```

This runs MySQL + backend (`mysql` profile) + frontend (nginx, pointed at `http://localhost:8080/api`) — visit `http://localhost:8081`.

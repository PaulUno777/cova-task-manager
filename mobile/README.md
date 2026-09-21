# COVA Task Manager — Mobile

Flutter client for the COVA Task Manager assessment (Étape 3 bonus). Talks to the same
Spring Boot API as the web frontend — same JWT auth, same `/api/tasks` endpoints.

Requires the [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable channel,
tested with 3.44.2).

## Running

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=<api base url>
```

`API_BASE_URL` is a compile-time value (mirrors the web app's build-time `VITE_API_URL`),
defaulting to `http://localhost:8080/api` when omitted. What to pass depends on where the
backend is running and which target you're running on:

| Target                          | `API_BASE_URL`                                   |
| -------------------------------- | ------------------------------------------------- |
| Chrome / macOS / iOS simulator   | `http://localhost:8080/api` (default, can omit)    |
| Android emulator                 | `http://10.0.2.2:8080/api` — emulator can't reach `localhost` |
| Physical device (same Wi-Fi)     | `http://<your-machine-LAN-IP>:8080/api`            |
| Deployed backend                 | `https://cova-task-manager-8dun.onrender.com/api` (Render free tier — first request after idling takes ~30–50s) |

Start the backend first (`cd ../backend && ./mvnw spring-boot:run`, or
`docker compose up -d mysql backend` from the repo root) unless pointing at the deployed API.

**CORS only matters for the `chrome`/`web-server` target.** Android/iOS make the request
natively (via `dio`), which isn't subject to CORS at all. Running on the web against a local
backend, though, hits the backend's `cors.allowed-origins` allowlist (default
`http://localhost:5173`, the web app's Vite port — see `docs/api.md`); widen it for a local
web-target run, e.g. `CORS_ALLOWED_ORIGINS=http://localhost:8765 ./mvnw spring-boot:run`.

## What's implemented

- Register / login / logout, JWT access + refresh tokens stored in the platform secure
  storage (Keychain / Keystore-backed), with silent refresh-on-401 shared across concurrent
  requests (`lib/core/api/api_client.dart`).
- Task list: search (debounced), filter by status, pull-to-refresh, swipe-to-delete with
  confirmation.
- Create / edit task form (title, description, status), delete from the form too.
- API errors surfaced via snackbars using the backend's `{status, message, fields}` error
  shape.

## Structure

```
lib/
  core/api/        # dio client, auth interceptor + refresh dedupe, error shape
  core/storage/     # secure-storage-backed auth session persistence
  models/           # hand-rolled fromJson/toJson (no codegen — small contract)
  features/auth/    # AuthProvider (session state), login/register screens
  features/tasks/   # TaskProvider (list/filter/search state), list + form screens
```

State management is `provider` (`ChangeNotifier`s), matching the project's general
preference for the smallest tool that covers the need rather than a heavier framework — see
[../docs/decisions.md](../docs/decisions.md).

## Checks

```bash
flutter analyze
flutter test
flutter build apk --debug   # confirms a real Android artifact compiles
```

These three are gated in CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml),
`mobile` job).

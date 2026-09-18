# API

**Status:** Phase 2 backend contract. All endpoints below are implemented.

Base URL (local): `http://localhost:8080`

All task routes require a valid JWT unless noted.

Interactive docs (no auth required): Swagger UI at `/swagger-ui.html`, raw OpenAPI 3.1 spec at `/v3/api-docs`.

---

## Authentication

### `POST /api/auth/register` — public

Create a new user.

**Request body:**

| Field | Type | Rules |
| --- | --- | --- |
| email | string | valid email, unique |
| password | string | minimum length, never returned in responses |

**Responses:** `201 Created` with an [OAuth2-style token response](#token-response); `400` validation; `409` email already exists.

### `POST /api/auth/login` — public

Authenticate and receive a token pair.

**Request body:** email, password.

**Responses:** `200 OK` with an [OAuth2-style token response](#token-response); `401` invalid credentials.

### `POST /api/auth/refresh` — public

Exchange a valid, unexpired refresh token for a new access/refresh pair.

**Request body:** `{ "refresh_token": "<refresh token>" }`.

**Responses:** `200 OK` with an [OAuth2-style token response](#token-response); `401` if the token is missing, expired, or is actually an access token (access tokens are rejected here, and refresh tokens are rejected by every other endpoint — see [Using tokens](#using-tokens)).

### `GET /api/auth/me` — protected

Returns the current authenticated user. The identity always comes from the JWT, never a request parameter.

**Response:** `200 OK` with `{ id, email, createdAt }`. Passwords and password hashes are never returned.

---

## Tasks

Ownership rule: every operation uses the **authenticated user id** from the JWT. Never trust a client-supplied `userId`.

### `GET /api/tasks`

List tasks for the current user.

**Query parameters:**

| Parameter | Description |
| --- | --- |
| status | `TODO`, `IN_PROGRESS`, `DONE` |
| search | substring match on title/description |
| page | zero-based page index |
| size | page size |

**Response:** `200` with `{ content, page, size, totalElements, totalPages }`.

### `POST /api/tasks`

Create a task for the current user.

**Request body:** title (required), description (optional), status (optional, default `TODO`).

**Response:** `201 Created` with task body.

### `PUT /api/tasks/{id}`

Update a task owned by the current user.

**Response:** `200` with updated task; `404` if missing or not owned by the caller (never `403`, so ownership can't be probed).

### `DELETE /api/tasks/{id}`

Delete a task owned by the current user.

**Response:** `204 No Content`; `404` if missing or not owned by the caller.

---

## Error shape

Consistent JSON errors via `@RestControllerAdvice`, for example:

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-09-18T12:00:00Z",
  "path": "/api/tasks"
}
```

No stack traces or secrets in responses.

---

## Token response

`register`, `login` and `refresh` all return the same shape, modeled on the OAuth2 token
response (RFC 6749 §5.1):

```json
{
  "access_token": "<short-lived JWT, 15 min>",
  "refresh_token": "<long-lived JWT, 7 days>",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": { "id": 1, "email": "person@example.com", "createdAt": "2026-09-18T12:00:00Z" }
}
```

## Using tokens

Send the **access token** in every protected request:

```http
Authorization: Bearer <access_token>
```

When the access token expires, call `POST /api/auth/refresh` with the **refresh token**
to get a new pair — the user stays signed in without re-entering credentials.

The two token types are not interchangeable: the access token carries no `type` claim,
the refresh token carries `"type": "refresh"`. `/api/auth/refresh` rejects anything that
isn't a refresh token, and every other endpoint's JWT filter rejects anything that is one
— so a leaked refresh token can't be replayed directly against the API, and a leaked
access token can't be used to mint new tokens.

The frontend should use `GET /api/auth/me` as the source for the connected user displayed in the application shell.

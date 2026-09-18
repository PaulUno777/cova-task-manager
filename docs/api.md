# API (planned contract)

**Status:** endpoints below are **targets** for the assessment. They are not implemented in Phase 1.

Base URL (local): `http://localhost:8080`

All task routes require a valid JWT unless noted.

---

## Authentication

### `POST /api/auth/register`

Create a new user.

**Request body (planned):**

| Field | Type | Rules |
| --- | --- | --- |
| email | string | valid email, unique |
| password | string | minimum length, never returned in responses |

**Responses (planned):** `201 Created` with auth payload or user summary; `400` validation; `409` email already exists.

### `POST /api/auth/login`

Authenticate and receive a JWT.

**Request body (planned):** email, password.

**Responses (planned):** `200` with token (and optional user info); `401` invalid credentials.

---

## Tasks

Ownership rule: every operation uses the **authenticated user id** from the JWT. Never trust a client-supplied `userId`.

### `GET /api/tasks`

List tasks for the current user.

**Query parameters (planned):**

| Parameter | Description |
| --- | --- |
| status | `TODO`, `IN_PROGRESS`, `DONE` |
| search | substring match on title/description |
| page | zero-based page index |
| size | page size |

**Response (planned):** `200` with a page of task objects.

### `POST /api/tasks`

Create a task for the current user.

**Request body (planned):** title (required), description (optional), status (optional, default `TODO`).

**Response (planned):** `201 Created` with task body.

### `PUT /api/tasks/{id}`

Update a task owned by the current user.

**Response (planned):** `200` with updated task; `404` if missing or not owned.

### `DELETE /api/tasks/{id}`

Delete a task owned by the current user.

**Response (planned):** `204 No Content`; `404` if missing or not owned.

---

## Error shape (planned)

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

## Implementation note

When endpoints exist, update this document with real request/response examples and keep the frontend API client in sync.

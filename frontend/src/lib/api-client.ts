import { clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/auth-storage'
import type { AuthResponse } from '@/types/auth'
import type { ApiError } from '@/types/task'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export class ApiRequestError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(apiError: ApiError) {
    super(apiError.message)
    this.status = apiError.status
    this.fields = apiError.fields
  }
}

// Concurrent 401s must share a single refresh call, not fire one each.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const stored = getStoredAuth()
  if (!stored) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: stored.refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = (await response.json()) as AuthResponse
        setStoredAuth({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user,
        })
        return data.access_token
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Public auth endpoints (register/login/refresh): no bearer header, no refresh-retry on 401. */
  public?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, public: isPublic = false } = options

  const request = (accessToken?: string) =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

  const stored = getStoredAuth()
  const response = await request(isPublic ? undefined : stored?.accessToken)

  if (response.status === 401 && !isPublic && stored) {
    const newAccessToken = await refreshAccessToken()
    if (newAccessToken) {
      return handleResponse<T>(await request(newAccessToken))
    }
    clearStoredAuth()
    window.location.assign('/login')
    throw new ApiRequestError({
      status: 401,
      message: 'Session expired',
      timestamp: new Date().toISOString(),
      path,
    })
  }

  return handleResponse<T>(response)
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : undefined

  if (!response.ok) {
    throw new ApiRequestError(
      (data as ApiError) ?? {
        status: response.status,
        message: response.statusText || 'Request failed',
        timestamp: new Date().toISOString(),
        path: '',
      },
    )
  }

  return data as T
}

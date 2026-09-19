import { apiFetch } from '@/lib/api-client'
import type { AuthResponse, User } from '@/types/auth'

export function register(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password },
    public: true,
  })
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    public: true,
  })
}

export function me() {
  return apiFetch<User>('/auth/me')
}

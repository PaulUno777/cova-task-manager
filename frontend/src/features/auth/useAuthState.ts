import { useCallback, useMemo, useState } from 'react'

import { clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/auth-storage'
import type { User } from '@/types/auth'

import * as authApi from './api'
import type { AuthContextValue } from './auth-context'

export function useAuthState(): AuthContextValue {
  const [user, setUser] = useState<User | null>(() => getStoredAuth()?.user ?? null)

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    setStoredAuth({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user })
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await authApi.register(email, password)
    setStoredAuth({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user })
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
  }, [])

  return useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
}

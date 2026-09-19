export interface User {
  id: number
  email: string
  createdAt: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

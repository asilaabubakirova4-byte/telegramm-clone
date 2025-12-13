export interface User {
  id: string
  phone: string
  firstName: string
  lastName?: string | null
  username?: string | null
  bio?: string | null
  avatarUrl?: string | null
  onlineStatus: 'online' | 'offline'
  lastSeen: Date
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fields?: Record<string, string>
}

export interface LoginInput {
  phone: string
}

export interface RegisterInput {
  phone: string
  firstName: string
  lastName?: string
}

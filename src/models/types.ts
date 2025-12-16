import { Request } from 'express'

export interface User {
  id: string
  phone: string
  firstName: string
  lastName?: string | null
  username?: string | null
  avatarUrl?: string | null
  onlineStatus: 'online' | 'offline'
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserPublic {
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

export interface RegisterInput {
  phone: string
  firstName: string
  lastName?: string
}

export interface LoginInput {
  phone: string
}

export interface AuthResponse {
  user: UserPublic
  token: string
}

export interface JwtPayload {
  userId: string
  phone: string
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user?: UserPublic
  token?: string
  file?: any
  body: any
  params: any
  query: any
  headers: any
}

export type ChatType = 'direct' | 'group'
export type MemberRole = 'admin' | 'member'

export interface Chat {
  id: string
  type: ChatType
  name?: string | null
  creatorId?: string | null
  createdAt: Date
  updatedAt: Date
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file'
export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: MessageType
  fileUrl?: string | null
  thumbnailUrl?: string | null
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fields?: Record<string, string>
}

import api from './api'
import { ApiResponse, User } from '../types'

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
}

export const userApi = {
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/users/me')
    return response.data.data!.user
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/me/update', data)
    return response.data.data!.user
  },

  async uploadPhoto(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await api.put<ApiResponse<{ user: User }>>('/users/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data!.user
  },

  async deletePhoto(): Promise<User> {
    const response = await api.delete<ApiResponse<{ user: User }>>('/users/me/photo')
    return response.data.data!.user
  },

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<ApiResponse<{ users: User[] }>>(`/users/search?q=${encodeURIComponent(query)}`)
    return response.data.data!.users
  },
}

import api from './api'
import { ApiResponse } from '../types'

export interface ChatMember {
  id: string
  userId: string
  role: string
  user: {
    id: string
    firstName: string
    lastName?: string
    username?: string
    avatarUrl?: string
    onlineStatus: string
    lastSeen: string
  }
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: string
  fileUrl?: string
  createdAt: string
  seenBy?: string[] // User IDs who have seen this message
  sender: {
    id: string
    firstName: string
    lastName?: string
    username?: string
    avatarUrl?: string
  }
}

export interface Chat {
  id: string
  type: string
  name?: string
  createdAt: string
  updatedAt: string
  members: ChatMember[]
  messages: Message[]
}

export const chatApi = {
  // Create or get direct chat with user
  async createDirectChat(targetUserId: string): Promise<Chat> {
    const response = await api.post<ApiResponse<Chat>>('/chats/direct', { targetUserId })
    return response.data.data!
  },

  // Get all user's chats
  async getMyChats(): Promise<Chat[]> {
    const response = await api.get<ApiResponse<Chat[]>>('/chats')
    return response.data.data || []
  },

  // Get chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await api.get<ApiResponse<Chat>>(`/chats/${chatId}`)
    return response.data.data!
  },

  // Get messages for a chat
  async getMessages(chatId: string, limit = 50): Promise<Message[]> {
    const response = await api.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`, {
      params: { limit }
    })
    return response.data.data || []
  },

  // Send a message
  async sendMessage(chatId: string, content: string, type = 'text'): Promise<Message> {
    const response = await api.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, { content, type })
    return response.data.data!
  },

  // Upload file
  async uploadFile(chatId: string, file: File): Promise<Message> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<ApiResponse<Message>>(`/messages/${chatId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.data!
  },

  // Create group chat
  async createGroup(name: string, memberIds: string[]): Promise<Chat> {
    const response = await api.post<ApiResponse<Chat>>('/chats/group', { name, memberIds })
    return response.data.data!
  },

  // Create channel
  async createChannel(name: string, description: string, memberIds: string[]): Promise<Chat> {
    const response = await api.post<ApiResponse<Chat>>('/chats/channel', { name, description, memberIds })
    return response.data.data!
  },

  // Delete chat
  async deleteChat(chatId: string): Promise<void> {
    await api.delete(`/chats/${chatId}`)
  },

  // Mark messages as seen
  async markAsSeen(chatId: string, messageIds: string[]): Promise<void> {
    await api.post(`/chats/${chatId}/seen`, { messageIds })
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chats/messages/${messageId}`)
  },

  // Edit message
  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await api.put<ApiResponse<Message>>(`/chats/messages/${messageId}`, { content })
    return response.data.data!
  }
}

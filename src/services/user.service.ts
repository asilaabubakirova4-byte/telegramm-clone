import { prisma } from '../database/connection'
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors'
import { UserPublic } from '../models/types'
import fs from 'fs'
import path from 'path'

interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
}

export class UserService {
  async getProfile(userId: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user as UserPublic
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserPublic> {
    const { firstName, lastName, username, bio } = input

    // Validate input
    if (firstName !== undefined && firstName.trim().length < 1) {
      throw new ValidationError({ firstName: 'First name is required' })
    }

    // Check username uniqueness
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        throw new ConflictError('Username already taken')
      }

      // Validate username format
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)) {
        throw new ValidationError({ 
          username: 'Username must start with a letter, be 3-30 characters, and contain only letters, numbers, and underscores' 
        })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName?.trim() || null }),
        ...(username !== undefined && { username: username || null }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    return user as UserPublic
  }

  async updatePhoto(userId: string, avatarUrl: string): Promise<UserPublic> {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    })

    if (currentUser?.avatarUrl) {
      const oldPath = path.join('.', currentUser.avatarUrl)
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    return user as UserPublic
  }

  async deletePhoto(userId: string): Promise<UserPublic> {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    })

    if (currentUser?.avatarUrl) {
      const oldPath = path.join('.', currentUser.avatarUrl)
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    return user as UserPublic
  }

  async searchUsers(query: string, currentUserId: string): Promise<UserPublic[]> {
    const lowerQuery = query.toLowerCase()
    
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    // Filter in memory for case-insensitive search
    const filtered = users.filter(u => 
      u.firstName.toLowerCase().includes(lowerQuery) ||
      (u.lastName && u.lastName.toLowerCase().includes(lowerQuery)) ||
      (u.username && u.username.toLowerCase().includes(lowerQuery)) ||
      u.phone.includes(query)
    ).slice(0, 20)

    return filtered as UserPublic[]
  }
}

export const userService = new UserService()

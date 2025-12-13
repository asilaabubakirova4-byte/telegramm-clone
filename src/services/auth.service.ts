import jwt from 'jsonwebtoken'
import { config } from '../config'
import { prisma } from '../database/connection'
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors'
import { RegisterInput, LoginInput, AuthResponse, UserPublic, JwtPayload } from '../models/types'

export class AuthService {
  // Register - telefon raqam va ism bilan
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { phone, firstName, lastName } = input

    this.validateRegistrationInput(input)

    const normalizedPhone = this.normalizePhone(phone)

    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    })

    if (existingPhone) {
      throw new ConflictError('Phone number already registered')
    }

    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        firstName,
        lastName,
        onlineStatus: 'online',
        lastSeen: new Date(),
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

    const token = this.generateToken(user.id, user.phone)

    return {
      user: user as UserPublic,
      token,
    }
  }

  // Login - faqat telefon raqam bilan
  async login(input: LoginInput): Promise<AuthResponse> {
    const { phone } = input

    if (!phone || phone.trim() === '') {
      throw new ValidationError({ phone: 'Phone number is required' })
    }

    const normalizedPhone = this.normalizePhone(phone)

    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    })

    // Agar user topilmasa, yangi user yaratamiz
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          firstName: 'User',
          onlineStatus: 'online',
          lastSeen: new Date(),
        },
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          onlineStatus: 'online',
          lastSeen: new Date(),
        },
      })
    }

    const token = this.generateToken(user.id, user.phone)

    const userPublic: UserPublic = {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      onlineStatus: 'online',
      lastSeen: new Date(),
    }

    return {
      user: userPublic,
      token,
    }
  }

  async logout(token: string, userId: string): Promise<void> {
    const decoded = jwt.decode(token) as JwtPayload

    if (!decoded || !decoded.exp) {
      return
    }

    await prisma.blacklistedToken.create({
      data: {
        token,
        expiresAt: new Date(decoded.exp * 1000),
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        onlineStatus: 'offline',
        lastSeen: new Date(),
      },
    })
  }

  async verifyToken(token: string): Promise<UserPublic> {
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    })

    if (blacklisted) {
      throw new AuthenticationError('Token has been revoked')
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    return user as UserPublic
  }

  async getCurrentUser(userId: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        onlineStatus: true,
        lastSeen: true,
      },
    })

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    return user as UserPublic
  }

  private generateToken(userId: string, phone: string): string {
    const payload: JwtPayload = {
      userId,
      phone,
    }

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d',
    })
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '')
  }

  private validateRegistrationInput(input: RegisterInput): void {
    const errors: Record<string, string> = {}

    if (!input.phone || input.phone.trim() === '') {
      errors.phone = 'Phone number is required'
    } else if (!this.isValidPhone(input.phone)) {
      errors.phone = 'Invalid phone number format'
    }

    if (!input.firstName || input.firstName.trim() === '') {
      errors.firstName = 'First name is required'
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  private isValidPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 9
  }
}

export const authService = new AuthService()

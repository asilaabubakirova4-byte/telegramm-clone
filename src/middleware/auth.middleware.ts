import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { prisma } from '../database/connection'
import { AuthenticationError } from '../utils/errors'
import { AuthenticatedRequest, JwtPayload, UserPublic } from '../models/types'

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided')
    }

    const token = authHeader.split(' ')[1]

    // Check if token is blacklisted
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    })

    if (blacklisted) {
      throw new AuthenticationError('Token has been revoked')
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      throw new AuthenticationError('User not found')
    }

    req.user = user as UserPublic
    req.token = token
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'))
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'))
      return
    }
    next(error)
  }
}

import { Router, Response, NextFunction } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../models/types'
import { userService } from '../services/user.service'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/avatars'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    const user = await userService.getProfile(req.user.id)
    
    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/users/me/update - Update user profile
router.put('/me/update', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    const { firstName, lastName, username, bio } = req.body
    const user = await userService.updateProfile(req.user.id, { firstName, lastName, username, bio })
    
    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/users/me/photo - Upload user photo
router.put('/me/photo', authMiddleware, upload.single('photo'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No photo uploaded' })
      return
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    const user = await userService.updatePhoto(req.user.id, avatarUrl)
    
    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/users/me/photo - Delete user photo
router.delete('/me/photo', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    const user = await userService.deletePhoto(req.user.id)
    
    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/users/search - Search users
router.get('/search', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    const { q } = req.query
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: 'Search query is required' })
      return
    }
    
    const users = await userService.searchUsers(q, req.user.id)
    
    res.json({
      success: true,
      data: { users },
    })
  } catch (error) {
    next(error)
  }
})

export default router

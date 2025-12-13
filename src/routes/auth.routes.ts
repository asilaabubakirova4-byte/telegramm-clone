import { Router, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { authMiddleware } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../models/types'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res: Response, next: NextFunction) => {
  try {
    const { phone, firstName, lastName } = req.body
    const result = await authService.register({ phone, firstName, lastName })
    
    res.status(201).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body
    const result = await authService.login({ phone })
    
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.token && req.user) {
      await authService.logout(req.token, req.user.id)
    }
    
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }
    
    const user = await authService.getCurrentUser(req.user.id)
    
    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

export default router

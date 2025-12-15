import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../database/connection'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/files'

    if (file.mimetype.startsWith('image/')) {
      folder = 'uploads/images'
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'uploads/videos'
    }

    // Create folder if not exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }

    cb(null, folder)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'application/zip', 'application/x-rar-compressed',
      'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    cb(null, true) // Hozircha barcha fayllarni ruxsat beramiz
  }
})

// Upload file and send as message
router.post(
  '/:chatId/upload',
  upload.single('file'),
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      const { chatId } = req.params
      const file = req.file

      if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' })

      // Verify user is member of chat
      const isMember = await prisma.chatMember.findFirst({
        where: { chatId, userId }
      })
      if (!isMember) return res.status(403).json({ success: false, error: 'Not a member of this chat' })

      // Determine message type
      let type = 'file'
      if (file.mimetype.startsWith('image/')) type = 'image'
      else if (file.mimetype.startsWith('video/')) type = 'video'

      // Create message with file
      const message = await prisma.message.create({
        data: {
          chatId,
          senderId: userId,
          content: file.originalname,
          type,
          fileUrl: '/' + file.path.replace(/\\/g, '/')
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true }
          }
        }
      })

      // Update chat's updatedAt
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      })

      res.status(201).json({ success: true, data: message })
    } catch (error) {
      next(error)
    }
  }
)

export default router

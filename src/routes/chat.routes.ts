import { Router, Response, NextFunction } from 'express'
import { chatService } from '../services/chat.service'
import { AuthenticatedRequest } from '../models/types'

type AuthRequest = AuthenticatedRequest

const router = Router()

// Create or get direct chat
router.post('/direct', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { targetUserId } = req.body

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Target user ID is required' })
    }

    if (userId === targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot create chat with yourself' })
    }

    const chat = await chatService.createOrGetDirectChat(userId, targetUserId)
    res.json({ success: true, data: chat })
  } catch (error) {
    next(error)
  }
})

// Get all user's chats
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const chats = await chatService.getUserChats(userId)
    res.json({ success: true, data: chats })
  } catch (error) {
    next(error)
  }
})

// Get chat by ID
router.get('/:chatId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { chatId } = req.params

    const chat = await chatService.getChatById(chatId, userId)
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' })
    }

    res.json({ success: true, data: chat })
  } catch (error) {
    next(error)
  }
})

// Get messages for a chat
router.get('/:chatId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { chatId } = req.params
    const { limit, before } = req.query

    const messages = await chatService.getChatMessages(
      chatId,
      userId,
      limit ? parseInt(limit as string) : 50,
      before as string
    )

    res.json({ success: true, data: messages })
  } catch (error) {
    next(error)
  }
})

// Send a message
router.post('/:chatId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { chatId } = req.params
    const { content, type } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' })
    }

    const message = await chatService.sendMessage(chatId, userId, content.trim(), type)
    res.status(201).json({ success: true, data: message })
  } catch (error) {
    next(error)
  }
})

// Create group chat
router.post('/group', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { name, memberIds } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Group name is required' })
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one member is required' })
    }

    const chat = await chatService.createGroup(userId, name.trim(), memberIds)
    res.status(201).json({ success: true, data: chat })
  } catch (error) {
    next(error)
  }
})

// Create channel
router.post('/channel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { name, description, memberIds } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Channel name is required' })
    }

    const chat = await chatService.createChannel(userId, name.trim(), description?.trim() || '', memberIds || [])
    res.status(201).json({ success: true, data: chat })
  } catch (error) {
    next(error)
  }
})

// Delete message
router.delete('/messages/:messageId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { messageId } = req.params

    await chatService.deleteMessage(messageId, userId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Edit message
router.put('/messages/:messageId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { messageId } = req.params
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' })
    }

    const message = await chatService.editMessage(messageId, userId, content.trim())
    res.json({ success: true, data: message })
  } catch (error) {
    next(error)
  }
})

// Mark messages as seen
router.post('/:chatId/seen', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { chatId } = req.params
    const { messageIds } = req.body

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Message IDs are required' })
    }

    await chatService.markMessagesAsSeen(chatId, userId, messageIds)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Delete chat
router.delete('/:chatId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const { chatId } = req.params

    await chatService.deleteChat(chatId, userId)
    res.json({ success: true, message: 'Chat deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router

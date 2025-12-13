import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from './config'
import { connectDatabase, prisma } from './database/connection'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import chatRoutes from './routes/chat.routes'
import messageRoutes from './routes/message.routes'
import path from 'path'
import { authMiddleware } from './middleware/auth.middleware'
import jwt from 'jsonwebtoken'

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>()

// Socket.io authentication and handlers
io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token

  if (!token) {
    socket.disconnect()
    return
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    const userId = decoded.userId
    
    // Add user to online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId)!.add(socket.id)

    // Update user status to online
    await prisma.user.update({
      where: { id: userId },
      data: { onlineStatus: 'online', lastSeen: new Date() }
    })

    // Broadcast online status to all
    io.emit('user:online', { userId })
    console.log(`User ${userId} connected (socket: ${socket.id})`)

    // Send current online users list to the newly connected user
    const currentOnlineUsers = Array.from(onlineUsers.keys())
    socket.emit('users:online', { userIds: currentOnlineUsers })

    // Join user's chat rooms
    const userChats = await prisma.chatMember.findMany({
      where: { userId },
      select: { chatId: true }
    })
    userChats.forEach(chat => {
      socket.join(`chat:${chat.chatId}`)
    })

    // Handle typing start
    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:start', {
        chatId: data.chatId,
        userId
      })
    })

    // Handle typing stop
    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:stop', {
        chatId: data.chatId,
        userId
      })
    })

    // Handle new message (broadcast to chat members)
    socket.on('message:send', (data: { chatId: string; message: any }) => {
      socket.to(`chat:${data.chatId}`).emit('message:new', data.message)
    })

    // Handle message seen
    socket.on('message:seen', (data: { chatId: string; messageIds: string[] }) => {
      socket.to(`chat:${data.chatId}`).emit('message:seen', {
        chatId: data.chatId,
        messageIds: data.messageIds,
        userId
      })
    })

    // Handle message delete
    socket.on('message:delete', (data: { chatId: string; messageId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('message:delete', {
        chatId: data.chatId,
        messageId: data.messageId
      })
    })

    // Handle message edit
    socket.on('message:edit', (data: { chatId: string; message: any }) => {
      socket.to(`chat:${data.chatId}`).emit('message:edit', {
        chatId: data.chatId,
        message: data.message
      })
    })

    // Handle join chat room
    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`)
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId)
      if (userSockets) {
        userSockets.delete(socket.id)
        
        // If no more sockets, user is offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId)
          
          await prisma.user.update({
            where: { id: userId },
            data: { onlineStatus: 'offline', lastSeen: new Date() }
          })
          
          io.emit('user:offline', { userId })
          console.log(`User ${userId} disconnected`)
        }
      }
    })

  } catch (error) {
    console.error('Socket auth error:', error)
    socket.disconnect()
  }
})

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Serve frontend in production
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  
  // Handle client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next()
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chats', authMiddleware, chatRoutes)
app.use('/api/messages', authMiddleware, messageRoutes)

// Error handler
app.use(errorHandler)

// Start server
async function startServer() {
  await connectDatabase()
  
  // Server ishga tushganda barcha userlarni offline qilish
  await prisma.user.updateMany({
    data: { onlineStatus: 'offline' }
  })
  console.log('✅ All users set to offline on server start')
  
  httpServer.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`)
    console.log(`📡 WebSocket server ready`)
    console.log(`🌍 Environment: ${config.nodeEnv}`)
  })
}

startServer().catch(console.error)

export { app, io }

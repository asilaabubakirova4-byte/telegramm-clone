import { io, Socket } from 'socket.io-client'
import { config } from '../config/env'

const SOCKET_URL = config.SOCKET_URL

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    console.log('Connecting to socket...')
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    // Forward all events to registered listeners
    this.socket.onAny((event, ...args) => {
      console.log('📨 Socket event received:', event, args)
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        eventListeners.forEach(callback => callback(args[0]))
      }
    })
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...')
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    console.log(`📝 Listener added for: ${event}`)

    return () => {
      this.listeners.get(event)?.delete(callback)
      console.log(`🗑️ Listener removed for: ${event}`)
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      console.log('📤 Emitting:', event, data)
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event)
    }
  }

  joinChat(chatId: string) {
    this.emit('chat:join', chatId)
  }

  startTyping(chatId: string) {
    this.emit('typing:start', { chatId })
  }

  stopTyping(chatId: string) {
    this.emit('typing:stop', { chatId })
  }

  sendMessage(chatId: string, message: any) {
    this.emit('message:send', { chatId, message })
  }

  markAsSeen(chatId: string, messageIds: string[]) {
    this.emit('message:seen', { chatId, messageIds })
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()

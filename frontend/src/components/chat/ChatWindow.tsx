import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { useChatStore, CHAT_BACKGROUNDS, MESSAGE_COLORS } from '../../store/chat.store'
import { chatApi, Chat, Message } from '../../services/chat.service'
import { socketService } from '../../services/socket.service'
import MessageContextMenu from './MessageContextMenu'

const EMOJI_CATEGORIES = {
  recent: [] as string[],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '❤️‍🔥', '❤️‍🩹', '🫀', '🫶', '💑', '💏', '😍', '🥰', '😘', '😻'],
  sad: ['😢', '😭', '😿', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😥', '😰', '😨', '😧', '😦', '😱', '😓', '😪', '😴', '🤧', '😷', '🤒', '🤕', '💔', '🥀', '😤'],
  angry: ['😠', '😡', '🤬', '😤', '👿', '💢', '💥', '🔥', '😾', '👺', '👹', '💀', '☠️', '🤯', '😈', '🗯️', '💣', '🖕', '😒', '🙄'],
  gestures: ['👍', '👎', '👏', '🙏', '🤝', '💪', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✊', '👊', '🤛', '🤜', '👆', '👇', '👈', '👉', '☝️', '🫵', '🫱', '🫲'],
  animals: ['🐱', '🐶', '🐼', '🦊', '🦁', '🐸', '🐵', '🐰', '🐻', '🐨', '🐯', '🦄', '🐲', '🐍', '🦋', '🐝', '🐞', '🐢', '🐬', '🐳', '🦈', '🐙', '🦑', '🦀', '🐠', '🐟', '🐡', '🦐', '🦞', '🐚'],
  food: ['🍕', '🍔', '🍟', '🌮', '🍦', '🎂', '🍩', '🍪', '☕', '🍺', '🍷', '🍸', '🍹', '🥤', '🧃', '🍿', '🥨', '🥯', '🍞', '🥐', '🥖', '🧀', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖', '🌭', '🥪'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🏸', '🏒', '🥊', '🎯', '⛳', '🎿', '🏂', '🏋️', '🤸', '🚴', '🏊', '🎮', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻'],
  objects: ['💡', '🔦', '🕯️', '💎', '💰', '💳', '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '📺', '📻', '⏰', '⌚', '📿', '💍', '👑', '👒', '🎩', '🧢', '👓', '🕶️', '🥽', '🌂', '☂️', '🎒']
}

type EmojiCategory = keyof typeof EMOJI_CATEGORIES
const STICKERS = [
  '🐱', '🐶', '🐼', '🦊', '🦁', '🐸', '🐵', '🐰', '🐻', '🐨',
  '🦄', '🐲', '👻', '🤖', '👽', '💀', '🎃', '🦋', '🌈', '⭐',
  '🍕', '🍔', '🍟', '🌮', '🍦', '🎂', '🍩', '🍪', '☕', '🍺'
]

interface ChatWindowProps {
  chat: Chat
  onBack?: () => void
  onlineUsers: Set<string>
}

export default function ChatWindow({ chat, onBack, onlineUsers = new Set() }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const { chatBackground, customBackground, messageColor, setChatBackground, setCustomBackground } = useChatStore()
  const bgInputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState<EmojiCategory>('smileys')
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentEmojis')
    return saved ? JSON.parse(saved) : []
  })
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; message: Message; isOwn: boolean
  } | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isRecordingVideo, setIsRecordingVideo] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([])
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const videoChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isDark = theme === 'dark'
  const currentBg = CHAT_BACKGROUNDS.find(b => b.id === chatBackground) || CHAT_BACKGROUNDS[0]
  const currentMsgColor = MESSAGE_COLORS.find(c => c.id === messageColor) || MESSAGE_COLORS[0]
  
  const bgStyle = customBackground 
    ? { backgroundImage: `url(${customBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : currentBg.type === 'gradient' 
      ? { background: currentBg.color } 
      : { backgroundColor: isDark ? currentBg.color : (chatBackground.startsWith('default') ? '#e5ddd5' : currentBg.color) }

  const handleBgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomBackground(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
    setShowBgPicker(false)
  }
  const otherMember = chat.members.find(m => m.userId !== user?.id)
  const otherUser = otherMember?.user
  const otherUserId = otherMember?.userId
  const isOtherUserOnline = otherUserId ? onlineUsers.has(otherUserId) : false

  const getDisplayName = () => {
    if (!otherUser) return 'Chat'
    return otherUser.lastName ? `${otherUser.firstName} ${otherUser.lastName}` : otherUser.firstName
  }

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'last seen just now'
    if (minutes < 60) return `last seen ${minutes} minutes ago`
    if (hours < 24) return `last seen ${hours} hours ago`
    if (days === 1) return 'last seen yesterday'
    if (days < 7) return `last seen ${days} days ago`
    return `last seen ${date.toLocaleDateString()}`
  }

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true)
        const msgs = await chatApi.getMessages(chat.id)
        setMessages(msgs)
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()
  }, [chat.id])

  // Socket listeners
  useEffect(() => {
    socketService.joinChat(chat.id)

    const unsubTypingStart = socketService.on('typing:start', (data: { chatId: string; userId: string }) => {
      if (data.chatId === chat.id && data.userId === otherUserId) {
        setIsTyping(true)
      }
    })

    const unsubTypingStop = socketService.on('typing:stop', (data: { chatId: string; userId: string }) => {
      if (data.chatId === chat.id && data.userId === otherUserId) {
        setIsTyping(false)
      }
    })

    const unsubNewMessage = socketService.on('message:new', (message: Message) => {
      if (message.chatId === chat.id && message.senderId !== user?.id) {
        setMessages(prev => [...prev, message])
        // Mark as seen immediately
        chatApi.markAsSeen(chat.id, [message.id])
        socketService.markAsSeen(chat.id, [message.id])
      }
    })

    const unsubMessageSeen = socketService.on('message:seen', (data: { chatId: string; messageIds: string[]; userId: string }) => {
      if (data.chatId === chat.id && data.userId !== user?.id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, seenBy: [...(msg.seenBy || []), data.userId] }
            : msg
        ))
      }
    })

    const unsubMessageDelete = socketService.on('message:delete', (data: { chatId: string; messageId: string }) => {
      if (data.chatId === chat.id) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
      }
    })

    const unsubMessageEdit = socketService.on('message:edit', (data: { chatId: string; message: Message }) => {
      if (data.chatId === chat.id) {
        setMessages(prev => prev.map(msg => msg.id === data.message.id ? data.message : msg))
      }
    })

    return () => {
      unsubTypingStart()
      unsubTypingStop()
      unsubNewMessage()
      unsubMessageSeen()
      unsubMessageDelete()
      unsubMessageEdit()
    }
  }, [chat.id, otherUserId, user?.id])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as seen when chat is opened (only once when messages load)
  useEffect(() => {
    if (!isLoading && messages.length > 0 && user?.id) {
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== user.id && (!msg.seenBy || !msg.seenBy.includes(user.id))
      )
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id)
        chatApi.markAsSeen(chat.id, messageIds).catch(console.error)
        socketService.markAsSeen(chat.id, messageIds)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, chat.id, user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    socketService.startTyping(chat.id)
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(chat.id)
    }, 2000)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return
    
    // If editing, save edit instead
    if (editingMessage) {
      await handleSaveEdit()
      return
    }
    
    socketService.stopTyping(chat.id)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    try {
      setIsSending(true)
      const message = await chatApi.sendMessage(chat.id, newMessage.trim())
      setMessages(prev => [...prev, message])
      socketService.sendMessage(chat.id, message)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    // Add to recent emojis
    setRecentEmojis(prev => {
      const newRecent = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 20)
      localStorage.setItem('recentEmojis', JSON.stringify(newRecent))
      return newRecent
    })
    setShowEmojiPicker(false)
  }

  const handleStickerSend = async (sticker: string) => {
    try {
      setIsSending(true)
      const message = await chatApi.sendMessage(chat.id, sticker, 'sticker')
      setMessages(prev => [...prev, message])
      socketService.sendMessage(chat.id, message)
      setShowStickerPicker(false)
    } catch (error) {
      console.error('Failed to send sticker:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, inputRef: React.RefObject<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      setShowAttachMenu(false)
      const message = await chatApi.uploadFile(chat.id, file)
      setMessages(prev => [...prev, message])
      socketService.sendMessage(chat.id, message)
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (msgDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (msgDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
    }
  }

  const getDateKey = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = getDateKey(msg.createdAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(msg)
    return groups
  }, {} as Record<string, Message[]>)

  const handleContextMenu = (e: React.MouseEvent, msg: Message, isOwn: boolean) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg, isOwn })
  }

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await chatApi.deleteMessage(msgId)
      setMessages(prev => prev.filter(m => m.id !== msgId))
      socketService.emit('message:delete', { chatId: chat.id, messageId: msgId })
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
    setContextMenu(null)
  }

  const handleEditMessage = (msg: Message) => {
    setEditingMessage(msg)
    setNewMessage(msg.content)
    setContextMenu(null)
  }

  const handleSaveEdit = async () => {
    if (!editingMessage || !newMessage.trim()) return
    
    try {
      const updatedMessage = await chatApi.editMessage(editingMessage.id, newMessage.trim())
      setMessages(prev => prev.map(m => m.id === editingMessage.id ? updatedMessage : m))
      socketService.emit('message:edit', { chatId: chat.id, message: updatedMessage })
      setEditingMessage(null)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setNewMessage('')
  }

  // Voice message recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' })
        
        try {
          setIsUploading(true)
          const message = await chatApi.uploadFile(chat.id, file)
          // Override type to voice
          const voiceMessage = { ...message, type: 'voice' }
          setMessages(prev => [...prev, voiceMessage])
          socketService.sendMessage(chat.id, voiceMessage)
        } catch (error) {
          console.error('Failed to send voice message:', error)
        } finally {
          setIsUploading(false)
        }
        
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setIsRecordingVoice(true)
      setRecordingTime(0)
      
      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
        // Generate random waveform for visual effect
        setVoiceWaveform(prev => [...prev.slice(-20), Math.random() * 100])
      }, 100)
    } catch (error) {
      console.error('Failed to start voice recording:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop()
      setIsRecordingVoice(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setVoiceWaveform([])
    }
  }

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop()
      audioChunksRef.current = []
      setIsRecordingVoice(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setVoiceWaveform([])
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  // Video note recording (circular video)
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
      }
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        const file = new File([videoBlob], `video_note_${Date.now()}.webm`, { type: 'video/webm' })
        
        try {
          setIsUploading(true)
          const message = await chatApi.uploadFile(chat.id, file)
          // Override type to video_note
          const videoNoteMessage = { ...message, type: 'video_note' }
          setMessages(prev => [...prev, videoNoteMessage])
          socketService.sendMessage(chat.id, videoNoteMessage)
        } catch (error) {
          console.error('Failed to send video note:', error)
        } finally {
          setIsUploading(false)
        }
        
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setIsRecordingVideo(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start video recording:', error)
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop()
      setIsRecordingVideo(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop()
      videoChunksRef.current = []
      setIsRecordingVideo(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderMessage = (msg: Message, isOwn: boolean) => {
    // Sticker - katta ko'rinishda, bubble siz
    if (msg.type === 'sticker') {
      return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="text-[80px] sm:text-[100px] leading-none select-none hover:scale-110 transition-transform cursor-default">
            {msg.content}
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            {formatTime(msg.createdAt)}
          </p>
        </div>
      )
    }

    // Voice message
    if (msg.type === 'voice' && msg.fileUrl) {
      const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
      return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl max-w-[280px] ${isOwn ? 'bg-[#3390ec] rounded-br-sm' : isDark ? 'bg-[#182533] rounded-bl-sm' : 'bg-white rounded-bl-sm'}`}>
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOwn ? 'bg-white/20' : 'bg-[#3390ec]'}`}
            onClick={(e) => {
              const audio = e.currentTarget.parentElement?.querySelector('audio')
              if (audio) {
                if (audio.paused) audio.play()
                else audio.pause()
              }
            }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 h-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`w-1 rounded-full ${isOwn ? 'bg-white/50' : 'bg-[#3390ec]/50'}`} style={{ height: `${Math.random() * 100}%` }} />
              ))}
            </div>
            <audio src={`http://localhost:3001${msg.fileUrl}`} className="hidden" />
          </div>
          <div className={`flex items-center gap-1 text-xs shrink-0 ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            <span>{formatTime(msg.createdAt)}</span>
            {isOwn && <span className={isSeen ? 'text-[#4fc3f7]' : ''}>{isSeen ? '✓✓' : '✓'}</span>}
          </div>
        </div>
      )
    }

    // Video note (circular video)
    if (msg.type === 'video_note' && msg.fileUrl) {
      const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
      return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-[#3390ec] cursor-pointer group">
            <video 
              src={`http://localhost:3001${msg.fileUrl}`} 
              className="w-full h-full object-cover"
              onClick={(e) => {
                const video = e.currentTarget
                if (video.paused) video.play()
                else video.pause()
              }}
              loop
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            <span>{formatTime(msg.createdAt)}</span>
            {isOwn && <span className={isSeen ? 'text-[#4fc3f7]' : ''}>{isSeen ? '✓✓' : '✓'}</span>}
          </div>
        </div>
      )
    }

    const isGradient = currentMsgColor.own.startsWith('linear-gradient')
    const ownBubbleStyle = isGradient 
      ? { background: currentMsgColor.own } 
      : { backgroundColor: currentMsgColor.own }
    const otherBubbleStyle = { backgroundColor: isDark ? currentMsgColor.other : '#ffffff' }
    
    const bubbleClass = isOwn 
      ? `text-white rounded-2xl rounded-br-sm`
      : `${isDark ? 'text-white' : 'text-black'} rounded-2xl rounded-bl-sm`

    if (msg.type === 'image' && msg.fileUrl) {
      // Check if OTHER user has seen this message (not the sender)
      const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
      return (
        <div className={`${bubbleClass} p-1 overflow-hidden max-w-[280px] sm:max-w-[320px]`} style={isOwn ? ownBubbleStyle : otherBubbleStyle}>
          <img 
            src={`http://localhost:3001${msg.fileUrl}`} 
            alt={msg.content} 
            className="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => window.open(`http://localhost:3001${msg.fileUrl}`, '_blank')} 
          />
          <div className={`flex items-center justify-end gap-1 px-2 py-1 ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            <span className="text-xs">{formatTime(msg.createdAt)}</span>
            {isOwn && <span className={`text-xs ${isSeen ? 'text-[#4fc3f7]' : ''}`}>{isSeen ? '✓✓' : '✓'}</span>}
          </div>
        </div>
      )
    }

    if (msg.type === 'video' && msg.fileUrl) {
      // Check if OTHER user has seen this message (not the sender)
      const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
      return (
        <div className={`${bubbleClass} p-1 overflow-hidden max-w-[280px] sm:max-w-[320px]`} style={isOwn ? ownBubbleStyle : otherBubbleStyle}>
          <video src={`http://localhost:3001${msg.fileUrl}`} controls className="w-full rounded-xl" />
          <div className={`flex items-center justify-end gap-1 px-2 py-1 ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            <span className="text-xs">{formatTime(msg.createdAt)}</span>
            {isOwn && <span className={`text-xs ${isSeen ? 'text-[#4fc3f7]' : ''}`}>{isSeen ? '✓✓' : '✓'}</span>}
          </div>
        </div>
      )
    }

    if (msg.type === 'file' && msg.fileUrl) {
      // Check if OTHER user has seen this message (not the sender)
      const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
      return (
        <div className={`${bubbleClass} px-3 py-2 max-w-[280px] sm:max-w-[320px]`} style={isOwn ? ownBubbleStyle : otherBubbleStyle}>
          <a href={`http://localhost:3001${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-[#3390ec]'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{msg.content}</p>
              <p className={`text-xs ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>File</p>
            </div>
          </a>
          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            <span className="text-xs">{formatTime(msg.createdAt)}</span>
            {isOwn && <span className={`text-xs ${isSeen ? 'text-[#4fc3f7]' : ''}`}>{isSeen ? '✓✓' : '✓'}</span>}
          </div>
        </div>
      )
    }

    // Text message
    // Check if OTHER user has seen this message (not the sender)
    const isSeen = msg.seenBy && msg.seenBy.some(id => id !== msg.senderId)
    return (
      <div className={`${bubbleClass} px-3 py-2 max-w-[280px] sm:max-w-[400px]`} style={isOwn ? ownBubbleStyle : otherBubbleStyle}>
        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
          <span className="text-xs">{formatTime(msg.createdAt)}</span>
          {isOwn && (
            <span className={`text-xs ${isSeen ? 'text-[#4fc3f7]' : ''}`}>
              {isSeen ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={bgStyle}>
      {/* Header */}
      <div className={`h-14 flex items-center px-3 gap-3 shrink-0 ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'} border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
        {onBack && (
          <button onClick={onBack} className={`p-2 rounded-lg sm:hidden ${isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="relative shrink-0">
          <div className="w-10 h-10 bg-[#3390ec] rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
            {otherUser?.avatarUrl ? (
              <img src={`http://localhost:3001${otherUser.avatarUrl}`} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(getDisplayName())
            )}
          </div>
          {isOtherUserOnline && (
            <div className={`absolute bottom-0 right-0 w-3 h-3 bg-[#4dcd5e] rounded-full border-2 ${isDark ? 'border-[#17212b]' : 'border-[#f0f2f5]'}`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{getDisplayName()}</p>
          <p className={`text-sm truncate ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            {isTyping ? (
              <span className="text-[#3390ec] flex items-center gap-1">
                typing
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-[#3390ec] rounded-full typing-dot" />
                  <span className="w-1 h-1 bg-[#3390ec] rounded-full typing-dot" />
                  <span className="w-1 h-1 bg-[#3390ec] rounded-full typing-dot" />
                </span>
              </span>
            ) : isOtherUserOnline ? (
              <span className="text-[#4dcd5e]">online</span>
            ) : otherUser?.lastSeen ? (
              formatLastSeen(otherUser.lastSeen)
            ) : (
              'last seen recently'
            )}
          </p>
        </div>

        <button className={`p-2 rounded-lg ${isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Background picker button */}
        <button 
          onClick={() => setShowBgPicker(!showBgPicker)}
          className={`p-2 rounded-lg ${showBgPicker ? 'text-[#3390ec]' : isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Background Picker */}
      {showBgPicker && (
        <div className={`absolute top-14 right-4 z-20 p-3 rounded-xl shadow-xl max-w-[220px] ${isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'}`}>
          <p className={`text-xs mb-2 uppercase ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Chat Background</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CHAT_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => { setChatBackground(bg.id); setShowBgPicker(false); }}
                className={`w-12 h-12 rounded-lg transition-all ${chatBackground === bg.id && !customBackground ? 'ring-2 ring-[#3390ec]' : ''}`}
                style={bg.type === 'gradient' ? { background: bg.color } : { backgroundColor: bg.color }}
              />
            ))}
          </div>
          
          {/* Gallery button */}
          <input 
            ref={bgInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleBgImageSelect} 
            className="hidden" 
          />
          <button
            onClick={() => bgInputRef.current?.click()}
            className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'bg-[#232e3c] text-white hover:bg-[#2d3a4d]' : 'bg-[#e4e6eb] text-black hover:bg-[#d8dadf]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Choose from Gallery</span>
          </button>
          
          {customBackground && (
            <button
              onClick={() => { setCustomBackground(null); setShowBgPicker(false); }}
              className="w-full mt-2 py-2 px-3 rounded-lg text-[#e53935] text-sm hover:bg-[#e53935]/10"
            >
              Remove Custom Background
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#232e3c]' : 'bg-white'}`}>
              <svg className="w-10 h-10 text-[#3390ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className={isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}>No messages yet</p>
            <p className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex justify-center my-3">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  isDark ? 'bg-[#182533]/80 text-[#6c7883]' : 'bg-white/80 text-[#65676b]'
                } shadow-sm`}>
                  {formatDateSeparator(dateMessages[0].createdAt)}
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((msg) => {
                const isOwn = msg.senderId === user?.id
                return (
                  <div 
                    key={msg.id} 
                    className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => handleContextMenu(e, msg, isOwn)}
                  >
                    {renderMessage(msg, isOwn)}
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={contextMenu.isOwn}
          messageType={contextMenu.message.type}
          fileUrl={contextMenu.message.fileUrl}
          content={contextMenu.message.content}
          onClose={() => setContextMenu(null)}
          onCopy={() => {}}
          onEdit={contextMenu.isOwn && contextMenu.message.type === 'text' ? () => handleEditMessage(contextMenu.message) : undefined}
          onDelete={contextMenu.isOwn ? () => handleDeleteMessage(contextMenu.message.id) : undefined}
          onSave={() => {}}
        />
      )}

      {/* Emoji Picker with Categories */}
      {showEmojiPicker && (
        <div className={`absolute bottom-20 left-4 right-4 sm:left-auto sm:right-auto sm:w-[340px] rounded-xl shadow-xl z-10 ${isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'}`}>
          {/* Category Tabs */}
          <div className={`flex items-center gap-1 p-2 border-b overflow-x-auto scrollbar-hide ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
            {recentEmojis.length > 0 && (
              <button
                onClick={() => setEmojiCategory('recent')}
                className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'recent' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
                title="Recent"
              >🕐</button>
            )}
            <button
              onClick={() => setEmojiCategory('smileys')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'smileys' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Smileys"
            >😀</button>
            <button
              onClick={() => setEmojiCategory('hearts')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'hearts' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Hearts"
            >❤️</button>
            <button
              onClick={() => setEmojiCategory('sad')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'sad' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Sad"
            >😢</button>
            <button
              onClick={() => setEmojiCategory('angry')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'angry' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Angry"
            >😠</button>
            <button
              onClick={() => setEmojiCategory('gestures')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'gestures' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Gestures"
            >👍</button>
            <button
              onClick={() => setEmojiCategory('animals')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'animals' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Animals"
            >🐱</button>
            <button
              onClick={() => setEmojiCategory('food')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'food' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Food"
            >🍕</button>
            <button
              onClick={() => setEmojiCategory('activities')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'activities' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Activities"
            >⚽</button>
            <button
              onClick={() => setEmojiCategory('objects')}
              className={`p-2 rounded-lg text-lg shrink-0 transition-colors ${emojiCategory === 'objects' ? 'bg-[#3390ec] text-white' : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              title="Objects"
            >💡</button>
          </div>
          
          {/* Emoji Grid */}
          <div className="p-2 max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {(emojiCategory === 'recent' ? recentEmojis : EMOJI_CATEGORIES[emojiCategory]).map((emoji, i) => (
                <button 
                  key={i} 
                  onClick={() => handleEmojiClick(emoji)} 
                  className={`w-8 h-8 text-xl rounded transition-all hover:scale-110 ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <div className={`absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 rounded-xl p-3 shadow-xl z-10 ${isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'}`}>
          <p className={`text-xs mb-2 uppercase ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Stickers</p>
          <div className="grid grid-cols-5 gap-2">
            {STICKERS.map((sticker, i) => (
              <button 
                key={i} 
                onClick={() => handleStickerSend(sticker)} 
                className={`w-12 h-12 text-3xl rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Recording Preview */}
      {isRecordingVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
          <div className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-[#e53935]">
            <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button onClick={cancelVideoRecording} className="w-12 h-12 rounded-full bg-[#e53935] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button onClick={stopVideoRecording} className="w-16 h-16 rounded-full bg-[#3390ec] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-3 relative shrink-0 ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'} border-t ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
        {/* Voice Recording Indicator */}
        {isRecordingVoice && (
          <div className={`absolute inset-0 flex items-center justify-between px-4 ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#e53935] rounded-full animate-pulse" />
              <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{formatRecordingTime(Math.floor(recordingTime / 10))}</span>
              <div className="flex items-center gap-0.5 h-6">
                {voiceWaveform.slice(-15).map((h, i) => (
                  <div key={i} className="w-1 bg-[#3390ec] rounded-full transition-all" style={{ height: `${Math.max(4, h * 0.24)}px` }} />
                ))}
              </div>
            </div>
            <span className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Release to send, slide to cancel</span>
          </div>
        )}
        
        {isUploading && (
          <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-[#17212b]/90' : 'bg-[#f0f2f5]/90'}`}>
            <div className={`flex items-center gap-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
              <div className="w-5 h-5 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          </div>
        )}

        {/* Editing indicator */}
        {editingMessage && (
          <div className={`flex items-center justify-between mb-2 px-2 py-1 rounded-lg ${isDark ? 'bg-[#232e3c]' : 'bg-[#e4e6eb]'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3390ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Editing message</span>
            </div>
            <button onClick={handleCancelEdit} className={`p-1 rounded ${isDark ? 'hover:bg-[#17212b]' : 'hover:bg-[#dddfe2]'}`}>
              <svg className="w-4 h-4 text-[#6c7883]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Hidden file inputs */}
          <input ref={imageInputRef} type="file" onChange={(e) => handleFileSelect(e, imageInputRef)} className="hidden" accept="image/*" />
          <input ref={videoInputRef} type="file" onChange={(e) => handleFileSelect(e, videoInputRef)} className="hidden" accept="video/*" />
          <input ref={fileInputRef} type="file" onChange={(e) => handleFileSelect(e, fileInputRef)} className="hidden" accept=".pdf,.doc,.docx,.zip,.rar,.txt,.xls,.xlsx,.ppt,.pptx" />
          
          {/* Attach button with menu */}
          <div className="relative">
            <button 
              onClick={() => setShowAttachMenu(!showAttachMenu)} 
              className={`p-2 rounded-lg shrink-0 ${showAttachMenu ? 'text-[#3390ec]' : isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            {/* Attach Menu */}
            {showAttachMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                <div className={`absolute bottom-12 left-0 z-20 rounded-xl shadow-xl overflow-hidden ${isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'}`}>
                  <button
                    onClick={() => { imageInputRef.current?.click(); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#4caf50] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className={isDark ? 'text-white' : 'text-black'}>Photo</span>
                  </button>
                  <button
                    onClick={() => { videoInputRef.current?.click(); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e53935] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className={isDark ? 'text-white' : 'text-black'}>Video</span>
                  </button>
                  <button
                    onClick={() => { fileInputRef.current?.click(); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#3390ec] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className={isDark ? 'text-white' : 'text-black'}>File</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          <input 
            type="text" 
            value={newMessage} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyDown} 
            placeholder="Write a message..." 
            className={`flex-1 px-4 py-2 rounded-full text-sm focus:outline-none ${
              isDark 
                ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' 
                : 'bg-white text-black placeholder-[#65676b] border border-[#dddfe2]'
            }`}
          />

          <button 
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }} 
            className={`p-2 rounded-lg shrink-0 ${showEmojiPicker ? 'text-[#3390ec]' : isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button 
            onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }} 
            className={`p-2 rounded-lg shrink-0 ${showStickerPicker ? 'text-[#3390ec]' : isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7z"/>
            </svg>
          </button>
          
          {newMessage.trim() ? (
            <button 
              onClick={handleSend} 
              disabled={isSending} 
              className="p-2 text-[#3390ec] hover:text-[#4ea4f6] disabled:opacity-50 shrink-0"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <>
              {/* Voice message button */}
              <button 
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onMouseLeave={cancelVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                className={`p-2 shrink-0 ${isRecordingVoice ? 'text-[#e53935]' : isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}
                title="Hold to record voice"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              {/* Video note button */}
              <button 
                onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                className={`p-2 shrink-0 ${isRecordingVideo ? 'text-[#e53935]' : isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}
                title={isRecordingVideo ? 'Stop recording' : 'Record video note'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

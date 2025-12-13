import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { userApi } from '../../services/user.service'
import { chatApi, Chat } from '../../services/chat.service'
import { User } from '../../types'
import UserMenu from './UserMenu'

interface ChatSidebarProps {
  onSelectChat: (chat: Chat | null) => void
  selectedChat: Chat | null
  onOpenProfile: () => void
  onOpenSettings: () => void
  chats: Chat[]
  onChatsUpdate: () => void
  onlineUsers: Set<string>
  isLoading?: boolean
  unreadCounts?: Record<string, number>
  activeFolder?: 'all' | 'groups' | 'channels' | 'private' | 'unread'
}

export default function ChatSidebar({ 
  onSelectChat, 
  selectedChat, 
  onOpenProfile, 
  onOpenSettings, 
  chats, 
  onChatsUpdate, 
  onlineUsers = new Set(),
  isLoading = false,
  unreadCounts = {},
  activeFolder = 'all'
}: ChatSidebarProps) {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chatId: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isDark = theme === 'dark'

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, chatId })
  }

  const handleDeleteChat = async () => {
    if (!contextMenu || isDeleting) return
    try {
      setIsDeleting(true)
      await chatApi.deleteChat(contextMenu.chatId)
      if (selectedChat?.id === contextMenu.chatId) {
        onSelectChat(null)
      }
      onChatsUpdate()
    } catch (error) {
      console.error('Failed to delete chat:', error)
    } finally {
      setIsDeleting(false)
      setContextMenu(null)
    }
  }

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }
      try {
        setIsSearching(true)
        const users = await userApi.searchUsers(searchQuery)
        setSearchResults(users)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  const getDisplayName = (u: { firstName: string; lastName?: string | null }) => {
    return u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName
  }

  const handleUserClick = async (selectedUser: User) => {
    if (isCreatingChat) return
    try {
      setIsCreatingChat(true)
      const chat = await chatApi.createDirectChat(selectedUser.id)
      setSearchQuery('')
      setSearchResults([])
      onChatsUpdate()
      onSelectChat(chat)
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const getOtherUser = (chat: Chat) => {
    return chat.members.find(m => m.userId !== user?.id)?.user
  }

  const getOtherUserId = (chat: Chat) => {
    return chat.members.find(m => m.userId !== user?.id)?.userId
  }

  // Filter chats based on active folder
  const filteredChats = chats.filter(chat => {
    if (activeFolder === 'all') return true
    if (activeFolder === 'groups') return chat.type === 'group'
    if (activeFolder === 'channels') return chat.type === 'channel'
    if (activeFolder === 'private') return chat.type === 'direct'
    if (activeFolder === 'unread') return (unreadCounts[chat.id] || 0) > 0
    return true
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) {
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
      {/* Header */}
      <div className="p-2 flex items-center gap-2 shrink-0">
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className={`p-2.5 rounded-lg transition-colors sm:hidden ${isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#3390ec]/50 transition-all ${
              isDark 
                ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' 
                : 'bg-white text-black placeholder-[#65676b] border border-[#dddfe2]'
            }`}
          />
          <svg className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSearchResults([]); }} 
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showMenu && user && (
        <UserMenu user={user} onClose={() => setShowMenu(false)} onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
      )}

      {/* Context Menu for Delete Chat */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div 
            className={`fixed z-50 rounded-xl shadow-xl overflow-hidden ${isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'}`}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleDeleteChat}
              disabled={isDeleting}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[#e53935] transition-colors ${
                isDark ? 'hover:bg-[#e53935]/10' : 'hover:bg-[#e53935]/10'
              } ${isDeleting ? 'opacity-50' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? 'Deleting...' : 'Delete Chat'}</span>
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
          </div>
        ) : searchQuery.trim().length >= 2 ? (
          /* Search Results */
          <div>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <p className={`px-4 py-2 text-xs uppercase ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Global Search</p>
                {searchResults.map((u) => {
                  const isOnline = onlineUsers.has(u.id)
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'
                      } ${isCreatingChat ? 'opacity-50' : ''}`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 bg-[#3390ec] rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={`http://localhost:3001${u.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(getDisplayName(u))
                          )}
                        </div>
                        {isOnline && (
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4dcd5e] rounded-full border-2 ${isDark ? 'border-[#17212b]' : 'border-[#f0f2f5]'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{getDisplayName(u)}</p>
                        <p className={`text-sm truncate ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
                          {isOnline ? (
                            <span className="text-[#4dcd5e]">online</span>
                          ) : (
                            u.username ? `@${u.username}` : u.phone
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <svg className={`w-16 h-16 mb-4 ${isDark ? 'text-[#3d4d5c]' : 'text-[#bcc0c4]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className={isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}>No results found</p>
              </div>
            )}
          </div>
        ) : filteredChats.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <svg className={`w-16 h-16 mb-4 ${isDark ? 'text-[#3d4d5c]' : 'text-[#bcc0c4]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className={isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}>No chats yet</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
              Search for users to start chatting
            </p>
          </div>
        ) : (
          /* Chat List */
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat)
            const otherUserId = getOtherUserId(chat)
            const lastMessage = chat.messages[0]
            const isSelected = selectedChat?.id === chat.id
            const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false
            const unreadCount = unreadCounts[chat.id] || 0
            
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                onContextMenu={(e) => handleContextMenu(e, chat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#3390ec] sm:ml-[-80px] sm:pl-[92px]' 
                    : isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-medium overflow-hidden ${
                    isSelected ? 'bg-white/20' : 'bg-[#3390ec]'
                  }`}>
                    {otherUser?.avatarUrl ? (
                      <img src={`http://localhost:3001${otherUser.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(otherUser ? getDisplayName(otherUser) : 'CH')
                    )}
                  </div>
                  {isOnline && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-[#4dcd5e] rounded-full border-2 ${
                      isSelected ? 'border-[#3390ec]' : isDark ? 'border-[#17212b]' : 'border-[#f0f2f5]'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate text-sm ${isSelected ? 'text-white' : isDark ? 'text-white' : 'text-black'}`}>
                      {otherUser ? getDisplayName(otherUser) : 'Chat'}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {lastMessage && (
                        <span className={`text-xs ${isSelected ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${isSelected ? 'text-white/70' : isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
                      {lastMessage 
                        ? lastMessage.type === 'sticker' 
                          ? '🎭 Sticker' 
                          : lastMessage.content 
                        : isOnline 
                          ? <span className="text-[#4dcd5e]">online</span>
                          : otherUser?.lastSeen 
                            ? `last seen ${formatLastSeen(otherUser.lastSeen)}` 
                            : 'No messages yet'
                      }
                    </p>
                    {unreadCount > 0 && !isSelected && (
                      <div className="min-w-[20px] h-5 bg-[#3390ec] rounded-full flex items-center justify-center px-1.5 ml-2">
                        <span className="text-white text-xs font-medium">{unreadCount > 99 ? '99+' : unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

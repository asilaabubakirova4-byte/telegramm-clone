import { useState, useEffect } from 'react'
import { ChatSidebar, EmptyChat, ProfilePage, SettingsPage } from '../components/chat'
import ChatWindow from '../components/chat/ChatWindow'
import { chatApi, Chat } from '../services/chat.service'
import { socketService } from '../services/socket.service'
import { useThemeStore } from '../store/theme.store'
import { useAuthStore } from '../store/auth.store'
import UserMenu from '../components/chat/UserMenu'

type FolderType = 'all' | 'groups' | 'channels' | 'private' | 'unread'

interface ChatFolder {
  id: FolderType
  name: string
  icon: string
}

const DEFAULT_FOLDERS: ChatFolder[] = [
  { id: 'all', name: 'All Chats', icon: 'all' },
  { id: 'groups', name: 'Groups', icon: 'groups' },
  { id: 'channels', name: 'Channels', icon: 'channels' },
  { id: 'private', name: 'Private', icon: 'private' },
  { id: 'unread', name: 'Unread', icon: 'unread' },
]

export default function ChatPage() {
  const { user } = useAuthStore()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [activeFolder, setActiveFolder] = useState<FolderType>('all')
  const [showFolderEdit, setShowFolderEdit] = useState(false)
  const [folders, setFolders] = useState<ChatFolder[]>(DEFAULT_FOLDERS)
  const { theme } = useThemeStore()

  const isDark = theme === 'dark'

  const loadChats = async () => {
    try {
      const userChats = await chatApi.getMyChats()
      setChats(userChats)
      const online = new Set<string>()
      userChats.forEach(chat => {
        chat.members.forEach(member => {
          if (member.user.onlineStatus === 'online') {
            online.add(member.userId)
          }
        })
      })
      setOnlineUsers(online)
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoadingChats(false)
    }
  }

  useEffect(() => { loadChats() }, [])

  useEffect(() => {
    const unsubOnlineList = socketService.on('users:online', (data: { userIds: string[] }) => {
      setOnlineUsers(new Set(data.userIds))
    })
    const unsubOnline = socketService.on('user:online', (data: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]))
      setChats(prevChats => prevChats.map(chat => ({
        ...chat,
        members: chat.members.map(member => 
          member.userId === data.userId ? { ...member, user: { ...member.user, onlineStatus: 'online' } } : member
        )
      })))
    })
    const unsubOffline = socketService.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => { const newSet = new Set(prev); newSet.delete(data.userId); return newSet })
      setChats(prevChats => prevChats.map(chat => ({
        ...chat,
        members: chat.members.map(member => 
          member.userId === data.userId ? { ...member, user: { ...member.user, onlineStatus: 'offline' } } : member
        )
      })))
    })
    const unsubNewMessage = socketService.on('message:new', (message: { chatId: string }) => {
      if (selectedChat?.id !== message.chatId) {
        setUnreadCounts(prev => ({ ...prev, [message.chatId]: (prev[message.chatId] || 0) + 1 }))
      }
    })
    return () => { unsubOnlineList(); unsubOnline(); unsubOffline(); unsubNewMessage() }
  }, [selectedChat?.id])

  useEffect(() => {
    if (selectedChat) {
      const updatedChat = chats.find(c => c.id === selectedChat.id)
      if (updatedChat) setSelectedChat(updatedChat)
      setUnreadCounts(prev => ({ ...prev, [selectedChat.id]: 0 }))
    }
  }, [chats, selectedChat?.id])

  const handleSelectChat = (chat: Chat | null) => {
    setSelectedChat(chat)
    if (chat) { setShowMobileChat(true); setUnreadCounts(prev => ({ ...prev, [chat.id]: 0 })) }
  }

  const handleBack = () => { setShowMobileChat(false); setSelectedChat(null) }

  return (
    <div className={`h-screen flex overflow-hidden ${isDark ? 'bg-[#0e1621]' : 'bg-white'}`}>
      {/* Left Sidebar - Toggle, Folders and Settings */}
      <div className={`w-[80px] shrink-0 flex-col items-center py-3 hidden sm:flex ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        {/* Menu Toggle */}
        <button onClick={() => setShowMenu(!showMenu)} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-colors text-[#3390ec] hover:bg-[#3390ec]/10" title="Menu">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        {/* Folder Icons with Names and Unread Counts */}
        <div className="flex flex-col items-center gap-2 mt-4">
          {folders.map((folder) => {
            // Calculate unread count for this folder
            const folderUnreadCount = chats.reduce((count, chat) => {
              const chatUnread = unreadCounts[chat.id] || 0
              if (folder.id === 'all') return count + chatUnread
              if (folder.id === 'groups' && chat.type === 'group') return count + chatUnread
              if (folder.id === 'channels' && chat.type === 'channel') return count + chatUnread
              if (folder.id === 'private' && chat.type === 'direct') return count + chatUnread
              if (folder.id === 'unread' && chatUnread > 0) return count + chatUnread
              return count
            }, 0)
            
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-16 py-2 rounded-2xl flex flex-col items-center justify-center transition-colors relative ${
                  activeFolder === folder.id
                    ? 'bg-[#3390ec]/15 text-[#3390ec]'
                    : 'text-[#3390ec] hover:bg-[#3390ec]/10'
                }`}
                title={folder.name}
              >
                {folder.icon === 'all' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                )}
                {folder.icon === 'groups' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                )}
                {folder.icon === 'channels' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                )}
                {folder.icon === 'private' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
                {folder.icon === 'unread' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )}
                <span className="text-[10px] mt-1 font-medium">{folder.id === 'all' ? 'All' : folder.id === 'groups' ? 'Groups' : folder.id === 'channels' ? 'Channels' : folder.id === 'private' ? 'Private' : 'Unread'}</span>
                
                {/* Unread badge */}
                {folderUnreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-[#3390ec] rounded-full flex items-center justify-center px-1.5">
                    <span className="text-white text-[11px] font-medium">{folderUnreadCount > 99 ? '99+' : folderUnreadCount}</span>
                  </div>
                )}
              </button>
            )
          })}
          
          {/* Edit Folders Button */}
          <button
            onClick={() => setShowFolderEdit(true)}
            className="w-16 py-2 rounded-2xl flex flex-col items-center justify-center transition-colors mt-2 text-[#3390ec] hover:bg-[#3390ec]/10"
            title="Edit Folders"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span className="text-[10px] mt-1 font-medium">Edit</span>
          </button>
        </div>
        
        <div className="flex-1" />
        
        {/* Settings */}
        <button onClick={() => setShowSettings(true)} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-colors text-[#3390ec] hover:bg-[#3390ec]/10" title="Settings">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
      
      {/* Folder Edit Modal */}
      {showFolderEdit && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFolderEdit(false)} />
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-xl shadow-xl z-50 ${isDark ? 'bg-[#17212b]' : 'bg-white'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Edit Folders</h3>
                <button onClick={() => setShowFolderEdit(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {folders.map((folder) => (
                <div key={folder.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#232e3c]' : 'bg-[#e4e6eb]'}`}>
                    {folder.icon === 'all' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                    {folder.icon === 'groups' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    {folder.icon === 'channels' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                    {folder.icon === 'private' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    {folder.icon === 'unread' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  </div>
                  <span className={`flex-1 ${isDark ? 'text-white' : 'text-black'}`}>{folder.name}</span>
                  {folder.id !== 'all' && (
                    <button 
                      onClick={() => setFolders(prev => prev.filter(f => f.id !== folder.id))}
                      className="p-1.5 rounded-lg text-[#e53935] hover:bg-[#e53935]/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className={`p-3 border-t ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
              <button 
                onClick={() => setFolders(DEFAULT_FOLDERS)}
                className="w-full py-2 rounded-lg text-[#3390ec] hover:bg-[#3390ec]/10 text-sm font-medium"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </>
      )}

      {showMenu && user && (
        <UserMenu user={user} onClose={() => setShowMenu(false)} onOpenProfile={() => { setShowMenu(false); setShowProfile(true) }} onOpenSettings={() => { setShowMenu(false); setShowSettings(true) }} onChatCreated={loadChats} />
      )}

      <div className={`${showMobileChat ? 'hidden' : 'flex'} sm:flex flex-col w-full sm:w-[260px] md:w-[300px] lg:w-[340px] shrink-0 ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        {showSettings ? <SettingsPage onClose={() => setShowSettings(false)} /> : showProfile ? <ProfilePage onClose={() => setShowProfile(false)} /> : (
          <ChatSidebar onSelectChat={handleSelectChat} selectedChat={selectedChat} onOpenProfile={() => setShowProfile(true)} onOpenSettings={() => setShowSettings(true)} chats={chats} onChatsUpdate={loadChats} onlineUsers={onlineUsers} isLoading={isLoadingChats} unreadCounts={unreadCounts} activeFolder={activeFolder} />
        )}
      </div>

      <div className={`${showMobileChat ? 'flex' : 'hidden'} sm:flex flex-1 flex-col min-w-0`}>
        {selectedChat ? <ChatWindow chat={selectedChat} onBack={handleBack} onlineUsers={onlineUsers} /> : <EmptyChat />}
      </div>

      {/* Mobile Bottom Nav */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 border-t ${isDark ? 'bg-[#17212b] border-[#0e1621]' : 'bg-[#f0f2f5] border-[#dddfe2]'} ${showMobileChat ? 'hidden' : ''}`}>
        <button onClick={() => setShowMenu(true)} className={`flex flex-col items-center gap-1 p-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px]">Menu</span>
        </button>
        <button onClick={() => setShowSettings(true)} className={`flex flex-col items-center gap-1 p-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </div>
  )
}

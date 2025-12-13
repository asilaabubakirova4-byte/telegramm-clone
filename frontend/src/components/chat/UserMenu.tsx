import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { authApi } from '../../services/auth.service'
import { userApi } from '../../services/user.service'
import { chatApi } from '../../services/chat.service'
import { User } from '../../types'

interface UserMenuProps {
  user: User
  onClose: () => void
  onOpenProfile: () => void
  onOpenSettings: () => void
  onChatCreated?: () => void
}

export default function UserMenu({ user, onClose, onOpenProfile, onOpenSettings, onChatCreated }: UserMenuProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeView, setActiveView] = useState<'menu' | 'contacts' | 'newGroup' | 'newChannel'>('menu')
  const [contacts, setContacts] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groupName, setGroupName] = useState('')
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const isDark = theme === 'dark'

  const searchContacts = async (query: string) => {
    if (query.trim().length < 2) {
      setContacts([])
      return
    }
    try {
      setIsSearching(true)
      const users = await userApi.searchUsers(query)
      setContacts(users.filter(u => u.id !== user.id))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    const debounce = setTimeout(() => searchContacts(query), 300)
    return () => clearTimeout(debounce)
  }

  const handleSelectUser = (selectedUser: User) => {
    if (activeView === 'contacts') {
      // Direct chat
      handleCreateDirectChat(selectedUser)
    } else {
      // Group/Channel - toggle selection
      if (selectedUsers.find(u => u.id === selectedUser.id)) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== selectedUser.id))
      } else {
        setSelectedUsers([...selectedUsers, selectedUser])
      }
    }
  }

  const handleCreateDirectChat = async (selectedUser: User) => {
    try {
      setIsCreating(true)
      await chatApi.createDirectChat(selectedUser.id)
      onChatCreated?.()
      onClose()
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return
    try {
      setIsCreating(true)
      await chatApi.createGroup(groupName.trim(), selectedUsers.map(u => u.id))
      onChatCreated?.()
      onClose()
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateChannel = async () => {
    if (!channelName.trim()) return
    try {
      setIsCreating(true)
      await chatApi.createChannel(channelName.trim(), channelDescription.trim(), selectedUsers.map(u => u.id))
      onChatCreated?.()
      onClose()
    } catch (error) {
      console.error('Failed to create channel:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const resetAndGoBack = () => {
    setActiveView('menu')
    setSearchQuery('')
    setContacts([])
    setSelectedUsers([])
    setGroupName('')
    setChannelName('')
    setChannelDescription('')
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  const getDisplayName = () => {
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName
    }
    return user.username || 'User'
  }

  // Contacts View
  const renderContactsView = () => (
    <div className="flex flex-col h-full max-h-[400px]">
      <div className={`p-3 flex items-center gap-2 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
        <button onClick={resetAndGoBack} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
          <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Contacts</span>
      </div>
      <div className="p-2">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
          </div>
        ) : contacts.length > 0 ? (
          contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => handleSelectUser(contact)}
              disabled={isCreating}
              className={`w-full px-3 py-2 flex items-center gap-3 transition-colors ${
                isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]'
              } ${isCreating ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 bg-[#3390ec] rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                {contact.avatarUrl ? (
                  <img src={`http://localhost:3001${contact.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(contact.firstName + (contact.lastName || ''))
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  {contact.firstName} {contact.lastName || ''}
                </p>
                <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
                  {contact.username ? `@${contact.username}` : contact.phone}
                </p>
              </div>
            </button>
          ))
        ) : searchQuery.length >= 2 ? (
          <p className={`text-center py-4 text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>No users found</p>
        ) : (
          <p className={`text-center py-4 text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Search for users</p>
        )}
      </div>
    </div>
  )

  // New Group View
  const renderNewGroupView = () => (
    <div className="flex flex-col h-full max-h-[450px]">
      <div className={`p-3 flex items-center gap-2 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
        <button onClick={resetAndGoBack} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
          <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>New Group</span>
      </div>
      <div className="p-3 space-y-3">
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3390ec] ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
      </div>
      {selectedUsers.length > 0 && (
        <div className={`px-3 pb-2 flex flex-wrap gap-1 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
          {selectedUsers.map(u => (
            <span key={u.id} className="px-2 py-1 bg-[#3390ec] text-white text-xs rounded-full flex items-center gap-1">
              {u.firstName}
              <button onClick={() => setSelectedUsers(selectedUsers.filter(s => s.id !== u.id))} className="hover:text-white/70">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
          </div>
        ) : contacts.length > 0 ? (
          contacts.map(contact => {
            const isSelected = selectedUsers.find(u => u.id === contact.id)
            return (
              <button
                key={contact.id}
                onClick={() => handleSelectUser(contact)}
                className={`w-full px-3 py-2 flex items-center gap-3 transition-colors ${
                  isSelected ? (isDark ? 'bg-[#232e3c]' : 'bg-[#e4e6eb]') : (isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]')
                }`}
              >
                <div className="w-10 h-10 bg-[#3390ec] rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {contact.avatarUrl ? (
                    <img src={`http://localhost:3001${contact.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(contact.firstName + (contact.lastName || ''))
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{contact.firstName} {contact.lastName || ''}</p>
                </div>
                {isSelected && <svg className="w-5 h-5 text-[#3390ec]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
              </button>
            )
          })
        ) : searchQuery.length >= 2 ? (
          <p className={`text-center py-4 text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>No users found</p>
        ) : null}
      </div>
      <div className="p-3">
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
          className="w-full py-2.5 bg-[#3390ec] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#4ea4f6] transition-colors"
        >
          {isCreating ? 'Creating...' : `Create Group${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`}
        </button>
      </div>
    </div>
  )

  // New Channel View
  const renderNewChannelView = () => (
    <div className="flex flex-col h-full max-h-[450px]">
      <div className={`p-3 flex items-center gap-2 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
        <button onClick={resetAndGoBack} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
          <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>New Channel</span>
      </div>
      <div className="p-3 space-y-3">
        <input
          type="text"
          placeholder="Channel name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3390ec] ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
        <textarea
          placeholder="Description (optional)"
          value={channelDescription}
          onChange={(e) => setChannelDescription(e.target.value)}
          rows={2}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
        <input
          type="text"
          placeholder="Add subscribers (optional)..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${
            isDark ? 'bg-[#242f3d] text-white placeholder-[#6c7883]' : 'bg-[#f0f2f5] text-black placeholder-[#65676b]'
          }`}
        />
      </div>
      {selectedUsers.length > 0 && (
        <div className={`px-3 pb-2 flex flex-wrap gap-1 border-b ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
          {selectedUsers.map(u => (
            <span key={u.id} className="px-2 py-1 bg-[#3390ec] text-white text-xs rounded-full flex items-center gap-1">
              {u.firstName}
              <button onClick={() => setSelectedUsers(selectedUsers.filter(s => s.id !== u.id))} className="hover:text-white/70">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {contacts.length > 0 && contacts.map(contact => {
          const isSelected = selectedUsers.find(u => u.id === contact.id)
          return (
            <button
              key={contact.id}
              onClick={() => handleSelectUser(contact)}
              className={`w-full px-3 py-2 flex items-center gap-3 transition-colors ${
                isSelected ? (isDark ? 'bg-[#232e3c]' : 'bg-[#e4e6eb]') : (isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#f0f2f5]')
              }`}
            >
              <div className="w-10 h-10 bg-[#3390ec] rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                {contact.avatarUrl ? (
                  <img src={`http://localhost:3001${contact.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(contact.firstName + (contact.lastName || ''))
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{contact.firstName} {contact.lastName || ''}</p>
              </div>
              {isSelected && <svg className="w-5 h-5 text-[#3390ec]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            </button>
          )
        })}
      </div>
      <div className="p-3">
        <button
          onClick={handleCreateChannel}
          disabled={!channelName.trim() || isCreating}
          className="w-full py-2.5 bg-[#3390ec] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#4ea4f6] transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Channel'}
        </button>
      </div>
    </div>
  )

  // Render based on active view
  if (activeView === 'contacts') {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className={`absolute left-2 top-14 z-50 w-[280px] rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'
        }`}>
          {renderContactsView()}
        </div>
      </>
    )
  }

  if (activeView === 'newGroup') {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className={`absolute left-2 top-14 z-50 w-[300px] rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'
        }`}>
          {renderNewGroupView()}
        </div>
      </>
    )
  }

  if (activeView === 'newChannel') {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className={`absolute left-2 top-14 z-50 w-[300px] rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'
        }`}>
          {renderNewChannelView()}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Menu */}
      <div className={`absolute left-2 top-14 z-50 w-[280px] rounded-xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-[#17212b] border border-[#232e3c]' : 'bg-white border border-[#dddfe2]'
      }`}>
        {/* User Info */}
        <div className={`p-4 ${isDark ? 'bg-[#232e3c]' : 'bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3390ec] rounded-full flex items-center justify-center text-white font-medium text-lg overflow-hidden">
              {user.avatarUrl ? (
                <img src={`http://localhost:3001${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(getDisplayName())
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{getDisplayName()}</p>
              <p className={`text-sm truncate ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={() => { onClose(); onOpenProfile(); }}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Profile</span>
          </button>

          {/* Contacts */}
          <button
            onClick={() => setActiveView('contacts')}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Contacts</span>
          </button>

          {/* New Group */}
          <button
            onClick={() => setActiveView('newGroup')}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>New Group</span>
          </button>

          {/* New Channel */}
          <button
            onClick={() => setActiveView('newChannel')}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>New Channel</span>
          </button>

          <div className={`border-t my-2 ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`} />

          <button 
            onClick={toggleTheme}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className="flex-1 text-left">Dark Mode</span>
            <div className={`w-10 h-6 rounded-full transition-colors ${isDark ? 'bg-[#3390ec]' : 'bg-[#bcc0c4]'} relative`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${isDark ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          <button
            onClick={() => { onClose(); onOpenSettings(); }}
            className={`w-full px-4 py-2.5 flex items-center gap-4 transition-colors ${
              isDark ? 'text-white hover:bg-[#232e3c]' : 'text-black hover:bg-[#f0f2f5]'
            }`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`} />

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2.5 flex items-center gap-4 text-[#e53935] transition-colors ${
              isDark ? 'hover:bg-[#e53935]/10' : 'hover:bg-[#e53935]/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

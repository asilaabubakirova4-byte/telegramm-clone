import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { userApi } from '../../services/user.service'
import { User } from '../../types'

interface ProfilePageProps {
  onClose: () => void
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { user, setAuth } = useAuthStore()
  const { theme } = useThemeStore()
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [localUser, setLocalUser] = useState<User | null>(user)
  
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (user) {
      setLocalUser(user)
      setFirstName(user.firstName)
      setLastName(user.lastName || '')
      setUsername(user.username || '')
      setBio(user.bio || '')
    }
  }, [user])

  const getInitials = () => {
    if (!localUser) return 'U'
    const name = localUser.firstName + (localUser.lastName || '')
    return name.slice(0, 2).toUpperCase()
  }

  const getDisplayName = () => {
    if (!localUser) return 'User'
    return localUser.lastName 
      ? `${localUser.firstName} ${localUser.lastName}` 
      : localUser.firstName
  }

  const updateUser = (updatedUser: User) => {
    setLocalUser(updatedUser)
    const storage = localStorage.getItem('auth-storage')
    if (storage) {
      const parsed = JSON.parse(storage)
      setAuth(updatedUser, parsed.state.token)
    }
  }

  const handleSaveName = async () => {
    if (!firstName.trim()) return
    try {
      setIsLoading(true)
      const updatedUser = await userApi.updateProfile({ firstName, lastName })
      updateUser(updatedUser)
      setEditingField(null)
    } catch (error) {
      console.error('Update name error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveUsername = async () => {
    try {
      setIsLoading(true)
      const updatedUser = await userApi.updateProfile({ username: username || undefined })
      updateUser(updatedUser)
      setEditingField(null)
    } catch (error) {
      console.error('Update username error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBio = async () => {
    try {
      setIsLoading(true)
      const updatedUser = await userApi.updateProfile({ bio: bio || undefined })
      updateUser(updatedUser)
      setEditingField(null)
    } catch (error) {
      console.error('Update bio error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsLoading(true)
      const updatedUser = await userApi.uploadPhoto(file)
      updateUser(updatedUser)
    } catch (error) {
      console.error('Upload photo error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!localUser) return null

  return (
    <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 p-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar Section */}
        <div className={`py-6 flex flex-col items-center ${isDark ? 'bg-[#0e1621]' : 'bg-white'}`}>
          <div 
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 bg-[#3390ec] rounded-full flex items-center justify-center text-white text-2xl font-medium overflow-hidden">
              {localUser.avatarUrl ? (
                <img 
                  src={`http://localhost:3001${localUser.avatarUrl}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3390ec] rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#2b7fd4] transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-sm mt-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Tap to change photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Profile Fields */}
        <div className={isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}>
          {/* Name */}
          {editingField === 'name' ? (
            <div className={`p-4 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full bg-transparent text-sm border-b py-2 focus:outline-none ${isDark ? 'text-white border-[#3390ec]' : 'text-black border-[#3390ec]'}`}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Optional"
                    className={`w-full bg-transparent text-sm border-b py-2 focus:outline-none ${isDark ? 'text-white border-[#3d4d5c] focus:border-[#3390ec] placeholder-[#6c7883]' : 'text-black border-[#dddfe2] focus:border-[#3390ec] placeholder-[#65676b]'}`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => { setFirstName(localUser.firstName); setLastName(localUser.lastName || ''); setEditingField(null); }} className={`px-3 py-1.5 text-sm ${isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}>Cancel</button>
                  <button onClick={handleSaveName} disabled={isLoading || !firstName.trim()} className="px-3 py-1.5 bg-[#3390ec] hover:bg-[#2b7fd4] disabled:bg-[#3390ec]/50 text-white rounded-lg text-sm">{isLoading ? '...' : 'Save'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${isDark ? 'border-[#0e1621] hover:bg-[#232e3c]' : 'border-[#dddfe2] hover:bg-[#e4e6eb]'}`} onClick={() => setEditingField('name')}>
              <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Name</p>
                <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>{getDisplayName()}</p>
              </div>
              <svg className="w-4 h-4 text-[#3390ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          )}

          {/* Username */}
          {editingField === 'username' ? (
            <div className={`p-4 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Username</label>
                  <div className="flex items-center">
                    <span className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>@</span>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" className={`flex-1 bg-transparent text-sm border-b py-2 focus:outline-none ml-1 ${isDark ? 'text-white border-[#3390ec] placeholder-[#6c7883]' : 'text-black border-[#3390ec] placeholder-[#65676b]'}`} autoFocus />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => { setUsername(localUser.username || ''); setEditingField(null); }} className={`px-3 py-1.5 text-sm ${isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}>Cancel</button>
                  <button onClick={handleSaveUsername} disabled={isLoading} className="px-3 py-1.5 bg-[#3390ec] hover:bg-[#2b7fd4] disabled:bg-[#3390ec]/50 text-white rounded-lg text-sm">{isLoading ? '...' : 'Save'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${isDark ? 'border-[#0e1621] hover:bg-[#232e3c]' : 'border-[#dddfe2] hover:bg-[#e4e6eb]'}`} onClick={() => setEditingField('username')}>
              <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Username</p>
                <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>{localUser.username ? `@${localUser.username}` : 'Not set'}</p>
              </div>
              <svg className="w-4 h-4 text-[#3390ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          )}

          {/* Bio */}
          {editingField === 'bio' ? (
            <div className={`p-4 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Add a few words about yourself" rows={2} maxLength={70} className={`w-full bg-transparent text-sm border-b py-2 focus:outline-none resize-none ${isDark ? 'text-white border-[#3390ec] placeholder-[#6c7883]' : 'text-black border-[#3390ec] placeholder-[#65676b]'}`} autoFocus />
                  <p className={`text-xs text-right ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>{bio.length}/70</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setBio(localUser.bio || ''); setEditingField(null); }} className={`px-3 py-1.5 text-sm ${isDark ? 'text-[#6c7883] hover:text-white' : 'text-[#65676b] hover:text-black'}`}>Cancel</button>
                  <button onClick={handleSaveBio} disabled={isLoading} className="px-3 py-1.5 bg-[#3390ec] hover:bg-[#2b7fd4] disabled:bg-[#3390ec]/50 text-white rounded-lg text-sm">{isLoading ? '...' : 'Save'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${isDark ? 'border-[#0e1621] hover:bg-[#232e3c]' : 'border-[#dddfe2] hover:bg-[#e4e6eb]'}`} onClick={() => setEditingField('bio')}>
              <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Bio</p>
                <p className={`text-sm truncate ${localUser.bio ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-[#6c7883]' : 'text-[#65676b]')}`}>{localUser.bio || 'Add a few words about yourself'}</p>
              </div>
              <svg className="w-4 h-4 text-[#3390ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center gap-3 p-4">
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Phone</p>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{localUser.phone}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className={`text-xs ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
            Your profile information is visible to your contacts and people you message.
          </p>
        </div>
      </div>
    </div>
  )
}

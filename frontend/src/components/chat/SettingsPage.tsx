import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { useChatStore, CHAT_BACKGROUNDS, MESSAGE_COLORS } from '../../store/chat.store'

interface SettingsPageProps {
  onClose: () => void
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'uz', name: 'Uzbek', native: "O'zbek" },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
]

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { user } = useAuthStore()
  const { theme, toggleTheme, language, setLanguage } = useThemeStore()
  const { chatBackground, setChatBackground, setCustomBackground, messageColor, setMessageColor } = useChatStore()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)
  
  const isDark = theme === 'dark'

  // Settings state
  const [notifications, setNotifications] = useState({
    messages: true,
    sounds: true,
    preview: true,
    vibrate: true
  })
  
  const [privacy, setPrivacy] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    phone: 'contacts'
  })
  
  const [chatSettings, setChatSettings] = useState({
    fontSize: 'medium',
    sendByEnter: true,
    autoDownload: true
  })

  const [dataStorage, setDataStorage] = useState({
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadFiles: false,
    saveToGallery: true,
    keepMedia: '1month'
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('settings_notifications')
    const savedPrivacy = localStorage.getItem('settings_privacy')
    const savedChat = localStorage.getItem('settings_chat')
    const savedDataStorage = localStorage.getItem('settings_data_storage')
    
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy))
    if (savedChat) setChatSettings(JSON.parse(savedChat))
    if (savedDataStorage) setDataStorage(JSON.parse(savedDataStorage))
  }, [])

  // Save settings
  const saveNotifications = (newSettings: typeof notifications) => {
    setNotifications(newSettings)
    localStorage.setItem('settings_notifications', JSON.stringify(newSettings))
  }

  const savePrivacy = (newSettings: typeof privacy) => {
    setPrivacy(newSettings)
    localStorage.setItem('settings_privacy', JSON.stringify(newSettings))
  }

  const saveChatSettings = (newSettings: typeof chatSettings) => {
    setChatSettings(newSettings)
    localStorage.setItem('settings_chat', JSON.stringify(newSettings))
  }

  const saveDataStorage = (newSettings: typeof dataStorage) => {
    setDataStorage(newSettings)
    localStorage.setItem('settings_data_storage', JSON.stringify(newSettings))
  }

  const renderToggle = (value: boolean, onChange: () => void) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#3390ec]' : isDark ? 'bg-[#6c7883]' : 'bg-[#bcc0c4]'} relative`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${value ? 'left-6' : 'left-1'}`} />
    </button>
  )

  const renderSelect = (value: string, options: { value: string; label: string }[], onChange: (v: string) => void) => (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3390ec] ${
        isDark ? 'bg-[#242f3d] text-white' : 'bg-white text-black border border-[#dddfe2]'
      }`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className={`p-2 rounded-lg ${isDark ? 'text-[#6c7883] hover:text-white hover:bg-[#232e3c]' : 'text-[#65676b] hover:text-black hover:bg-[#e4e6eb]'}`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )

  // Notifications Section
  if (activeSection === 'notifications') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Notifications</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Message notifications</span>
            {renderToggle(notifications.messages, () => saveNotifications({ ...notifications, messages: !notifications.messages }))}
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Sound</span>
            {renderToggle(notifications.sounds, () => saveNotifications({ ...notifications, sounds: !notifications.sounds }))}
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Message preview</span>
            {renderToggle(notifications.preview, () => saveNotifications({ ...notifications, preview: !notifications.preview }))}
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Vibration</span>
            {renderToggle(notifications.vibrate, () => saveNotifications({ ...notifications, vibrate: !notifications.vibrate }))}
          </div>
        </div>
      </div>
    )
  }

  // Privacy Section
  if (activeSection === 'privacy') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Privacy and Security</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className={`text-sm mb-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Who can see my last seen</p>
            {renderSelect(privacy.lastSeen, [
              { value: 'everyone', label: 'Everyone' },
              { value: 'contacts', label: 'My Contacts' },
              { value: 'nobody', label: 'Nobody' }
            ], (v) => savePrivacy({ ...privacy, lastSeen: v }))}
          </div>
          <div>
            <p className={`text-sm mb-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Who can see my profile photo</p>
            {renderSelect(privacy.profilePhoto, [
              { value: 'everyone', label: 'Everyone' },
              { value: 'contacts', label: 'My Contacts' },
              { value: 'nobody', label: 'Nobody' }
            ], (v) => savePrivacy({ ...privacy, profilePhoto: v }))}
          </div>
          <div>
            <p className={`text-sm mb-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Who can see my phone number</p>
            {renderSelect(privacy.phone, [
              { value: 'everyone', label: 'Everyone' },
              { value: 'contacts', label: 'My Contacts' },
              { value: 'nobody', label: 'Nobody' }
            ], (v) => savePrivacy({ ...privacy, phone: v }))}
          </div>
        </div>
      </div>
    )
  }

  // Chat Settings Section
  if (activeSection === 'chat') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Chat Settings</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className={`text-sm mb-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Message text size</p>
            {renderSelect(chatSettings.fontSize, [
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ], (v) => saveChatSettings({ ...chatSettings, fontSize: v }))}
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Send by Enter</span>
            {renderToggle(chatSettings.sendByEnter, () => saveChatSettings({ ...chatSettings, sendByEnter: !chatSettings.sendByEnter }))}
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-white' : 'text-black'}>Auto-download media</span>
            {renderToggle(chatSettings.autoDownload, () => saveChatSettings({ ...chatSettings, autoDownload: !chatSettings.autoDownload }))}
          </div>
        </div>
      </div>
    )
  }

  // Data and Storage Section
  if (activeSection === 'data') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Data and Storage</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className={`text-xs uppercase mb-3 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Automatic media download</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-white' : 'text-black'}>Photos</span>
                {renderToggle(dataStorage.autoDownloadPhotos, () => saveDataStorage({ ...dataStorage, autoDownloadPhotos: !dataStorage.autoDownloadPhotos }))}
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-white' : 'text-black'}>Videos</span>
                {renderToggle(dataStorage.autoDownloadVideos, () => saveDataStorage({ ...dataStorage, autoDownloadVideos: !dataStorage.autoDownloadVideos }))}
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-white' : 'text-black'}>Files</span>
                {renderToggle(dataStorage.autoDownloadFiles, () => saveDataStorage({ ...dataStorage, autoDownloadFiles: !dataStorage.autoDownloadFiles }))}
              </div>
            </div>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
            <p className={`text-xs uppercase mb-3 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Storage</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-white' : 'text-black'}>Save to gallery</span>
                {renderToggle(dataStorage.saveToGallery, () => saveDataStorage({ ...dataStorage, saveToGallery: !dataStorage.saveToGallery }))}
              </div>
              <div>
                <p className={`text-sm mb-2 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Keep media</p>
                {renderSelect(dataStorage.keepMedia, [
                  { value: '1week', label: '1 Week' },
                  { value: '1month', label: '1 Month' },
                  { value: '3months', label: '3 Months' },
                  { value: 'forever', label: 'Forever' }
                ], (v) => saveDataStorage({ ...dataStorage, keepMedia: v }))}
              </div>
            </div>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-[#232e3c]' : 'border-[#dddfe2]'}`}>
            <button className={`w-full py-3 rounded-lg text-[#e53935] ${isDark ? 'hover:bg-[#e53935]/10' : 'hover:bg-[#e53935]/10'}`}>
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Chat Background Section
  if (activeSection === 'background') {
    const handleBgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setCustomBackground(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Chat Background</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <p className={`text-xs uppercase mb-3 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Choose a background</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {CHAT_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setChatBackground(bg.id)}
                className={`aspect-square rounded-xl transition-all ${chatBackground === bg.id ? 'ring-2 ring-[#3390ec] ring-offset-2' : ''}`}
                style={bg.type === 'gradient' ? { background: bg.color } : { backgroundColor: bg.color }}
              >
                {chatBackground === bg.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Gallery Selection */}
          <input 
            ref={bgInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleBgImageSelect} 
            className="hidden" 
          />
          <button
            onClick={() => bgInputRef.current?.click()}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'bg-[#232e3c] text-white hover:bg-[#2d3a4d]' : 'bg-white text-black hover:bg-[#e4e6eb] border border-[#dddfe2]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Choose from Gallery</span>
          </button>
        </div>
      </div>
    )
  }

  // Message Colors Section
  if (activeSection === 'messageColors') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Message Colors</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <p className={`text-xs uppercase mb-3 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Choose message bubble color</p>
          <div className="space-y-3">
            {MESSAGE_COLORS.map((color) => {
              const isGradient = color.own.startsWith('linear-gradient')
              return (
                <button
                  key={color.id}
                  onClick={() => setMessageColor(color.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    messageColor === color.id 
                      ? 'ring-2 ring-[#3390ec]' 
                      : ''
                  } ${isDark ? 'bg-[#232e3c] hover:bg-[#2d3a4d]' : 'bg-white hover:bg-[#e4e6eb] border border-[#dddfe2]'}`}
                >
                  <div 
                    className="w-12 h-8 rounded-lg"
                    style={isGradient ? { background: color.own } : { backgroundColor: color.own }}
                  />
                  <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>{color.name}</span>
                  {messageColor === color.id && (
                    <svg className="w-5 h-5 text-[#3390ec]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Preview */}
          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-[#0e1621]' : 'bg-[#e5ddd5]'}`}>
            <p className={`text-xs uppercase mb-3 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Preview</p>
            <div className="space-y-2">
              <div className="flex justify-start">
                <div 
                  className={`px-3 py-2 rounded-2xl rounded-bl-sm max-w-[200px] ${isDark ? 'text-white' : 'text-black'}`}
                  style={{ backgroundColor: MESSAGE_COLORS.find(c => c.id === messageColor)?.other || '#182533' }}
                >
                  <p className="text-sm">Hello! 👋</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div 
                  className="px-3 py-2 rounded-2xl rounded-br-sm max-w-[200px] text-white"
                  style={
                    MESSAGE_COLORS.find(c => c.id === messageColor)?.own.startsWith('linear-gradient')
                      ? { background: MESSAGE_COLORS.find(c => c.id === messageColor)?.own }
                      : { backgroundColor: MESSAGE_COLORS.find(c => c.id === messageColor)?.own }
                  }
                >
                  <p className="text-sm">Hi there! How are you? 😊</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Language Section
  if (activeSection === 'language') {
    return (
      <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
        <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <BackButton onClick={() => setActiveSection(null)} />
          <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Language</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'
              }`}
            >
              <div>
                <p className={isDark ? 'text-white' : 'text-black'}>{lang.name}</p>
                <p className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>{lang.native}</p>
              </div>
              {language === lang.code && (
                <svg className="w-5 h-5 text-[#3390ec]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Main Settings Menu
  return (
    <div className={`w-full h-full flex flex-col ${isDark ? 'bg-[#17212b]' : 'bg-[#f0f2f5]'}`}>
      <div className={`p-4 flex items-center gap-3 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
        <BackButton onClick={onClose} />
        <h2 className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* User Info */}
        {user && (
          <div className={`p-4 border-b ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-[#3390ec] rounded-full flex items-center justify-center text-white text-xl font-medium overflow-hidden">
                {user.avatarUrl ? (
                  <img src={`http://localhost:3001${user.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.firstName?.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{user.firstName} {user.lastName}</p>
                <p className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>{user.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        <div className="p-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}
          >
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Dark Mode</span>
            {renderToggle(isDark, toggleTheme)}
          </button>

          <button onClick={() => setActiveSection('notifications')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Notifications and Sounds</span>
            <svg className={`w-4 h-4 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => setActiveSection('privacy')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Privacy and Security</span>
            <svg className={`w-4 h-4 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => setActiveSection('chat')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Chat Settings</span>
            <svg className={`w-4 h-4 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Chat Background */}
          <button onClick={() => setActiveSection('background')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Chat Background</span>
            <div 
              className="w-6 h-6 rounded-md border border-[#3390ec]"
              style={{ backgroundColor: CHAT_BACKGROUNDS.find(b => b.id === chatBackground)?.color || '#0e1621' }}
            />
          </button>

          {/* Message Colors */}
          <button onClick={() => setActiveSection('messageColors')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Message Colors</span>
            <div 
              className="w-6 h-6 rounded-md"
              style={
                MESSAGE_COLORS.find(c => c.id === messageColor)?.own.startsWith('linear-gradient')
                  ? { background: MESSAGE_COLORS.find(c => c.id === messageColor)?.own }
                  : { backgroundColor: MESSAGE_COLORS.find(c => c.id === messageColor)?.own || '#3390ec' }
              }
            />
          </button>

          <button onClick={() => setActiveSection('data')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Data and Storage</span>
            <svg className={`w-4 h-4 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => setActiveSection('language')} className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#232e3c]' : 'hover:bg-[#e4e6eb]'}`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className={`flex-1 text-left ${isDark ? 'text-white' : 'text-black'}`}>Language</span>
            <span className={`text-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
              {LANGUAGES.find(l => l.code === language)?.name || 'English'}
            </span>
          </button>
        </div>

        {/* App Info */}
        <div className={`p-4 mt-4 border-t ${isDark ? 'border-[#0e1621]' : 'border-[#dddfe2]'}`}>
          <p className={`text-sm text-center ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Telegram Clone v1.0.0</p>
          <p className={`text-xs text-center mt-1 ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>Made with ❤️</p>
        </div>
      </div>
    </div>
  )
}

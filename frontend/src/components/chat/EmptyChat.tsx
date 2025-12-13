import { useThemeStore } from '../../store/theme.store'

export default function EmptyChat() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0e1621]' : 'bg-[#e5ddd5]'}`}>
      <div className="text-center">
        {/* Telegram Logo */}
        <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-[#17212b]' : 'bg-white'}`}>
          <svg className={`w-16 h-16 ${isDark ? 'text-[#3d4d5c]' : 'text-[#bcc0c4]'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
        </div>

        {/* Welcome Text */}
        <h2 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
          Welcome to Telegram Clone
        </h2>
        <p className={`max-w-sm ${isDark ? 'text-[#6c7883]' : 'text-[#65676b]'}`}>
          Select a chat to start messaging or search for contacts to begin a new conversation
        </p>
      </div>
    </div>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const CHAT_BACKGROUNDS = [
  { id: 'default-dark', color: '#0e1621', type: 'color' },
  { id: 'default-light', color: '#e5ddd5', type: 'color' },
  { id: 'blue', color: '#1a2942', type: 'color' },
  { id: 'purple', color: '#2d1b4e', type: 'color' },
  { id: 'green', color: '#1b3d2f', type: 'color' },
  { id: 'red', color: '#3d1b1b', type: 'color' },
  { id: 'gradient-1', color: 'linear-gradient(135deg, #1a2942 0%, #2d1b4e 100%)', type: 'gradient' },
  { id: 'gradient-2', color: 'linear-gradient(135deg, #0e1621 0%, #1b3d2f 100%)', type: 'gradient' },
  { id: 'gradient-3', color: 'linear-gradient(135deg, #2d1b4e 0%, #3d1b1b 100%)', type: 'gradient' },
]

const MESSAGE_COLORS = [
  { id: 'default', name: 'Default Blue', own: '#3390ec', other: '#182533' },
  { id: 'gradient-blue', name: 'Blue Gradient', own: 'linear-gradient(135deg, #3390ec 0%, #6c5ce7 100%)', other: '#182533' },
  { id: 'gradient-purple', name: 'Purple Gradient', own: 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)', other: '#2d1b4e' },
  { id: 'gradient-green', name: 'Green Gradient', own: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', other: '#1b3d2f' },
  { id: 'gradient-orange', name: 'Orange Gradient', own: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', other: '#3d1b1b' },
  { id: 'gradient-pink', name: 'Pink Gradient', own: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', other: '#2d1b4e' },
  { id: 'gradient-cyan', name: 'Cyan Gradient', own: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', other: '#1a2942' },
  { id: 'gradient-rainbow', name: 'Rainbow', own: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)', other: '#182533' },
]

interface ChatState {
  chatBackground: string
  customBackground: string | null
  messageColor: string
  backgrounds: typeof CHAT_BACKGROUNDS
  messageColors: typeof MESSAGE_COLORS
  setChatBackground: (bg: string) => void
  setCustomBackground: (url: string | null) => void
  setMessageColor: (color: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chatBackground: 'default-dark',
      customBackground: null,
      messageColor: 'default',
      backgrounds: CHAT_BACKGROUNDS,
      messageColors: MESSAGE_COLORS,
      setChatBackground: (chatBackground) => set({ chatBackground, customBackground: null }),
      setCustomBackground: (customBackground) => set({ customBackground }),
      setMessageColor: (messageColor) => set({ messageColor }),
    }),
    {
      name: 'chat-storage',
    }
  )
)

export { CHAT_BACKGROUNDS, MESSAGE_COLORS }

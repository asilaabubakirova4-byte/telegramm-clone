import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import { authApi } from './services/auth.service'
import { socketService } from './services/socket.service'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }
  
  return <>{children}</>
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const { token, setAuth, logout } = useAuthStore()

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsInitializing(false)
        return
      }

      try {
        const user = await authApi.getCurrentUser()
        setAuth(user, token)
        // Connect to socket after auth
        socketService.connect(token)
      } catch (error) {
        console.log('Token invalid, logging out')
        logout()
        socketService.disconnect()
      } finally {
        setIsInitializing(false)
      }
    }

    verifyAuth()

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  // Initializing paytida loader ko'rsatish
  if (isInitializing) {
    return (
      <div className="h-screen bg-[#0e1621] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3390ec]/30 border-t-[#3390ec] rounded-full animate-spin" />
          <p className="text-[#6c7883]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

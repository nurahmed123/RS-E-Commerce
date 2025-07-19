import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
  avatar: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (code: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    
    setLoading(false)
  }, [])

  const login = async (code: string) => {
    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/github`, { code })
      
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      toast.success('Successfully logged in!')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    toast.success('Successfully logged out!')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
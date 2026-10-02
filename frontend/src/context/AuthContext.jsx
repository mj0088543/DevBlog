import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const persistSession = (data) => {
    localStorage.setItem('token', data.token)
    const userData = { id: data.id, username: data.username, email: data.email, role: data.role }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    persistSession(data)
    return data
  }

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password })
    persistSession(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

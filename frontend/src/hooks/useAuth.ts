import { useState, useEffect } from 'react'
import api from '../lib/api'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'reviewer'
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('kovil_admin_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('kovil_admin_token', data.token)
      localStorage.setItem('kovil_admin_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('kovil_admin_token')
    localStorage.removeItem('kovil_admin_user')
    setUser(null)
  }

  return { user, loading, login, logout }
}

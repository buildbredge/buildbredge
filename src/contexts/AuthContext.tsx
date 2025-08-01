"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, type AuthUser, type RegisterData } from '@/lib/services/authService'
import { apiClient, type UserProfileData } from '@/lib/services/apiClient'

// Use the types from services
type User = UserProfileData

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  sendEmailVerification: (email: string) => Promise<{ success: boolean; message: string }>
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const sessionData = await authService.getCurrentSession()
      if (sessionData) {
        setAuthUser(sessionData.user)
        await loadUserProfile()
      }
      setIsLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
      setAuthUser(authUser)
      if (authUser) {
        await loadUserProfile()
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await apiClient.getUserProfile()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        console.error('Failed to load user profile:', response.error)
        setUser(null)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const result = await authService.login(email, password)
    if (result.success && result.user) {
      setAuthUser(result.user)
      await loadUserProfile()
    }
    return result
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    const result = await authService.register(userData)
    if (result.success && result.user) {
      setAuthUser(result.user)
    }
    return result
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setAuthUser(null)
  }

  const sendEmailVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
    return await authService.resendVerificationEmail(email)
  }


  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: '请先登录' }
    }

    const result = await apiClient.updateUserProfile({
      name: userData.name || user.name,
      phone: userData.phone || user.phone,
      location: userData.location || user.location,
      company: userData.company,
      specialty: userData.specialty,
      serviceRadius: userData.serviceRadius
    })

    if (result.success) {
      // 重新加载用户资料
      await loadUserProfile()
      return { success: true, message: result.data?.message || '更新成功' }
    } else {
      return { success: false, message: result.error || '更新失败' }
    }
  }

  const value = {
    user,
    authUser,
    isLoading,
    login,
    register,
    logout,
    sendEmailVerification,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

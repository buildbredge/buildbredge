"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie'
  location: string
  company?: string
  avatar?: string
  verified: boolean
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  sendEmailVerification: (email: string) => Promise<{ success: boolean; message: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  userType: 'homeowner' | 'tradie'
  location: string
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
      setIsLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      
      // 先尝试从 owners 表查找
      const { data: ownerProfile } = await supabase
        .from('owners')
        .select('*')
        .eq('id', userId)
        .single()

      if (ownerProfile) {
        const userData: User = {
          id: ownerProfile.id,
          name: ownerProfile.name || '',
          email: authUser.user?.email || '',
          phone: ownerProfile.phone || '',
          userType: 'homeowner',
          location: ownerProfile.address || '',
          verified: ownerProfile.status === 'approved',
          emailVerified: authUser.user?.email_confirmed_at ? true : false
        }
        setUser(userData)
        return
      }

      // 如果不是业主，尝试从 tradies 表查找
      const { data: tradieProfile } = await supabase
        .from('tradies')
        .select('*')
        .eq('id', userId)
        .single()

      if (tradieProfile) {
        const userData: User = {
          id: tradieProfile.id,
          name: tradieProfile.name || '',
          email: authUser.user?.email || '',
          phone: tradieProfile.phone || '',
          userType: 'tradie',
          location: tradieProfile.address || '',
          company: tradieProfile.company || undefined,
          verified: tradieProfile.status === 'approved',
          emailVerified: authUser.user?.email_confirmed_at ? true : false
        }
        setUser(userData)
        return
      }

      // 如果都没找到，说明用户数据不完整
      console.warn('User profile not found in owners or tradies tables')
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let message = '登录失败，请重试'
        
        if (error.message.includes('Invalid login credentials')) {
          message = '邮箱或密码错误，请重试'
        } else if (error.message.includes('Email not confirmed')) {
          message = '请先验证您的邮箱地址'
        }
        
        return { success: false, message }
      }

      if (data.user) {
        await loadUserProfile(data.user.id)
        return { success: true, message: '登录成功！' }
      }

      return { success: false, message: '登录失败，请重试' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登录失败，请重试' }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      // 注册Supabase用户
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (error) {
        let message = '注册失败，请重试'
        
        if (error.message.includes('User already registered')) {
          message = '该邮箱已被注册，请使用其他邮箱或直接登录'
        } else if (error.message.includes('Password should be at least')) {
          message = '密码至少需要6个字符'
        }
        
        return { success: false, message }
      }

      if (data.user) {
        // 根据用户类型创建对应的资料
        if (userData.userType === 'homeowner') {
          const { error: profileError } = await supabase
            .from('owners')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              email: userData.email,
              address: userData.location,
              status: 'pending',
              balance: 0.00,
              latitude: null,
              longitude: null
            })

          if (profileError) {
            console.error('Error creating owner profile:', profileError)
            return { success: false, message: '业主资料创建失败，请联系客服' }
          }
        } else if (userData.userType === 'tradie') {
          const { error: profileError } = await supabase
            .from('tradies')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              email: userData.email,
              company: userData.company || '个人服务',
              specialty: '通用服务',
              status: 'pending',
              balance: 0.00,
              latitude: null,
              longitude: null,
              address: userData.location,
              service_radius: 25,
              rating: 0,
              review_count: 0
            })

          if (profileError) {
            console.error('Error creating tradie profile:', profileError)
            return { success: false, message: '技师资料创建失败，请联系客服' }
          }
        }

        return {
          success: true,
          message: '注册成功！请检查您的邮箱并点击验证链接激活账户。'
        }
      }

      return { success: false, message: '注册失败，请重试' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: '注册失败，请重试' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const sendEmailVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        return { success: false, message: '验证邮件发送失败，请重试' }
      }

      return {
        success: true,
        message: '验证邮件已发送，请检查您的邮箱（包括垃圾邮件文件夹）'
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, message: '验证邮件发送失败，请重试' }
    }
  }

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (error) {
        return { success: false, message: '验证链接无效或已过期' }
      }

      return { success: true, message: '邮箱验证成功！您现在可以正常使用所有功能。' }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, message: '验证失败，请重试' }
    }
  }

  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: '请先登录' }
    }

    try {
      if (user.userType === 'homeowner') {
        // 更新业主资料
        const { error: profileError } = await supabase
          .from('owners')
          .update({
            name: userData.name,
            phone: userData.phone,
            address: userData.location,
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating owner profile:', profileError)
          return { success: false, message: '更新失败，请重试' }
        }
      } else if (user.userType === 'tradie') {
        // 更新技师资料
        const { error: profileError } = await supabase
          .from('tradies')
          .update({
            name: userData.name,
            phone: userData.phone,
            address: userData.location,
            company: userData.company,
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating tradie profile:', profileError)
          return { success: false, message: '更新失败，请重试' }
        }
      }

      // 重新加载用户资料
      await loadUserProfile(user.id)

      return { success: true, message: '个人信息更新成功' }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, message: '更新失败，请重试' }
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    sendEmailVerification,
    verifyEmail,
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

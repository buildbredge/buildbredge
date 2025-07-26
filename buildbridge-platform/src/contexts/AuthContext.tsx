"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie' | 'supplier'
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
  userType: 'homeowner' | 'tradie' | 'supplier'
  location: string
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 模拟用户数据库
const mockUsers: User[] = [
  {
    id: '1',
    name: '张先生',
    email: 'zhang@example.com',
    phone: '+64 21 123 4567',
    userType: 'homeowner',
    location: '奥克兰中心',
    verified: true,
    emailVerified: true
  },
  {
    id: '2',
    name: '李师傅',
    email: 'li@example.com',
    phone: '+64 21 234 5678',
    userType: 'tradie',
    location: '奥克兰南区',
    company: '李师傅装修工作室',
    verified: true,
    emailVerified: true
  }
]

// 模拟注册用户存储
const registeredUsers: User[] = [...mockUsers]
const tempPassword: { [email: string]: string } = {
  'zhang@example.com': 'password123',
  'li@example.com': 'password123'
}

// 模拟邮箱验证tokens
const emailVerificationTokens: { [email: string]: string } = {}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查localStorage中的用户信息
    const savedUser = localStorage.getItem('buildbridge-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('buildbridge-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 验证用户凭据
    const foundUser = registeredUsers.find(u => u.email === email)
    const correctPassword = tempPassword[email]

    if (!foundUser) {
      setIsLoading(false)
      return { success: false, message: '用户不存在，请先注册账户' }
    }

    if (!correctPassword || correctPassword !== password) {
      setIsLoading(false)
      return { success: false, message: '邮箱或密码错误，请重试' }
    }

    if (!foundUser.emailVerified) {
      setIsLoading(false)
      return { success: false, message: '请先验证您的邮箱地址' }
    }

    // 登录成功
    setUser(foundUser)
    localStorage.setItem('buildbridge-user', JSON.stringify(foundUser))
    setIsLoading(false)
    return { success: true, message: '登录成功！' }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 检查邮箱是否已存在
    const existingUser = registeredUsers.find(u => u.email === userData.email)
    if (existingUser) {
      setIsLoading(false)
      return { success: false, message: '该邮箱已被注册，请使用其他邮箱或直接登录' }
    }

    // 创建新用户
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      verified: false,
      emailVerified: false
    }

    registeredUsers.push(newUser)
    tempPassword[userData.email] = userData.password

    // 自动发送邮箱验证
    const verificationResult = await sendEmailVerification(userData.email)

    setIsLoading(false)

    if (verificationResult.success) {
      return {
        success: true,
        message: '注册成功！请检查您的邮箱并点击验证链接激活账户。'
      }
    } else {
      return {
        success: true,
        message: '注册成功，但邮箱验证发送失败。请稍后在个人中心重新发送。'
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('buildbridge-user')
  }

  const sendEmailVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 生成验证token
    const token = Math.random().toString(36).substring(2, 15)
    emailVerificationTokens[email] = token

    // 模拟发送邮件（实际应用中这里会调用邮件服务）
    console.log(`邮箱验证邮件已发送到 ${email}`)
    console.log(`验证链接: ${window.location.origin}/verify-email?token=${token}&email=${email}`)

    return {
      success: true,
      message: '验证邮件已发送，请检查您的邮箱（包括垃圾邮件文件夹）'
    }
  }

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 查找对应的邮箱
    const email = Object.keys(emailVerificationTokens).find(
      email => emailVerificationTokens[email] === token
    )

    if (!email || !emailVerificationTokens[email]) {
      return { success: false, message: '验证链接无效或已过期' }
    }

    // 更新用户邮箱验证状态
    const userIndex = registeredUsers.findIndex(u => u.email === email)
    if (userIndex !== -1) {
      registeredUsers[userIndex].emailVerified = true

      // 如果当前登录用户就是被验证的用户，更新状态
      if (user && user.email === email) {
        const updatedUser = { ...user, emailVerified: true }
        setUser(updatedUser)
        localStorage.setItem('buildbridge-user', JSON.stringify(updatedUser))
      }

      // 删除已使用的token
      delete emailVerificationTokens[email]

      return { success: true, message: '邮箱验证成功！您现在可以正常使用所有功能。' }
    }

    return { success: false, message: '用户不存在' }
  }

  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: '请先登录' }
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedUser = { ...user, ...userData }

    // 更新数据库中的用户信息
    const userIndex = registeredUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      registeredUsers[userIndex] = updatedUser
    }

    setUser(updatedUser)
    localStorage.setItem('buildbridge-user', JSON.stringify(updatedUser))

    return { success: true, message: '个人信息更新成功' }
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

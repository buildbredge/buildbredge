/**
 * 认证服务
 * 处理用户认证相关的API调用，不直接访问数据库
 */

import { supabase } from '@/lib/supabase'
import { apiClient } from './apiClient'

interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
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

interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
}

class AuthService {
  // 登录
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let message = '登录失败，请重试'
        
        if (error.message.includes('Invalid login credentials')) {
          message = '登录失败。可能原因：1) 邮箱或密码错误 2) 邮箱尚未验证。请检查您的邮箱并点击验证链接，或重新发送验证邮件。'
        } else if (error.message.includes('Email not confirmed')) {
          message = '请先验证您的邮箱地址。请检查您的邮箱（包括垃圾邮件夹）并点击验证链接。'
        } else if (error.message.includes('Too many requests')) {
          message = '登录尝试过于频繁，请稍后再试'
        }
        
        return { success: false, message }
      }

      if (data.user && data.session) {
        // 设置API客户端的认证token
        apiClient.setAuthToken(data.session.access_token)
        
        return {
          success: true,
          message: '登录成功！',
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: !!data.user.email_confirmed_at
          }
        }
      }

      return { success: false, message: '登录失败，请重试' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登录失败，请重试' }
    }
  }

  // 注册
  async register(userData: RegisterData): Promise<AuthResponse> {
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
        } else if (error.message.includes('Invalid email')) {
          message = '请输入有效的邮箱地址'
        }
        
        return { success: false, message }
      }

      if (data.user) {
        // 使用服务端API创建用户资料，避免前端直接访问数据库
        const profileResponse = await fetch('/api/auth/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: data.user.id,
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            location: userData.location,
            userType: userData.userType,
            company: userData.company
          })
        })

        const profileResult = await profileResponse.json()

        if (!profileResult.success) {
          return { 
            success: false, 
            message: profileResult.error || '用户资料创建失败，请联系客服' 
          }
        }

        return {
          success: true,
          message: '注册成功！请检查您的邮箱并点击验证链接激活账户。',
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: false
          }
        }
      }

      return { success: false, message: '注册失败，请重试' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: '注册失败，请重试' }
    }
  }

  // 登出
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
      apiClient.clearAuthToken()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 获取当前用户会话
  async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        apiClient.setAuthToken(session.access_token)
        return {
          user: {
            id: session.user.id,
            email: session.user.email || '',
            emailConfirmed: !!session.user.email_confirmed_at
          },
          session
        }
      }
      
      return null
    } catch (error) {
      console.error('Session check error:', error)
      return null
    }
  }

  // 重新发送验证邮件
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        let message = '验证邮件发送失败，请重试'
        
        if (error.message.includes('rate limit')) {
          message = '请求过于频繁，请稍后再试'
        }
        
        return { success: false, message }
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

  // 监听认证状态变化
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        apiClient.setAuthToken(session.access_token)
        callback({
          id: session.user.id,
          email: session.user.email || '',
          emailConfirmed: !!session.user.email_confirmed_at
        })
      } else {
        apiClient.clearAuthToken()
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
export type { AuthUser, RegisterData, AuthResponse }
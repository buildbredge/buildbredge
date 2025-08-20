import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// 创建管理员专用的Supabase客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

// 验证管理员权限的函数
export async function verifyAdminAuth(request: NextRequest): Promise<AdminUser | null> {
  try {
    // 从请求头获取Authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('No authorization header found')
      return null
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    // 验证token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !userData.user) {
      console.warn('Invalid token:', userError?.message)
      return null
    }

    // 检查用户是否是管理员
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', userData.user.email)
      .single()

    if (adminError || !adminData) {
      console.warn('User is not an admin:', userData.user.email)
      return null
    }

    return {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
      role: 'admin'
    }

  } catch (error) {
    console.error('Admin auth verification error:', error)
    return null
  }
}

// 用于API路由的权限验证中间件
export function withAdminAuth(
  handler: (request: NextRequest, adminUser: AdminUser, context?: any) => Promise<Response>
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const adminUser = await verifyAdminAuth(request)
    
    if (!adminUser) {
      return Response.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    return handler(request, adminUser, context)
  }
}
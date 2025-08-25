import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '请提供邮箱和密码' }, 
        { status: 400 }
      )
    }

    // 使用 Supabase 进行登录验证
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' }, 
        { status: 401 }
      )
    }

    // 检查用户是否是管理员
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', authData.user.email)
      .single()

    if (adminError || !adminData) {
      // 登出非管理员用户
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: '您没有管理员权限' }, 
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
        admin: adminData,
        accessToken: authData.session?.access_token
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
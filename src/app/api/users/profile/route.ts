import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface UserProfileResponse {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'pending' | 'approved' | 'closed' | 'active'
  verified: boolean
  emailVerified: boolean
  createdAt: string
  roles: UserRole[]
  activeRole: 'owner' | 'tradie'
  // 融合式设计：包含所有角色数据
  ownerData?: {
    status: string
    balance: number
    projectCount?: number
  }
  tradieData?: {
    company: string
    specialty: string
    serviceRadius: number
    rating: number
    reviewCount: number
    status: string
    balance: number
  }
}

// 获取用户资料
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "未授权访问"
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "用户验证失败"
      }, { status: 401 })
    }

    // 从查询参数获取请求的角色（可选）
    const url = new URL(request.url)
    const requestedRole = url.searchParams.get('role') as 'owner' | 'tradie' | null

    // 1. 获取用户基本信息
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: "用户基本信息不存在"
      }, { status: 404 })
    }

    // 2. 获取用户所有角色
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_type, is_primary, created_at')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })

    if (rolesError || !userRoles || userRoles.length === 0) {
      return NextResponse.json({
        success: false,
        error: "用户角色信息不存在"
      }, { status: 404 })
    }

    // 3. 确定活跃角色
    let activeRole: 'owner' | 'tradie'
    if (requestedRole && userRoles.some(r => r.role_type === requestedRole)) {
      activeRole = requestedRole
    } else {
      // 使用主要角色或第一个角色
      const primaryRole = userRoles.find(r => r.is_primary)
      activeRole = primaryRole ? primaryRole.role_type : userRoles[0].role_type
    }

    // 4. 暂时移除对 owners 和 tradies 表的操作
    // 所有数据现在都存储在 users 表中
    let ownerData = null
    let tradieData = null

    const response: UserProfileResponse = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address || '',
      status: userProfile.status,
      verified: userProfile.status === 'approved',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: userProfile.created_at,
      roles: userRoles,
      activeRole: activeRole,
      ownerData: ownerData || undefined,
      tradieData: tradieData || undefined
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('API error:', 'User profile fetch failed', error)
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}

// 更新用户资料
export async function PUT(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "未授权访问"
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "用户验证失败"
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, role, company, specialty, serviceRadius } = body

    // 验证必需字段
    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: "姓名和电话为必填项"
      }, { status: 400 })
    }

    // 获取用户当前角色
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_type, is_primary')
      .eq('user_id', user.id)

    if (rolesError || !userRoles || userRoles.length === 0) {
      return NextResponse.json({
        success: false,
        error: "用户角色信息不存在"
      }, { status: 404 })
    }

    // 确定要更新的角色
    const targetRole = role || userRoles.find(r => r.is_primary)?.role_type || userRoles[0].role_type
    
    // 验证用户是否拥有该角色
    if (!userRoles.some(r => r.role_type === targetRole)) {
      return NextResponse.json({
        success: false,
        error: "您没有权限更新该角色的信息"
      }, { status: 403 })
    }

    // 1. 更新统一用户表的基本信息
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        name,
        phone,
        address
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('User table update error:', userUpdateError)
      return NextResponse.json({
        success: false,
        error: "用户基本信息更新失败"
      }, { status: 500 })
    }

    // 2. 暂时移除对 owners 和 tradies 表的更新操作
    // 所有数据更新都在 users 表中处理

    return NextResponse.json({
      success: true,
      data: {
        message: `${targetRole === 'owner' ? '业主' : '技师'}资料更新成功`
      }
    })

  } catch (error) {
    console.error('API error:', 'User profile update failed', error)
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
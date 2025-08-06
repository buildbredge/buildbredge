import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// 创建用户资料（支持多角色）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, phone, email, location, userType, company } = body

    // 验证必需字段
    if (!userId || !name || !phone || !email || !userType) {
      return NextResponse.json({
        success: false,
        error: "缺少必要的注册信息"
      }, { status: 400 })
    }

    // 验证用户类型
    if (userType !== 'homeowner' && userType !== 'tradie') {
      return NextResponse.json({
        success: false,
        error: "无效的用户类型"
      }, { status: 400 })
    }

    // 1. 检查用户是否已存在于统一用户表中
    const { data: existingUser, error: userSelectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userSelectError && userSelectError.code !== 'PGRST116') {
      console.error('User select error:', userSelectError)
      return NextResponse.json({
        success: false,
        error: `用户查询失败: ${userSelectError.message}`
      }, { status: 500 })
    }

    let userMessage = ''

    // 2. 如果用户不存在，创建新用户记录
    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name,
          phone,
          email,
          address: location,
          status: 'pending',
          latitude: null,
          longitude: null
        })

      if (userError) {
        console.error('User creation error:', userError)
        return NextResponse.json({
          success: false,
          error: "用户基本信息创建失败"
        }, { status: 500 })
      }
      userMessage = '新用户创建成功，'
    } else {
      userMessage = '现有用户，'
    }

    // 3. 检查用户是否已有此角色
    const { data: existingRole, error: roleSelectError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role_type', userType === 'homeowner' ? 'owner' : 'tradie')
      .single()

    if (roleSelectError && roleSelectError.code !== 'PGRST116') {
      console.error('Role select error:', roleSelectError)
      return NextResponse.json({
        success: false,
        error: `角色查询失败: ${roleSelectError.message}`
      }, { status: 500 })
    }

    if (existingRole) {
      return NextResponse.json({
        success: false,
        error: `您已经拥有${userType === 'homeowner' ? '业主' : '技师'}角色，无需重复注册`
      }, { status: 409 })
    }

    // 4. 创建用户角色记录
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_type: userType === 'homeowner' ? 'owner' : 'tradie',
        is_primary: !existingUser // 如果是新用户，设为主要角色
      })

    if (roleError) {
      console.error('Role creation error:', roleError)
      return NextResponse.json({
        success: false,
        error: "用户角色创建失败"
      }, { status: 500 })
    }

    // 5. 注意：不再需要创建 owners 和 tradies 表的记录
    // 所有信息都存储在 users 和 user_roles 表中

    return NextResponse.json({
      success: true,
      data: {
        message: `${userMessage}${userType === 'homeowner' ? '业主' : '技师'}角色添加成功`
      }
    })

  } catch (error) {
    console.error('API error:', 'Profile creation failed', error)
    
    // 如果是数据库错误，返回更具体的错误信息
    if (error && typeof error === 'object' && 'message' in error) {
      return NextResponse.json({
        success: false,
        error: `服务器错误: ${(error as any).message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
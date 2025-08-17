import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = "force-dynamic"

// 创建用户资料（支持多角色）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, phone, email, location, userType, company, categoryId } = body

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
      const userData: any = {
        id: userId,
        name,
        phone,
        email,
        address: location,
        status: userType === 'homeowner' ? 'approved' : 'pending', // 房主直接开通，技师需要审核
        latitude: null,
        longitude: null
      }

      // 如果是tradie且提供了company，则保存
      if (userType === 'tradie' && company) {
        userData.company = company
      }

      const { error: userError } = await supabase
        .from('users')
        .insert(userData)

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
      
      // 如果是现有用户添加tradie角色且提供了company，更新company信息
      if (userType === 'tradie' && company && !existingUser.company) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ company })
          .eq('id', userId)

        if (updateError) {
          console.error('Company update error:', updateError)
        }
      }
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

    // 5. 如果是技师且提供了categoryId，在tradie_professions表中创建记录
    if (userType === 'tradie' && categoryId) {
      const { error: professionError } = await supabase
        .from('tradie_professions')
        .insert({
          tradie_id: userId,
          category_id: categoryId
        })

      if (professionError) {
        console.error('Profession creation error:', professionError)
        return NextResponse.json({
          success: false,
          error: `专业技能记录创建失败: ${professionError.message}`
        }, { status: 500 })
      }
    }

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
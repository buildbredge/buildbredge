import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from '@supabase/supabase-js'

// 在函数内部动态创建客户端以确保环境变量可用
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const dynamic = "force-dynamic"

// 创建用户资料（支持多角色）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      name,
      phone,
      email,
      location,
      coordinates,
      userType,
      language,
      company,
      categoryId,
      professionIds,
      parentTradieId
    } = body

    // 获取管理客户端
    const supabaseAdmin = getSupabaseAdmin()
    
    // 调试：检查环境变量
    console.log('Environment check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
    })
    
    // 测试基本连接
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1)
      console.log('Connection test:', { testData: !!testData, testError: testError?.message })
    } catch (connError) {
      console.error('Connection error:', connError)
    }

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

    let normalizedCategoryId: string | null = null
    let normalizedProfessionIds: string[] = []

    if (userType === 'tradie') {
      if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: "请选择专业领域"
        }, { status: 400 })
      }

      normalizedCategoryId = categoryId.trim()

      if (!Array.isArray(professionIds) || professionIds.length === 0) {
        return NextResponse.json({
          success: false,
          error: "请选择至少一个服务类型"
        }, { status: 400 })
      }

      normalizedProfessionIds = Array.from(
        new Set(
          professionIds.filter(
            (id: unknown): id is string => typeof id === 'string' && id.trim().length > 0
          )
        )
      ).map(id => id.trim())

      if (normalizedProfessionIds.length === 0) {
        return NextResponse.json({
          success: false,
          error: "请选择至少一个有效的服务类型"
        }, { status: 400 })
      }
    }

    // 如果提供了parentTradieId，验证父技师
    if (parentTradieId) {
      // 只有tradie用户可以有父技师
      if (userType !== 'tradie') {
        return NextResponse.json({
          success: false,
          error: "只有技师用户可以设置父技师"
        }, { status: 400 })
      }

      // 验证父技师存在且是tradie角色（临时使用普通client进行测试）
      console.log('Looking for parent tradie:', parentTradieId)
      const { data: parentTradie, error: parentError } = await supabase
        .from('users')
        .select('id, status')
        .eq('id', parentTradieId)
        .single()
      
      console.log('Parent tradie query result:', { parentTradie, parentError })
      
      if (parentError || !parentTradie) {
        console.error('Parent tradie not found:', parentError)
        return NextResponse.json({
          success: false,
          error: `指定的父技师不存在: ${parentError?.message || 'No data'}`
        }, { status: 400 })
      }
      
      // 检查父技师是否有tradie角色（临时使用普通client进行测试）
      const { data: parentRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', parentTradieId)
        .eq('role_type', 'tradie')
        .single()

      if (roleError || !parentRole) {
        console.error('Parent tradie role not found:', roleError)
        return NextResponse.json({
          success: false,
          error: "指定的用户不是技师"
        }, { status: 400 })
      }

      // 验证父技师状态
      if (parentTradie.status !== 'approved' && parentTradie.status !== 'active') {
        return NextResponse.json({
          success: false,
          error: "父技师账户未激活"
        }, { status: 400 })
      }
    }

    // 1. 检查用户是否已存在于统一用户表中（临时使用普通client）
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
        language: language || '中/EN',
        status: userType === 'homeowner' ? 'approved' : 'pending', // 房主直接开通，技师需要审核
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null
      }

      // 如果是tradie且提供了company，则保存
      if (userType === 'tradie' && company) {
        userData.company = company
      }

      // 如果提供了parentTradieId，设置父技师关系
      if (parentTradieId) {
        userData.parent_tradie_id = parentTradieId
      }

      const { error: userError } = await supabaseAdmin
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
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ company })
          .eq('id', userId)

        if (updateError) {
          console.error('Company update error:', updateError)
        }
      }
    }

    // 3. 检查用户是否已有此角色
    const { data: existingRole, error: roleSelectError } = await supabaseAdmin
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
    const { error: roleError } = await supabaseAdmin
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
      // 验证服务类型是否存在且属于所选专业领域
      const { data: professionRecords, error: professionLookupError } = await supabaseAdmin
        .from('professions')
        .select('id, category_id')
        .in('id', normalizedProfessionIds)

      if (professionLookupError) {
        console.error('Profession lookup error:', professionLookupError)
        return NextResponse.json({
          success: false,
          error: '验证服务类型失败'
        }, { status: 500 })
      }

      if (!professionRecords || professionRecords.length !== normalizedProfessionIds.length) {
        return NextResponse.json({
          success: false,
          error: '部分服务类型不存在，请重新选择'
        }, { status: 400 })
      }

      const mismatchedProfession = professionRecords.find(
        profession => profession.category_id !== normalizedCategoryId
      )

      if (mismatchedProfession) {
        return NextResponse.json({
          success: false,
          error: '所选服务类型与专业领域不匹配'
        }, { status: 400 })
      }

      const insertPayload = professionRecords.map(profession => ({
        tradie_id: userId,
        profession_id: profession.id,
        category_id: profession.category_id
      }))

      const { error: professionError } = await supabaseAdmin
        .from('tradie_professions')
        .insert(insertPayload)

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

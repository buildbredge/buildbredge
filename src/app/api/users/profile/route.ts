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
  phone_verified: boolean
  address: string
  language?: string
  status: 'pending' | 'approved' | 'closed' | 'active'
  verified: boolean
  emailVerified: boolean
  createdAt: string
  roles: UserRole[]
  activeRole: 'owner' | 'tradie'
  parent_tradie_id?: string | null
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
    hourlyRate?: number
    experienceYears?: number
    bio?: string
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

    // 4. 根据角色获取角色特定信息
    let ownerData = null
    let tradieData = null

    // 获取技师信息（从users表中的tradie相关字段）
    if (userRoles.some(r => r.role_type === 'tradie')) {
      console.log('Getting tradie data from users table for user:', userProfile.id)
      
      // 从tradie_professions表中获取技师的专业领域信息
      console.log('Fetching specialty from tradie_professions table')
      const { data: tradieProfessions, error: professionsError } = await supabase
        .from('tradie_professions')
        .select(`
          categories(name_zh, name_en)
        `)
        .eq('tradie_id', userProfile.id)
        .limit(1)
        .single()

      let specialtyName = ''
      if (!professionsError && tradieProfessions && tradieProfessions.categories) {
        // Handle both single object and array cases
        const category = Array.isArray(tradieProfessions.categories) 
          ? tradieProfessions.categories[0]
          : tradieProfessions.categories
        
        if (category && typeof category === 'object' && 'name_zh' in category) {
          specialtyName = (category as any).name_zh || (category as any).name_en || ''
          console.log('Found specialty from tradie_professions:', specialtyName)
        }
      } else {
        console.log('No specialty found in tradie_professions table', professionsError)
      }
      
      tradieData = {
        company: userProfile.company || '',
        specialty: specialtyName,
        serviceRadius: userProfile.service_radius || 50,
        rating: userProfile.rating || 0,
        reviewCount: userProfile.review_count || 0,
        status: userProfile.status,
        balance: userProfile.balance || 0,
        hourlyRate: userProfile.hourly_rate || undefined,
        experienceYears: userProfile.experience_years || undefined,
        bio: userProfile.bio || undefined
      }
      console.log('Created tradieData object with specialty:', tradieData)
    }

    // 获取业主信息（从users表中的owner相关字段）
    if (userRoles.some(r => r.role_type === 'owner')) {
      ownerData = {
        status: userProfile.status,
        balance: userProfile.balance || 0,
        projectCount: 0 // TODO: 计算项目数量
      }
    }

    const response: UserProfileResponse = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      phone_verified: userProfile.phone_verified || false,
      address: userProfile.address || '',
      language: userProfile.language || '中/EN',
      status: userProfile.status,
      verified: userProfile.status === 'approved',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: userProfile.created_at,
      roles: userRoles,
      activeRole: activeRole,
      parent_tradie_id: userProfile.parent_tradie_id || null,
      ownerData: ownerData || undefined,
      tradieData: tradieData || undefined
    }

    console.log('Final API Response - tradieData:', tradieData)
    console.log('Final API Response - specialty:', tradieData?.specialty)

    return NextResponse.json({
      success: true,
      data: response,
      debug: {
        userEmail: userProfile.email,
        hasTradiRole: userRoles.some(r => r.role_type === 'tradie'),
        tradieDataExists: !!tradieData,
        tradieDataContent: tradieData
      }
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
    const { name, phone, phone_verified, address, language, role, company, serviceRadius, hourlyRate, experienceYears, bio } = body

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

    // 获取用户基本信息
    const { data: userProfile, error: userFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userFetchError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: "用户基本信息不存在"
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
    const updateData: any = {
      name,
      phone,
      address
    }
    
    // 如果提供了language，则更新该字段
    if (language) {
      updateData.language = language
    }
    
    // 如果提供了phone_verified，则更新该字段
    if (typeof phone_verified === 'boolean') {
      updateData.phone_verified = phone_verified
    }
    
    const { error: userUpdateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('User table update error:', userUpdateError)
      return NextResponse.json({
        success: false,
        error: "用户基本信息更新失败"
      }, { status: 500 })
    }

    // 2. 根据角色更新角色特定信息到users表
    if (targetRole === 'tradie' && (company || serviceRadius || hourlyRate !== undefined || experienceYears !== undefined || bio !== undefined)) {
      console.log('PUT API - Updating tradie info in users table for user:', user.id)
      console.log('PUT API - Update data:', { company, serviceRadius, hourlyRate, experienceYears, bio })
      
      const tradieUpdateData: any = {}
      if (company) tradieUpdateData.company = company
      if (serviceRadius) tradieUpdateData.service_radius = serviceRadius
      if (hourlyRate !== undefined) tradieUpdateData.hourly_rate = hourlyRate
      if (experienceYears !== undefined) tradieUpdateData.experience_years = experienceYears
      if (bio !== undefined) tradieUpdateData.bio = bio

      const { error: tradieUpdateError } = await supabase
        .from('users')
        .update(tradieUpdateData)
        .eq('id', user.id)

      if (tradieUpdateError) {
        console.error('Users table tradie update error:', tradieUpdateError)
        return NextResponse.json({
          success: false,
          error: "技师信息更新失败"
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${targetRole === 'owner' ? '业主' : '技师'}资料更新成功`
      },
      debug: {
        targetRole: targetRole,
        receivedData: { 
          company: company, 
          serviceRadius: serviceRadius,
          hourlyRate: hourlyRate,
          experienceYears: experienceYears,
          bio: bio
        },
        conditionMet: Boolean(targetRole === 'tradie' && (company || serviceRadius || hourlyRate !== undefined || experienceYears !== undefined || bio !== undefined)),
        tradieUpdateExecuted: Boolean(targetRole === 'tradie' && (company || serviceRadius || hourlyRate !== undefined || experienceYears !== undefined || bio !== undefined))
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
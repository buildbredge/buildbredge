import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface CertificationSummary {
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  updatedAt: string
  documentsCount: number
}

interface UserProfileResponse {
  id: string
  name: string
  email: string
  phone: string
  phone_verified: boolean
  address: string
  language?: string
  website?: string
  service_area?: string
  bio?: string
  status: 'pending' | 'approved' | 'closed' | 'active'
  verified: boolean
  emailVerified: boolean
  createdAt: string
  roles: UserRole[]
  activeRole: 'owner' | 'tradie'
  parent_tradie_id?: string | null
  service_areas?: Array<{ id: string; city: string; area: string }>
  serviceAreas?: Array<{ id: string; city: string; area: string }>
  // 融合式设计：包含所有角色数据
  ownerData?: {
    status: string
    balance: number
    projectCount?: number
  }
  tradieData?: {
    company: string
    specialty: string
    specialties?: string[]
    specialtyCategories?: string[]
    serviceRadius: number
    rating: number
    reviewCount: number
    status: string
    balance: number
    hourlyRate?: number
    experienceYears?: number
    bio?: string
  }
  certifications?: {
    personal?: CertificationSummary
    professional?: CertificationSummary
  }
}

interface ServiceAreaRow {
  id: string
  city: string
  area: string
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
    let serviceAreaDetails: Array<{ id: string; city: string; area: string }> = []
    let certificationSummary: UserProfileResponse['certifications'] | undefined

    // 获取技师信息（从users表中的tradie相关字段）
    if (userRoles.some(r => r.role_type === 'tradie')) {
      console.log('Getting tradie data from users table for user:', userProfile.id)
      
      // 从tradie_professions表中获取技师的专业领域信息
      console.log('Fetching specialties from tradie_professions table')
      const { data: tradieProfessions, error: professionsError } = await supabase
        .from('tradie_professions')
        .select(`
          professions(name_zh, name_en),
          categories(name_zh, name_en)
        `)
        .eq('tradie_id', userProfile.id)

      let specialtyName = ''
      let specialtyNames: string[] = []
      let specialtyCategoryNames: string[] = []
      if (!professionsError && Array.isArray(tradieProfessions)) {
        const professionCollected = tradieProfessions.flatMap(record => {
          const professionData = record.professions
          const professions = Array.isArray(professionData)
            ? professionData
            : professionData
              ? [professionData]
              : []

          return professions.flatMap(profession => {
            if (profession && typeof profession === 'object') {
              const { name_zh, name_en } = profession as { name_zh?: string; name_en?: string }
              return name_zh || name_en ? [name_zh || name_en || ''] : []
            }
            return []
          })
        })

        const categoryCollected = tradieProfessions.flatMap(record => {
          const categoryData = record.categories
          const categories = Array.isArray(categoryData)
            ? categoryData
            : categoryData
              ? [categoryData]
              : []

          return categories.flatMap(category => {
            if (category && typeof category === 'object') {
              const { name_zh, name_en } = category as { name_zh?: string; name_en?: string }
              return name_zh || name_en ? [name_zh || name_en || ''] : []
            }
            return []
          })
        })

        specialtyNames = [...new Set(professionCollected.filter(Boolean))]
        specialtyCategoryNames = [...new Set(categoryCollected.filter(Boolean))]

        if (specialtyNames.length === 0) {
          specialtyNames = [...specialtyCategoryNames]
        }

        specialtyName = specialtyNames[0] || ''

        if (specialtyNames.length > 0) {
          console.log('Resolved specialties from tradie_professions:', specialtyNames)
        } else {
          console.log('No specialty names resolved from tradie_professions records')
        }
      } else {
        console.log('Failed to load tradie_professions data', professionsError)
      }
      
      tradieData = {
        company: userProfile.company || '',
        specialty: specialtyName,
        specialties: specialtyNames,
        specialtyCategories: specialtyCategoryNames,
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

      const { data: tradieServiceAreas, error: tradieServiceAreasError } = await supabase
        .from('tradie_service_areas')
        .select('service_area_id, service_areas (id, city, area)')
        .eq('tradie_id', userProfile.id)
        .order('created_at', { ascending: true })

      if (tradieServiceAreasError) {
        console.error('Failed to load tradie service areas:', tradieServiceAreasError)
      } else if (tradieServiceAreas) {
        serviceAreaDetails = tradieServiceAreas
          .map(record => {
            const area = record.service_areas as ServiceAreaRow | ServiceAreaRow[] | null
            if (!area || Array.isArray(area)) {
              return null
            }

            return {
              id: String(area.id),
              city: area.city,
              area: area.area
            }
          })
          .filter((area): area is { id: string; city: string; area: string } => area !== null)
      }
    }

    // 获取认证状态
    const { data: certificationRows, error: certificationError } = await supabase
      .from('tradie_certification_submissions')
      .select('certification_type, status, submitted_at, updated_at, documents')
      .eq('user_id', user.id)

    if (certificationError) {
      console.error('Failed to load certification status:', certificationError)
    } else if (certificationRows && certificationRows.length > 0) {
      certificationSummary = {}
      certificationRows.forEach(row => {
        const documentsCount = Array.isArray(row.documents) ? row.documents.length : 0
        const summary: CertificationSummary = {
          status: row.status as CertificationSummary['status'],
          submittedAt: row.submitted_at,
          updatedAt: row.updated_at,
          documentsCount
        }

        if (row.certification_type === 'personal') {
          certificationSummary!.personal = summary
        }

        if (row.certification_type === 'professional') {
          certificationSummary!.professional = summary
        }
      })
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
      website: userProfile.website || undefined,
      service_area: userProfile.service_area || undefined,
      service_areas: serviceAreaDetails.length > 0 ? serviceAreaDetails : undefined,
      serviceAreas: serviceAreaDetails.length > 0 ? serviceAreaDetails : undefined,
      bio: userProfile.bio || undefined,
      status: userProfile.status,
      verified: userProfile.status === 'approved',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: userProfile.created_at,
      roles: userRoles,
      activeRole: activeRole,
      parent_tradie_id: userProfile.parent_tradie_id || null,
      ownerData: ownerData || undefined,
      tradieData: tradieData || undefined,
      certifications: certificationSummary
    }

    console.log('Final API Response - tradieData:', tradieData)
    console.log('Final API Response - specialties:', tradieData?.specialties || tradieData?.specialty)

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
    const { name, phone, phone_verified, address, language, role, company, serviceRadius, hourlyRate, experienceYears, bio, website, service_area } = body

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
    
    // 如果提供了website，则更新该字段
    if (website !== undefined) {
      updateData.website = website
    }
    
    // 如果提供了service_area，则更新该字段
    if (service_area !== undefined) {
      updateData.service_area = service_area
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

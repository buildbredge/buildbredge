import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface UserProfileResponse {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie'
  location: string
  company?: string
  specialty?: string
  serviceRadius?: number
  rating?: number
  reviewCount?: number
  status: 'pending' | 'approved' | 'closed'
  verified: boolean
  emailVerified: boolean
  createdAt: string
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

    // 尝试从 owners 表获取资料
    const { data: ownerProfile } = await supabase
      .from('owners')
      .select('*')
      .eq('id', user.id)
      .single()

    if (ownerProfile) {
      const userProfile: UserProfileResponse = {
        id: ownerProfile.id,
        name: ownerProfile.name || '',
        email: user.email || '',
        phone: ownerProfile.phone || '',
        userType: 'homeowner',
        location: ownerProfile.address || '',
        status: ownerProfile.status,
        verified: ownerProfile.status === 'approved',
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: ownerProfile.created_at
      }

      return NextResponse.json({
        success: true,
        data: userProfile
      })
    }

    // 如果不是业主，尝试从 tradies 表获取
    const { data: tradieProfile } = await supabase
      .from('tradies')
      .select('*')
      .eq('id', user.id)
      .single()

    if (tradieProfile) {
      const userProfile: UserProfileResponse = {
        id: tradieProfile.id,
        name: tradieProfile.name || '',
        email: user.email || '',
        phone: tradieProfile.phone || '',
        userType: 'tradie',
        location: tradieProfile.address || '',
        company: tradieProfile.company || undefined,
        specialty: tradieProfile.specialty || undefined,
        serviceRadius: tradieProfile.service_radius || undefined,
        rating: tradieProfile.rating || undefined,
        reviewCount: tradieProfile.review_count || undefined,
        status: tradieProfile.status,
        verified: tradieProfile.status === 'approved',
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: tradieProfile.created_at
      }

      return NextResponse.json({
        success: true,
        data: userProfile
      })
    }

    return NextResponse.json({
      success: false,
      error: "用户资料不存在"
    }, { status: 404 })

  } catch (error) {
    console.error('API error:', 'User profile fetch failed')
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
    const { name, phone, location, company, specialty, serviceRadius } = body

    // 验证必需字段
    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: "姓名和电话为必填项"
      }, { status: 400 })
    }

    // 先确定用户类型
    const { data: ownerProfile } = await supabase
      .from('owners')
      .select('id')
      .eq('id', user.id)
      .single()

    if (ownerProfile) {
      // 更新业主资料
      const { error } = await supabase
        .from('owners')
        .update({
          name,
          phone,
          address: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Database update error:', error.code)
        return NextResponse.json({
          success: false,
          error: "更新资料失败"
        }, { status: 500 })
      }
    } else {
      // 更新技师资料
      const updateData: any = {
        name,
        phone,
        address: location,
        updated_at: new Date().toISOString()
      }

      if (company !== undefined) updateData.company = company
      if (specialty !== undefined) updateData.specialty = specialty
      if (serviceRadius !== undefined) updateData.service_radius = serviceRadius

      const { error } = await supabase
        .from('tradies')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        console.error('Database update error:', error.code)
        return NextResponse.json({
          success: false,
          error: "更新资料失败"
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "资料更新成功"
      }
    })

  } catch (error) {
    console.error('API error:', 'User profile update failed')
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
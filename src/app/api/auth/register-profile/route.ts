import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// 创建用户资料
export async function POST(request: NextRequest) {
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
    const { userId, name, phone, email, location, userType, company } = body

    // 验证必需字段
    if (!userId || !name || !phone || !email || !userType) {
      return NextResponse.json({
        success: false,
        error: "缺少必要的注册信息"
      }, { status: 400 })
    }

    // 确保用户只能创建自己的资料
    if (userId !== user.id) {
      return NextResponse.json({
        success: false,
        error: "无权限操作"
      }, { status: 403 })
    }

    // 根据用户类型创建对应的资料
    if (userType === 'homeowner') {
      const { error: profileError } = await supabase
        .from('owners')
        .insert({
          id: userId,
          name,
          phone,
          email,
          address: location,
          status: 'pending',
          balance: 0.00,
          latitude: null,
          longitude: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Owner profile creation error:', profileError.code)
        
        if (profileError.code === '23505') { // 唯一性约束违反
          return NextResponse.json({
            success: false,
            error: "用户资料已存在"
          }, { status: 409 })
        }
        
        return NextResponse.json({
          success: false,
          error: "业主资料创建失败"
        }, { status: 500 })
      }
    } else if (userType === 'tradie') {
      const { error: profileError } = await supabase
        .from('tradies')
        .insert({
          id: userId,
          name,
          phone,
          email,
          company: company || '个人服务',
          specialty: '通用服务',
          status: 'pending',
          balance: 0.00,
          latitude: null,
          longitude: null,
          address: location,
          service_radius: 25,
          rating: 0,
          review_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Tradie profile creation error:', profileError.code)
        
        if (profileError.code === '23505') { // 唯一性约束违反
          return NextResponse.json({
            success: false,
            error: "用户资料已存在"
          }, { status: 409 })
        }
        
        return NextResponse.json({
          success: false,
          error: "技师资料创建失败"
        }, { status: 500 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "无效的用户类型"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "用户资料创建成功"
      }
    })

  } catch (error) {
    console.error('API error:', 'Profile creation failed')
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
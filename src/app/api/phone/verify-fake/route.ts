import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// 在函数内部动态创建客户端以确保环境变量可用
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const dynamic = "force-dynamic"

// 假的手机验证API - 直接标记为已验证
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, phone } = body

    // 验证必需字段
    if (!userId || !phone) {
      return NextResponse.json({
        success: false,
        error: "缺少必要的参数"
      }, { status: 400 })
    }

    // 获取管理客户端
    const supabaseAdmin = getSupabaseAdmin()
    
    // 更新用户的phone_verified字段为true
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        phone_verified: true,
        phone: phone // 同时更新电话号码
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Phone verification update error:', error)
      return NextResponse.json({
        success: false,
        error: "数据库更新失败"
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: "用户不存在"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "手机号码验证成功！",
      data: {
        phone_verified: true
      }
    })

  } catch (error) {
    console.error('API error:', 'Phone verification failed', error)
    
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { 
  createSuccessResponse, 
  createErrorResponse, 
  checkRateLimit,
  ErrorType 
} from "@/lib/api-utils"

export const dynamic = "force-dynamic"

interface SendOtpRequest {
  phone: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    // 速率限制检查 - 每个IP每分钟最多3次
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`send-otp-${clientIP}`, 3, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, "发送验证码过于频繁，请稍后再试", 429)
    }

    const body: SendOtpRequest = await request.json()
    const { phone, userId } = body

    // 验证必需字段
    if (!phone || !userId) {
      return createErrorResponse(ErrorType.VALIDATION, "手机号和用户ID为必填项", 400)
    }

    // 验证手机号格式（简单验证）
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone)) {
      return createErrorResponse(ErrorType.VALIDATION, "手机号格式不正确", 400)
    }

    // 检查用户是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return createErrorResponse(ErrorType.NOT_FOUND, "用户不存在", 404)
    }

    // 手机号级别的速率限制 - 每个手机号每分钟最多1次
    if (!checkRateLimit(`send-otp-phone-${phone}`, 1, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, "该手机号发送验证码过于频繁", 429)
    }

    // 使用 Supabase Auth 发送 OTP
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        // 可以自定义消息模板等选项
      }
    })

    if (otpError) {
      console.error('OTP发送失败:', otpError)
      
      // 处理常见的 Supabase 错误
      if (otpError.message.includes('rate')) {
        return createErrorResponse(ErrorType.RATE_LIMIT, "发送验证码过于频繁，请稍后再试", 429)
      } else if (otpError.message.includes('invalid')) {
        return createErrorResponse(ErrorType.VALIDATION, "手机号格式不正确", 400)
      } else {
        return createErrorResponse(ErrorType.SERVER_ERROR, "发送验证码失败，请重试", 500)
      }
    }

    return createSuccessResponse({
      message: "验证码发送成功",
      phone: phone.replace(/(\+\d{2})\d{4,}(\d{4})/, '$1****$2') // 脱敏显示
    })

  } catch (error) {
    console.error('发送OTP错误:', error)
    return createErrorResponse(
      ErrorType.SERVER_ERROR,
      '服务器内部错误',
      500
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { 
  createSuccessResponse, 
  createErrorResponse, 
  checkRateLimit,
  ErrorType 
} from "@/lib/api-utils"

export const dynamic = "force-dynamic"

// 创建带管理员权限的 Supabase 客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface VerifyOtpRequest {
  phone: string
  code: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    // 速率限制检查 - 每个IP每分钟最多10次尝试
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`verify-otp-${clientIP}`, 10, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, "验证尝试过于频繁，请稍后再试", 429)
    }

    const body: VerifyOtpRequest = await request.json()
    const { phone, code, userId } = body

    // 验证必需字段
    if (!phone || !code || !userId) {
      return createErrorResponse(ErrorType.VALIDATION, "手机号、验证码和用户ID为必填项", 400)
    }

    // 验证码格式检查（6位数字）
    if (!/^\d{6}$/.test(code)) {
      return createErrorResponse(ErrorType.VALIDATION, "验证码格式不正确", 400)
    }

    // 检查用户是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, phone_verified')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return createErrorResponse(ErrorType.NOT_FOUND, "用户不存在", 404)
    }

    // 检查手机号是否已经验证过
    if (user.phone_verified) {
      return createSuccessResponse({
        message: "手机号已验证",
        verified: true
      })
    }

    // 使用 Supabase Auth 验证 OTP
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms'
    })

    if (otpError) {
      console.error('OTP验证失败:', otpError)
      
      // 处理常见的验证错误
      if (otpError.message.includes('invalid') || otpError.message.includes('expired')) {
        return createErrorResponse(ErrorType.VALIDATION, "验证码无效或已过期", 400)
      } else if (otpError.message.includes('attempts')) {
        return createErrorResponse(ErrorType.RATE_LIMIT, "验证尝试次数过多，请重新发送验证码", 429)
      } else {
        return createErrorResponse(ErrorType.SERVER_ERROR, "验证失败，请重试", 500)
      }
    }

    // 验证成功，更新原用户的验证状态
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone: phone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户验证状态失败:', updateError)
      return createErrorResponse(ErrorType.SERVER_ERROR, "更新验证状态失败", 500)
    }

    // 如果存在临时用户，删除它
    if (otpData.user) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(otpData.user.id)
        if (deleteError) {
          console.warn('删除临时用户失败:', deleteError)
          // 这个错误不影响主要功能，只记录警告
        }
      } catch (deleteError) {
        console.warn('删除临时用户异常:', deleteError)
        // 不影响主要验证流程
      }
    }

    return createSuccessResponse({
      message: "手机号验证成功",
      verified: true,
      phone: phone.replace(/(\+\d{2})\d{4,}(\d{4})/, '$1****$2') // 脱敏显示
    })

  } catch (error) {
    console.error('验证OTP错误:', error)
    return createErrorResponse(
      ErrorType.SERVER_ERROR,
      '服务器内部错误',
      500
    )
  }
}
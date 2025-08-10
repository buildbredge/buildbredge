import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleDatabaseError,
  checkRateLimit,
  ErrorType 
} from "@/lib/api-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // 速率限制检查
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`categories-${clientIP}`, 10, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, undefined, 429)
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name_en, name_zh, description')
      .order('name_zh')

    if (error) {
      const dbError = handleDatabaseError(error)
      return createErrorResponse(dbError.errorType, dbError.message, dbError.status)
    }

    return createSuccessResponse(categories || [])
  } catch (error) {
    return createErrorResponse(
      ErrorType.SERVER_ERROR, 
      '服务器内部错误',
      500
    )
  }
}
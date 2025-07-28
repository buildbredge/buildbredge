/**
 * API工具函数
 * 提供统一的错误处理、响应格式和安全工具
 */

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// 标准API响应格式
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

// 错误类型
enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION', 
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR'
}

// 生产环境错误消息映射
const PRODUCTION_ERROR_MESSAGES = {
  [ErrorType.AUTHENTICATION]: '身份验证失败',
  [ErrorType.AUTHORIZATION]: '权限不足',
  [ErrorType.VALIDATION]: '请求参数无效',
  [ErrorType.NOT_FOUND]: '资源不存在',
  [ErrorType.RATE_LIMIT]: '请求过于频繁',
  [ErrorType.SERVER_ERROR]: '服务器内部错误'
}

/**
 * 创建标准化的成功响应
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(response, { status })
}

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(
  errorType: ErrorType,
  customMessage?: string,
  status: number = 500
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const response: ApiResponse = {
    success: false,
    error: isDevelopment && customMessage 
      ? customMessage 
      : PRODUCTION_ERROR_MESSAGES[errorType],
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(response, { status })
}

/**
 * 验证用户身份和权限
 */
export async function authenticateUser(authHeader: string | null): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: '未提供有效的授权令牌'
    }
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return {
        success: false,
        error: '用户验证失败'
      }
    }

    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: '身份验证异常'
    }
  }
}

/**
 * 验证请求参数
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields?: string[] } {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  )
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.length > 0 ? missingFields : undefined
  }
}

/**
 * 安全日志记录（隐藏敏感信息）
 */
export function secureLog(operation: string, data: any = {}) {
  if (process.env.NODE_ENV === 'development') {
    // 移除敏感字段
    const sanitized = { ...data }
    delete sanitized.password
    delete sanitized.token
    delete sanitized.email
    delete sanitized.phone
    
    console.log(`🔒 ${operation}:`, sanitized)
  }
}

/**
 * 数据库错误处理
 */
export function handleDatabaseError(error: any): {
  errorType: ErrorType
  message: string
  status: number
} {
  // 常见的数据库错误码映射
  if (error.code === 'PGRST116') {
    return {
      errorType: ErrorType.NOT_FOUND,
      message: '资源不存在',
      status: 404
    }
  }
  
  if (error.code === '23505') {
    return {
      errorType: ErrorType.VALIDATION,
      message: '数据已存在',
      status: 409
    }
  }
  
  if (error.code === '23503') {
    return {
      errorType: ErrorType.VALIDATION,
      message: '引用的数据不存在',
      status: 400
    }
  }
  
  // 默认服务器错误
  return {
    errorType: ErrorType.SERVER_ERROR,
    message: '数据库操作失败',
    status: 500
  }
}

/**
 * 分页参数验证和标准化
 */
export function validatePaginationParams(searchParams: URLSearchParams): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

/**
 * 速率限制检查（简单的内存实现）
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// 导出错误类型枚举
export { ErrorType }
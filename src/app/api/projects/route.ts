import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { 
  authenticateUser, 
  createSuccessResponse, 
  createErrorResponse, 
  validatePaginationParams,
  validateRequiredFields,
  handleDatabaseError,
  secureLog,
  checkRateLimit,
  ErrorType 
} from "@/lib/api-utils"

export const dynamic = "force-dynamic"

interface ProjectResponse {
  id: string
  title: string
  description: string
  status: string
  category: string
  profession: string
  location: string
  createdAt: string
  updatedAt: string
}

// 获取用户项目列表
export async function GET(request: NextRequest) {
  try {
    // 速率限制检查
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`projects-list-${clientIP}`, 30, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, undefined, 429)
    }

    // 验证用户身份
    const authResult = await authenticateUser(request.headers.get('authorization'))
    if (!authResult.success) {
      return createErrorResponse(ErrorType.AUTHENTICATION, authResult.error, 401)
    }

    const user = authResult.user
    secureLog('Projects list request', { userId: user.id })

    // 获取并验证查询参数
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = validatePaginationParams(searchParams)
    const status = searchParams.get('status')

    // 构建查询
    let query = supabase
      .from('projects')
      .select(`
        id,
        description,
        status,
        location,
        created_at,
        updated_at,
        category_id,
        profession_id,
        categories!inner(name_zh),
        professions!inner(name_zh)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 添加状态过滤
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: projects, error, count } = await query

    if (error) {
      secureLog('Database query error', { errorCode: error.code })
      const dbError = handleDatabaseError(error)
      return createErrorResponse(dbError.errorType, dbError.message, dbError.status)
    }

    // 格式化响应数据，隐藏内部结构
    const formattedProjects: ProjectResponse[] = (projects || []).map(project => {
      const categoryName = Array.isArray(project.categories) 
        ? (project.categories[0] as any)?.name_zh || '未分类'
        : (project.categories as any)?.name_zh || '未分类'
      
      const professionName = Array.isArray(project.professions)
        ? (project.professions[0] as any)?.name_zh || '未指定'
        : (project.professions as any)?.name_zh || '未指定'

      return {
        id: project.id,
        title: categoryName,
        description: project.description,
        status: project.status,
        category: categoryName,
        profession: professionName,
        location: project.location || '位置未指定',
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    })

    return createSuccessResponse({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    secureLog('API error', { operation: 'Projects list failed' })
    return createErrorResponse(ErrorType.SERVER_ERROR, undefined, 500)
  }
}

// 创建新项目
export async function POST(request: NextRequest) {
  try {
    // 速率限制检查
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`projects-create-${clientIP}`, 10, 60000)) {
      return createErrorResponse(ErrorType.RATE_LIMIT, undefined, 429)
    }

    // 验证用户身份
    const authResult = await authenticateUser(request.headers.get('authorization'))
    if (!authResult.success) {
      return createErrorResponse(ErrorType.AUTHENTICATION, authResult.error, 401)
    }

    const user = authResult.user
    const body = await request.json()
    const { description, categoryId, professionId, images, budget } = body

    // 验证必需字段
    const validation = validateRequiredFields(body, ['description', 'categoryId'])
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorType.VALIDATION, 
        `缺少必要字段: ${validation.missingFields?.join(', ')}`, 
        400
      )
    }

    secureLog('Project creation request', { userId: user.id, categoryId })

    // 创建项目
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        description,
        category_id: categoryId,
        profession_id: professionId,
        images: images || [],
        budget,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      secureLog('Project creation error', { errorCode: error.code })
      const dbError = handleDatabaseError(error)
      return createErrorResponse(dbError.errorType, dbError.message, dbError.status)
    }

    return createSuccessResponse({
      projectId: data.id,
      message: "项目创建成功"
    })

  } catch (error) {
    secureLog('API error', { operation: 'Project creation failed' })
    return createErrorResponse(ErrorType.SERVER_ERROR, undefined, 500)
  }
}
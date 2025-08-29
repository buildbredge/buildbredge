import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { 
  authenticateUser, 
  createSuccessResponse, 
  createErrorResponse, 
  handleDatabaseError,
  secureLog,
  ErrorType 
} from "@/lib/api-utils"

export const dynamic = "force-dynamic"

interface DashboardData {
  // 项目统计
  projectStats: {
    total: number
    published: number
    quoted: number
    negotiating: number
    agreed: number
    escrowed: number
    inProgress: number
    completed: number
    protection: number
    released: number
    withdrawn: number
    disputed: number
    cancelled: number
  }
  // 最近项目
  recentProjects: Array<{
    id: string
    title: string
    description: string
    status: string
    category: string
    profession: string
    location: string
    createdAt: string
  }>
  // 服务统计（针对技师）
  serviceStats?: {
    availableJobs: number
    activeServices: number
    pendingQuotes: number
    monthlyRevenue: number
  }
  // 可用服务分类
  availableCategories: Array<{
    id: string
    name: string
    count: number
  }>
}

// 获取Dashboard数据
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authenticateUser(request.headers.get('authorization'))
    if (!authResult.success) {
      return createErrorResponse(ErrorType.AUTHENTICATION, authResult.error, 401)
    }

    const user = authResult.user
    secureLog('Dashboard data request', { userId: user.id })

    // 获取用户角色信息
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_type')
      .eq('user_id', user.id)

    if (rolesError) {
      secureLog('Roles query error', { errorCode: rolesError.code })
      const dbError = handleDatabaseError(rolesError)
      return createErrorResponse(dbError.errorType, dbError.message, dbError.status)
    }

    const isTradie = userRoles?.some(r => r.role_type === 'tradie')

    // 1. 获取项目统计
    const { data: projectCounts, error: projectError } = await supabase
      .from('projects')
      .select('status')
      .eq('user_id', user.id)

    if (projectError) {
      secureLog('Project stats error', { errorCode: projectError.code })
    }

    const projectStats = {
      total: projectCounts?.length || 0,
      published: projectCounts?.filter(p => p.status === 'published').length || 0,
      quoted: projectCounts?.filter(p => p.status === 'quoted').length || 0,
      negotiating: projectCounts?.filter(p => p.status === 'negotiating').length || 0,
      agreed: projectCounts?.filter(p => p.status === 'agreed').length || 0,
      escrowed: projectCounts?.filter(p => p.status === 'escrowed').length || 0,
      inProgress: projectCounts?.filter(p => p.status === 'in_progress').length || 0,
      completed: projectCounts?.filter(p => p.status === 'completed').length || 0,
      protection: projectCounts?.filter(p => p.status === 'protection').length || 0,
      released: projectCounts?.filter(p => p.status === 'released').length || 0,
      withdrawn: projectCounts?.filter(p => p.status === 'withdrawn').length || 0,
      disputed: projectCounts?.filter(p => p.status === 'disputed').length || 0,
      cancelled: projectCounts?.filter(p => p.status === 'cancelled').length || 0
    }

    // 2. 获取最近项目（限制5个）
    const { data: projects, error: recentError } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        status,
        location,
        created_at,
        category_id,
        profession_id,
        categories!inner(name_zh),
        professions(name_zh)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentProjects = (projects || []).map(project => ({
      id: project.id,
      title: (project.categories as any)?.name_zh || '未分类',
      description: project.description,
      status: project.status,
      category: (project.categories as any)?.name_zh || '未分类',
      profession: (project.professions as any)?.name_zh || '未指定',
      location: project.location || '位置未指定',
      createdAt: project.created_at
    }))

    // 3. 获取可用服务分类统计
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select(`
        id,
        name_zh,
        projects!inner(id)
      `)
      .limit(10)

    const availableCategories = (categories || []).map(category => ({
      id: category.id,
      name: category.name_zh,
      count: (category.projects as any[])?.length || 0
    }))

    // 4. 如果是技师，获取服务相关统计
    let serviceStats = undefined
    if (isTradie) {
      // 这里可以添加技师特定的统计查询
      // 暂时使用模拟数据
      serviceStats = {
        availableJobs: 12, // 可接项目数
        activeServices: 3,  // 进行中的服务
        pendingQuotes: 5,   // 待报价的项目
        monthlyRevenue: 2500 // 本月收入
      }
    }

    const dashboardData: DashboardData = {
      projectStats,
      recentProjects,
      serviceStats,
      availableCategories
    }

    return createSuccessResponse(dashboardData)

  } catch (error) {
    secureLog('API error', { operation: 'Dashboard data fetch failed' })
    return createErrorResponse(ErrorType.SERVER_ERROR, undefined, 500)
  }
}
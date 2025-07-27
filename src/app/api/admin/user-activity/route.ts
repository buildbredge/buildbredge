import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userType = searchParams.get('userType') // 'owner' | 'tradie' | 'all'
    const status = searchParams.get('status') // 'pending' | 'approved' | 'closed' | 'all'
    const search = searchParams.get('search') // 搜索关键词
    const sortBy = searchParams.get('sortBy') || 'created_at' // 排序字段
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 排序方向

    const offset = (page - 1) * limit

    // 构建查询条件
    let ownerQuery = supabase
      .from('owners')
      .select('*')
    
    let tradieQuery = supabase
      .from('tradies')
      .select('*')

    // 应用状态筛选
    if (status && status !== 'all') {
      ownerQuery = ownerQuery.eq('status', status)
      tradieQuery = tradieQuery.eq('status', status)
    }

    // 应用搜索
    if (search) {
      ownerQuery = ownerQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      tradieQuery = tradieQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // 获取用户数据
    const [ownersResult, tradiesResult] = await Promise.all([
      userType === 'tradie' ? { data: [], error: null } : ownerQuery,
      userType === 'owner' ? { data: [], error: null } : tradieQuery
    ])

    if (ownersResult.error) throw ownersResult.error
    if (tradiesResult.error) throw tradiesResult.error

    const owners = ownersResult.data || []
    const tradies = tradiesResult.data || []

    // 获取所有用户的项目统计
    const allUserIds = [
      ...owners.map(o => o.id),
      ...tradies.map(t => t.id)
    ]

    let projectStats = {}
    if (allUserIds.length > 0) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('user_id, status, created_at')
        .in('user_id', allUserIds)

      if (projectsError) throw projectsError

      // 计算每个用户的项目统计
      projectStats = (projects || []).reduce((acc: any, project: any) => {
        if (!acc[project.user_id]) {
          acc[project.user_id] = {
            total: 0,
            published: 0,
            completed: 0,
            cancelled: 0,
            lastPostDate: null
          }
        }
        
        acc[project.user_id].total++
        acc[project.user_id][project.status]++
        
        if (!acc[project.user_id].lastPostDate || 
            new Date(project.created_at) > new Date(acc[project.user_id].lastPostDate)) {
          acc[project.user_id].lastPostDate = project.created_at
        }
        
        return acc
      }, {})
    }

    // 合并用户数据和活动统计
    const combinedUsers = [
      ...owners.map(owner => ({
        ...owner,
        userType: 'owner' as const,
        company: null,
        specialty: null,
        service_radius: null,
        rating: null,
        review_count: null,
        projects: (projectStats as any)[owner.id] || {
          total: 0,
          published: 0,
          completed: 0,
          cancelled: 0,
          lastPostDate: null
        }
      })),
      ...tradies.map(tradie => ({
        ...tradie,
        userType: 'tradie' as const,
        projects: (projectStats as any)[tradie.id] || {
          total: 0,
          published: 0,
          completed: 0,
          cancelled: 0,
          lastPostDate: null
        }
      }))
    ]

    // 应用排序
    combinedUsers.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'projects_total':
          aValue = a.projects.total
          bValue = b.projects.total
          break
        case 'last_post':
          aValue = a.projects.lastPostDate ? new Date(a.projects.lastPostDate).getTime() : 0
          bValue = b.projects.lastPostDate ? new Date(b.projects.lastPostDate).getTime() : 0
          break
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // 应用分页
    const total = combinedUsers.length
    const paginatedUsers = combinedUsers.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        },
        filters: {
          userType,
          status,
          search,
          sortBy,
          sortOrder
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("获取用户活动数据失败:", error)
    return NextResponse.json({
      success: false,
      error: "获取用户活动数据失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
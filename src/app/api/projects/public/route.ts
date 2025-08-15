import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// 公开获取项目列表 - 只返回已发布和协商中的项目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // 最大100个
    const offset = (page - 1) * limit
    const status = searchParams.get('status') // 可以是 'published,negotiating' 这样的格式
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'created_at:desc'
    const search = searchParams.get('search')

    // 解析排序参数
    const [sortField, sortOrder] = sort.split(':')
    const ascending = sortOrder === 'asc'

    // 构建基础查询 - 只返回公开可见的项目
    let query = supabase
      .from('projects')
      .select(`
        id,
        description,
        detailed_description,
        location,
        email,
        phone,
        status,
        created_at,
        updated_at,
        category_id,
        profession_id,
        other_description,
        time_option,
        priority_need,
        images,
        categories(
          id,
          name_en,
          name_zh
        ),
        professions(
          id,
          name_en,
          name_zh
        )
      `)
      .in('status', ['published', 'negotiating']) // 只显示这两种状态的项目

    // 状态筛选
    if (status && status !== 'all') {
      const statusArray = status.split(',').map(s => s.trim())
      query = query.in('status', statusArray)
    }

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // 搜索筛选
    if (search) {
      query = query.or(`description.ilike.%${search}%,detailed_description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // 排序
    if (sortField === 'created_at') {
      query = query.order('created_at', { ascending })
    } else if (sortField === 'updated_at') {
      query = query.order('updated_at', { ascending })
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: projects, error, count } = await query

    if (error) {
      console.error('Error fetching public projects:', error)
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      )
    }

    // 获取每个项目的报价数量
    const projectIds = (projects || []).map(p => p.id)
    let quoteCounts: { [key: string]: number } = {}
    
    if (projectIds.length > 0) {
      const { data: quotes } = await supabase
        .from('quotes')
        .select('project_id')
        .in('project_id', projectIds)
      
      if (quotes) {
        quoteCounts = quotes.reduce((acc, quote) => {
          acc[quote.project_id] = (acc[quote.project_id] || 0) + 1
          return acc
        }, {} as { [key: string]: number })
      }
    }

    // 处理数据，添加报价数量
    const formattedProjects = (projects || []).map(project => {
      // 处理可能的数组结果
      const category = Array.isArray(project.categories) ? project.categories[0] : project.categories
      const profession = Array.isArray(project.professions) ? project.professions[0] : project.professions

      return {
        id: project.id,
        description: project.description,
        detailed_description: project.detailed_description,
        location: project.location,
        email: project.email, // 保留邮箱用于联系
        phone: project.phone,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        category: category || null,
        profession: profession || null,
        other_description: project.other_description,
        time_option: project.time_option,
        priority_need: project.priority_need,
        quote_count: quoteCounts[project.id] || 0,
        images: project.images || []
      }
    })

    // 获取总数（用于分页）
    const { count: totalCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['published', 'negotiating'])

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: offset + limit < (totalCount || 0),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error in public projects API:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
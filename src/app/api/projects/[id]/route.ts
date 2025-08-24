import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ProjectStatus, isActiveStatus } from "@/types/project-status"

export const dynamic = "force-dynamic"

interface ProjectDetailResponse {
  id: string
  title: string
  description: string
  status: string
  category: string
  profession: string
  images: string[]
  budget: number | null
  createdAt: string
  updatedAt: string
  location: string | null
}

// 获取单个项目详情 - 支持不同访问级别
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查用户身份以确定访问权限
    let currentUser = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data: { user } } = await supabase.auth.getUser(token)
      currentUser = user
    }

    // 查询项目详情
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(id, name_en, name_zh),
        profession:professions(id, name_en, name_zh)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          error: "项目不存在或已被删除"
        }, { status: 404 })
      }
      
      console.error('Database query error:', error)
      return NextResponse.json({
        error: "获取项目详情失败"
      }, { status: 500 })
    }

    // 访问权限检查
    if (project) {
      // 项目所有者可以访问任何状态的项目
      const isOwner = currentUser && project.user_id === currentUser.id
      
      // 非所有者只能访问可见的项目（草稿、已报价、协商中等）
      const publicVisibleStatuses = [
        ProjectStatus.DRAFT,
        ProjectStatus.QUOTED, 
        ProjectStatus.NEGOTIATING,
        ProjectStatus.AGREED,
        ProjectStatus.ESCROWED,
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED
      ]
      
      if (!isOwner && !publicVisibleStatuses.includes(project.status as ProjectStatus)) {
        return NextResponse.json({
          error: "项目不存在或已被删除"
        }, { status: 404 })
      }
    }

    // 直接返回项目数据，保持与原来API相同的格式
    return NextResponse.json(project)

  } catch (error) {
    console.error('API error:', 'Project detail failed')
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}

// 更新项目
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const { description, categoryId, professionId, images, budget, status } = body

    // 更新项目
    const { data, error } = await supabase
      .from('projects')
      .update({
        description,
        category_id: categoryId,
        profession_id: professionId,
        images,
        budget,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // 确保用户只能更新自己的项目
      .select('id')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: "项目不存在或无权访问"
        }, { status: 404 })
      }
      
      console.error('Database update error:', error.code)
      return NextResponse.json({
        success: false,
        error: "更新项目失败"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId: data.id,
        message: "项目更新成功"
      }
    })

  } catch (error) {
    console.error('API error:', 'Project update failed')
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}

// 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // 删除项目
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // 确保用户只能删除自己的项目

    if (error) {
      console.error('Database delete error:', error.code)
      return NextResponse.json({
        success: false,
        error: "删除项目失败"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "项目删除成功"
      }
    })

  } catch (error) {
    console.error('API error:', 'Project deletion failed')
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
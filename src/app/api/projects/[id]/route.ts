import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

// 获取单个项目详情
export async function GET(
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

    // 查询项目详情
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        status,
        created_at,
        updated_at,
        images,
        budget,
        location,
        category_id,
        profession_id,
        categories!inner(name_zh),
        professions!inner(name_zh)
      `)
      .eq('id', id)
      .eq('user_id', user.id) // 确保用户只能访问自己的项目
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: "项目不存在或无权访问"
        }, { status: 404 })
      }
      
      console.error('Database query error:', error.code)
      return NextResponse.json({
        success: false,
        error: "获取项目详情失败"
      }, { status: 500 })
    }

    // 格式化响应数据
    const categoryName = Array.isArray(project.categories) 
      ? (project.categories[0] as any)?.name_zh || '未分类'
      : (project.categories as any)?.name_zh || '未分类'
    
    const professionName = Array.isArray(project.professions)
      ? (project.professions[0] as any)?.name_zh || '未指定'
      : (project.professions as any)?.name_zh || '未指定'

    const formattedProject: ProjectDetailResponse = {
      id: project.id,
      title: categoryName,
      description: project.description,
      status: project.status,
      category: categoryName,
      profession: professionName,
      images: project.images || [],
      budget: project.budget,
      location: project.location,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }

    return NextResponse.json({
      success: true,
      data: formattedProject
    })

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
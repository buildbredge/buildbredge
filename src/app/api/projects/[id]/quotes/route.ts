import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"
import { ProjectStatus, isActiveStatus } from "@/types/project-status"

export const dynamic = "force-dynamic"

// GET /api/projects/[id]/quotes - 获取项目所有报价
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id

    // 获取项目报价和技师信息
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        attachments,
        created_at,
        updated_at,
        tradie:users!tradie_id(
          id,
          name,
          email,
          phone,
          company,
          rating,
          review_count,
          experience_years,
          bio
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching quotes:", error)
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      quotes: quotes || []
    })

  } catch (error) {
    console.error("Error in quotes API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/quotes - 技师提交报价
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id
    const { tradie_id, price, description, attachments = [] } = await request.json()

    // 验证必需字段
    if (!tradie_id || !price || !description) {
      return NextResponse.json(
        { error: "Missing required fields: tradie_id, price, description" },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      )
    }

    // 检查项目是否存在并获取项目信息
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        location,
        email,
        user_id,
        status
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // 检查项目状态是否允许报价 - 使用新的状态系统
    const allowedQuoteStatuses = [
      ProjectStatus.DRAFT,
      ProjectStatus.QUOTED,
      ProjectStatus.NEGOTIATING
    ]
    
    if (!allowedQuoteStatuses.includes(project.status as ProjectStatus)) {
      return NextResponse.json(
        { error: "Project is not accepting quotes" },
        { status: 400 }
      )
    }

    // 检查技师是否存在
    const { data: tradie, error: tradieError } = await supabase
      .from('users')
      .select('id, name, email, phone, company, rating, review_count')
      .eq('id', tradie_id)
      .single()

    if (tradieError || !tradie) {
      return NextResponse.json(
        { error: "Tradie not found" },
        { status: 404 }
      )
    }

    // 检查是否已有报价（防重复）
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('id')
      .eq('project_id', projectId)
      .eq('tradie_id', tradie_id)
      .single()

    if (existingQuote) {
      return NextResponse.json(
        { error: "You have already submitted a quote for this project" },
        { status: 400 }
      )
    }

    // 创建报价
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        project_id: projectId,
        tradie_id: tradie_id,
        price: parseFloat(price),
        description: description.trim(),
        attachments: attachments,
        status: 'pending'
      })
      .select()
      .single()

    if (quoteError) {
      console.error("Error creating quote:", quoteError)
      return NextResponse.json(
        { error: "Failed to submit quote" },
        { status: 500 }
      )
    }

    // 如果项目状态是"草稿"，自动更改为"已报价"
    if (project.status === ProjectStatus.DRAFT) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          status: ProjectStatus.QUOTED,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (updateError) {
        console.error("Error updating project status:", updateError)
        // 不让状态更新错误影响报价提交成功
      } else {
        console.log(`✅ Project status updated to '${ProjectStatus.QUOTED}'`)
      }
    }

    // 发送邮件通知项目拥有者
    try {
      await smtpEmailService.sendQuoteSubmissionNotification({
        to: project.email,
        projectId: project.id,
        projectTitle: project.description,
        projectLocation: project.location,
        tradieId: tradie.id,
        tradieName: tradie.name,
        tradieCompany: tradie.company,
        tradiePhone: tradie.phone,
        quotePrice: parseFloat(price),
        quoteDescription: description.trim(),
        tradieRating: tradie.rating,
        tradieReviewCount: tradie.review_count
      })
      console.log("✅ Quote notification email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send quote notification email:", emailError)
      // 不让邮件错误影响报价提交成功
    }

    return NextResponse.json({
      success: true,
      message: "Quote submitted successfully",
      quote: newQuote
    })

  } catch (error) {
    console.error("Error submitting quote:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
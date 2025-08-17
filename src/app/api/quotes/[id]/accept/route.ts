import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// PUT /api/quotes/[id]/accept - 接受报价
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const quoteId = params.id

    console.log("🔍 Looking for quote with ID:", quoteId)

    // 获取报价详情和相关信息
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        projects!quotes_project_id_fkey(
          id,
          description,
          location,
          email,
          user_id,
          status
        ),
        users!quotes_tradie_id_fkey(
          id,
          name,
          email,
          phone,
          company
        )
      `)
      .eq('id', quoteId)
      .single()

    console.log("📊 Quote query result:", { quote, error: quoteError })

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    // 检查报价状态
    if (quote.status !== 'pending') {
      return NextResponse.json(
        { error: "Quote is not in pending status" },
        { status: 400 }
      )
    }

    // 获取项目信息（处理可能的数组）
    const project = Array.isArray(quote.projects) ? quote.projects[0] : quote.projects
    const tradie = Array.isArray(quote.users) ? quote.users[0] : quote.users

    console.log("📋 Extracted data:", { 
      project: project, 
      tradie: tradie,
      quoteStatus: quote.status 
    })
    
    // 检查项目状态
    if (project?.status !== 'negotiating' && project?.status !== 'published') {
      return NextResponse.json(
        { error: "Project is not in negotiating status" },
        { status: 400 }
      )
    }

    // TODO: 添加权限检查 - 确保只有项目拥有者可以接受报价
    // 这里应该检查请求者是否是项目的拥有者

    console.log("✅ All checks passed, updating quote and project status...")

    // 开始事务处理：接受报价、拒绝其他报价、更新项目状态
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select()

    console.log("📝 Quote update result:", { updatedQuote, updateError })

    if (updateError) {
      console.error("Error accepting quote:", updateError)
      return NextResponse.json(
        { error: "Failed to accept quote" },
        { status: 500 }
      )
    }

    // 拒绝同项目的其他待处理报价
    const { error: rejectError } = await supabase
      .from('quotes')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('project_id', quote.project_id)
      .eq('status', 'pending')
      .neq('id', quoteId)

    if (rejectError) {
      console.error("Error rejecting other quotes:", rejectError)
      // 不中断流程，但记录错误
    } else {
      console.log("✅ Other pending quotes rejected")
    }

    // 更新项目状态为进行中，并设置接受的报价ID
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'in_progress',
        accepted_quote_id: quoteId,
        updated_at: new Date().toISOString()
      })
      .eq('id', quote.project_id)

    if (projectUpdateError) {
      console.error("Error updating project status:", projectUpdateError)
      return NextResponse.json(
        { error: "Failed to update project status" },
        { status: 500 }
      )
    } else {
      console.log("✅ Project status updated to in_progress")
    }

    // 获取项目拥有者信息（如果是注册用户）
    let ownerName = undefined
    let ownerPhone = undefined
    
    if (project?.user_id) {
      const { data: owner } = await supabase
        .from('users')
        .select('name, phone')
        .eq('id', project.user_id)
        .single()
      
      if (owner) {
        ownerName = owner.name
        ownerPhone = owner.phone
      }
    }

    // 发送邮件通知技师
    try {
      await smtpEmailService.sendQuoteAcceptanceNotification({
        to: tradie?.email || '',
        projectId: project?.id || '',
        projectTitle: project?.description || '',
        projectLocation: project?.location || '',
        ownerName,
        ownerEmail: project?.email || '',
        ownerPhone,
        quotePrice: quote.price
      })
      console.log("✅ Quote acceptance email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send quote acceptance email:", emailError)
      // 不让邮件错误影响报价接受成功
    }

    return NextResponse.json({
      success: true,
      message: "Quote accepted successfully"
    })

  } catch (error) {
    console.error("Error accepting quote:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
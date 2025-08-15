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
        project:projects(
          id,
          description,
          location,
          email,
          user_id,
          status
        ),
        tradie:users(
          id,
          name,
          email,
          phone,
          company
        )
      `)
      .eq('id', quoteId)
      .single()

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
    const project = Array.isArray(quote.project) ? quote.project[0] : quote.project
    const tradie = Array.isArray(quote.tradie) ? quote.tradie[0] : quote.tradie
    
    // 检查项目状态
    if (project?.status !== 'negotiating' && project?.status !== 'published') {
      return NextResponse.json(
        { error: "Project is not in negotiating status" },
        { status: 400 }
      )
    }

    // TODO: 添加权限检查 - 确保只有项目拥有者可以接受报价
    // 这里应该检查请求者是否是项目的拥有者

    // 接受报价（数据库触发器会自动：拒绝其他报价，更新项目状态为in_progress）
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)

    if (updateError) {
      console.error("Error accepting quote:", updateError)
      return NextResponse.json(
        { error: "Failed to accept quote" },
        { status: 500 }
      )
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
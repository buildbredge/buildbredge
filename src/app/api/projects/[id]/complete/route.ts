import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// PUT /api/projects/[id]/complete - 技师标记项目完成
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id
    const { tradie_id } = await request.json()

    if (!tradie_id) {
      return NextResponse.json(
        { error: "Missing tradie_id" },
        { status: 400 }
      )
    }

    // 获取项目信息和接受的报价
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        location,
        email,
        user_id,
        status,
        accepted_quote_id,
        accepted_quote:quotes(
          id,
          tradie_id,
          tradie:users(
            id,
            name,
            company
          )
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // 检查项目状态
    if (project.status !== 'in_progress') {
      return NextResponse.json(
        { error: "Project is not in progress" },
        { status: 400 }
      )
    }

    // 检查只有被接受的技师才能标记完成
    const acceptedQuote = Array.isArray(project.accepted_quote) ? project.accepted_quote[0] : project.accepted_quote
    if (!acceptedQuote?.tradie_id || acceptedQuote.tradie_id !== tradie_id) {
      return NextResponse.json(
        { error: "Only the assigned tradie can mark project as complete" },
        { status: 403 }
      )
    }

    // 更新项目状态为完成
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      console.error("Error completing project:", updateError)
      return NextResponse.json(
        { error: "Failed to complete project" },
        { status: 500 }
      )
    }

    // 处理可能的数组结果
    const tradie = Array.isArray(acceptedQuote?.tradie) ? acceptedQuote.tradie[0] : acceptedQuote?.tradie

    // 发送完成通知邮件给项目拥有者
    try {
      await smtpEmailService.sendProjectCompletionNotification({
        to: project.email,
        projectId: project.id,
        projectTitle: project.description,
        tradieId: tradie?.id || '',
        tradieName: tradie?.name || '',
        tradieCompany: tradie?.company
      })
      console.log("✅ Project completion email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send project completion email:", emailError)
      // 不让邮件错误影响项目完成成功
    }

    return NextResponse.json({
      success: true,
      message: "Project marked as completed successfully"
    })

  } catch (error) {
    console.error("Error completing project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
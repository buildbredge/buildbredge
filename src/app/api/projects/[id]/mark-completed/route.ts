import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// PUT /api/projects/[id]/mark-completed - 技师标记工作完成，进入保护期
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { completionNotes } = await request.json()
    const projectId = params.id
    const completionDate = new Date()
    const protectionEndDate = new Date(completionDate.getTime() + 15 * 24 * 60 * 60 * 1000) // 15天后

    console.log("✅ Marking project as completed:", projectId)

    // 获取项目详情
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        status,
        description,
        location,
        email,
        user_id,
        agreed_price,
        agreed_quote_id,
        quotes!projects_agreed_quote_id_fkey(
          tradie_id,
          users!quotes_tradie_id_fkey(
            id,
            name,
            email,
            phone,
            parent_tradie_id
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

    // 检查项目状态必须是in_progress
    if (project.status !== 'in_progress') {
      return NextResponse.json(
        { error: "Project must be in progress to mark as completed" },
        { status: 400 }
      )
    }

    // TODO: 添加权限检查 - 确保只有接受报价的技师可以标记完成

    // 更新项目状态为completed，然后自动进入protection状态
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'protection',
        completion_date: completionDate.toISOString(),
        protection_end_date: protectionEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectUpdateError) {
      console.error("Error updating project to protection:", projectUpdateError)
      return NextResponse.json(
        { error: "Failed to mark project as completed" },
        { status: 500 }
      )
    }

    // 更新托管记录的保护期结束时间
    const { error: escrowUpdateError } = await supabase
      .from('escrow_accounts')
      .update({
        protection_end_date: protectionEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', project.agreed_quote_id) // 假设payment_id关联到quote

    if (escrowUpdateError) {
      console.error("Error updating escrow protection period:", escrowUpdateError)
    }

    console.log("✅ Project marked as completed, protection period started")

    // 获取业主信息用于通知
    let ownerEmail = project.email
    let ownerName = undefined
    
    if (project.user_id) {
      const { data: owner } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', project.user_id)
        .single()
      
      if (owner) {
        ownerEmail = owner.email
        ownerName = owner.name
      }
    }

    // 发送邮件通知业主工作已完成，进入保护期
    if (ownerEmail) {
      try {
        const quote = Array.isArray(project.quotes) ? project.quotes[0] : project.quotes
        const tradie = Array.isArray(quote?.users) ? quote.users[0] : quote?.users
        
        await smtpEmailService.sendWorkCompletedNotification({
          to: ownerEmail,
          ownerName: ownerName,
          projectId: project.id,
          projectTitle: project.description || '',
          projectLocation: project.location || '',
          tradieName: tradie?.name || 'Unknown',
          completionDate: completionDate.toISOString(),
          protectionEndDate: protectionEndDate.toISOString(),
          protectionDays: 15,
          amount: project.agreed_price,
          completionNotes: completionNotes
        })
        console.log("✅ Work completed notification sent to owner")
      } catch (emailError) {
        console.error("❌ Failed to send work completed notification:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Work marked as completed successfully",
      projectStatus: 'protection',
      protectionEndDate: protectionEndDate.toISOString(),
      protectionDays: 15
    })

  } catch (error) {
    console.error("Error marking project as completed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
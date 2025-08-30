import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// PUT /api/projects/[id]/start-work - 技师开始工作，状态从escrowed转为in_progress
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id

    console.log("🔨 Starting work for project:", projectId)

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

    // 检查项目状态必须是escrowed
    if (project.status !== 'escrowed') {
      return NextResponse.json(
        { error: "Project must be in escrowed status to start work" },
        { status: 400 }
      )
    }

    // TODO: 添加权限检查 - 确保只有接受报价的技师可以开始工作

    // 更新项目状态为in_progress
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectUpdateError) {
      console.error("Error updating project to in_progress:", projectUpdateError)
      return NextResponse.json(
        { error: "Failed to start work" },
        { status: 500 }
      )
    }

    console.log("✅ Work started successfully")

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

    // 发送邮件通知业主工作已开始
    if (ownerEmail) {
      try {
        const quote = Array.isArray(project.quotes) ? project.quotes[0] : project.quotes
        const tradie = Array.isArray(quote?.users) ? quote.users[0] : quote?.users
        
        await smtpEmailService.sendWorkStartedNotification({
          to: ownerEmail,
          ownerName: ownerName,
          projectId: project.id,
          projectTitle: project.description || '',
          projectLocation: project.location || '',
          tradieName: tradie?.name || 'Unknown',
          tradiePhone: tradie?.phone,
          tradieEmail: tradie?.email
        })
        console.log("✅ Work started notification sent to owner")
      } catch (emailError) {
        console.error("❌ Failed to send work started notification:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Work started successfully",
      projectStatus: 'in_progress'
    })

  } catch (error) {
    console.error("Error starting work:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
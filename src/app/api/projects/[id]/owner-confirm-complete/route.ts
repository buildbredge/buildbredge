import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// PUT /api/projects/[id]/owner-confirm-complete - 业主确认完成并手动放款
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { confirmationNotes } = await request.json()
    const projectId = params.id
    const releaseDate = new Date()

    console.log("💰 Owner confirming completion and releasing funds:", projectId)

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

    // 检查项目状态必须是protection
    if (project.status !== 'protection') {
      return NextResponse.json(
        { error: "Project must be in protection status to confirm completion" },
        { status: 400 }
      )
    }

    // TODO: 添加权限检查 - 确保只有项目拥有者可以确认完成

    // 更新项目状态为released
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'released',
        release_date: releaseDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectUpdateError) {
      console.error("Error updating project to released:", projectUpdateError)
      return NextResponse.json(
        { error: "Failed to release funds" },
        { status: 500 }
      )
    }

    // 更新托管记录状态为released
    const { error: escrowUpdateError } = await supabase
      .from('escrow_accounts')
      .update({
        status: 'released',
        release_trigger: 'manual',
        release_notes: confirmationNotes || 'Owner confirmed completion',
        released_at: releaseDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', project.agreed_quote_id) // 假设payment_id关联到quote

    if (escrowUpdateError) {
      console.error("Error updating escrow to released:", escrowUpdateError)
      return NextResponse.json(
        { error: "Failed to update escrow status" },
        { status: 500 }
      )
    }

    console.log("✅ Funds released successfully by owner")

    // 计算费用分配
    const grossAmount = parseFloat(project.agreed_price)
    const platformFee = grossAmount * 0.1 // 10%
    let affiliateFee = 0
    let parentTradieId = null

    const quote = Array.isArray(project.quotes) ? project.quotes[0] : project.quotes
    const tradie = Array.isArray(quote?.users) ? quote.users[0] : quote?.users
    if (tradie?.parent_tradie_id) {
      affiliateFee = grossAmount * 0.02 // 2%
      parentTradieId = tradie.parent_tradie_id
    }

    const netAmount = grossAmount - platformFee - affiliateFee

    // 更新技师余额
    if (tradie?.id) {
      const { error: tradieBalanceError } = await supabase
        .rpc('increment_user_balance', {
          user_id: tradie.id,
          amount: netAmount
        })

      if (tradieBalanceError) {
        console.error("Error updating tradie balance:", tradieBalanceError)
      } else {
        console.log(`✅ Added NZD $${netAmount} to tradie balance`)
      }

      // 如果有挂靠费用，更新parent_tradie的余额
      if (parentTradieId && affiliateFee > 0) {
        const { error: parentBalanceError } = await supabase
          .rpc('increment_user_balance', {
            user_id: parentTradieId,
            amount: affiliateFee
          })

        if (parentBalanceError) {
          console.error("Error updating parent tradie balance:", parentBalanceError)
        } else {
          console.log(`✅ Added NZD $${affiliateFee} to parent tradie balance`)
        }
      }
    }

    // 发送邮件通知技师资金已释放
    if (tradie?.email) {
      try {
        await smtpEmailService.sendFundsReleasedNotification({
          to: tradie.email,
          projectId: project.id,
          projectTitle: project.description || '',
          grossAmount: grossAmount,
          platformFee: platformFee,
          affiliateFee: affiliateFee,
          netAmount: netAmount,
          releaseDate: releaseDate.toISOString(),
          releaseTrigger: 'Owner confirmation',
          confirmationNotes: confirmationNotes
        })
        console.log("✅ Funds released notification sent to tradie")
      } catch (emailError) {
        console.error("❌ Failed to send funds released notification:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Completion confirmed and funds released successfully",
      projectStatus: 'released',
      releaseDetails: {
        grossAmount: grossAmount,
        platformFee: platformFee,
        affiliateFee: affiliateFee,
        netAmount: netAmount,
        releaseDate: releaseDate.toISOString(),
        releaseTrigger: 'manual'
      }
    })

  } catch (error) {
    console.error("Error confirming completion:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
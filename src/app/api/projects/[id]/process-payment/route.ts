import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// POST /api/projects/[id]/process-payment - 处理全额付款并将状态更新为托管
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { paymentId, paymentAmount } = await request.json()
    const projectId = params.id

    console.log("🔍 Processing full payment for project:", projectId)

    // 获取项目详情
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        status,
        agreed_price,
        agreed_quote_id,
        description,
        location,
        email,
        user_id,
        quotes!projects_agreed_quote_id_fkey(
          id,
          tradie_id,
          price,
          users!quotes_tradie_id_fkey(
            id,
            name,
            email,
            phone,
            company,
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

    // 检查项目状态必须是agreed
    if (project.status !== 'agreed') {
      return NextResponse.json(
        { error: "Project must be in agreed status for payment processing" },
        { status: 400 }
      )
    }

    // 验证付款金额必须等于确认价格
    if (!project.agreed_price) {
      return NextResponse.json(
        { error: "No agreed price found for this project" },
        { status: 400 }
      )
    }

    if (parseFloat(paymentAmount) !== parseFloat(project.agreed_price)) {
      return NextResponse.json(
        { error: "Payment amount must match the agreed price exactly" },
        { status: 400 }
      )
    }

    console.log("💰 Payment validated:", {
      paymentAmount,
      agreedPrice: project.agreed_price,
      paymentId
    })

    // 更新付款记录状态为completed
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentId)

    if (paymentUpdateError) {
      console.error("Error updating payment:", paymentUpdateError)
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      )
    }

    // 创建托管记录
    const quote = Array.isArray(project.quotes) ? project.quotes[0] : project.quotes
    const tradie = Array.isArray(quote?.users) ? quote.users[0] : quote?.users
    const platformFee = parseFloat(project.agreed_price) * 0.1 // 10% 平台费用
    let affiliateFee = 0
    
    // 检查是否有挂靠技师
    if (tradie?.parent_tradie_id) {
      affiliateFee = parseFloat(project.agreed_price) * 0.02 // 2% 挂靠费用
    }

    const netAmount = parseFloat(project.agreed_price) - platformFee - affiliateFee

    const { error: escrowError } = await supabase
      .from('escrow_accounts')
      .insert({
        payment_id: paymentId,
        tradie_id: tradie?.id,
        parent_tradie_id: affiliateFee > 0 ? tradie?.parent_tradie_id : null,
        gross_amount: project.agreed_price,
        platform_fee: platformFee,
        affiliate_fee: affiliateFee,
        net_amount: netAmount,
        protection_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
        status: 'held'
      })

    if (escrowError) {
      console.error("Error creating escrow:", escrowError)
      return NextResponse.json(
        { error: "Failed to create escrow account" },
        { status: 500 }
      )
    }

    // 更新项目状态为escrowed（已托管）
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'escrowed',
        escrow_amount: project.agreed_price,
        escrow_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectUpdateError) {
      console.error("Error updating project to escrowed:", projectUpdateError)
      return NextResponse.json(
        { error: "Failed to update project status to escrowed" },
        { status: 500 }
      )
    }

    console.log("✅ Payment processed successfully, project escrowed")

    // 发送邮件通知技师资金已托管，可以开始工作
    if (tradie?.email) {
      try {
        await smtpEmailService.sendEscrowNotification({
          to: tradie.email,
          projectId: project.id,
          projectTitle: project.description || '',
          projectLocation: project.location || '',
          amount: project.agreed_price,
          netAmount: netAmount,
          platformFee: platformFee,
          affiliateFee: affiliateFee
        })
        console.log("✅ Escrow notification email sent to tradie")
      } catch (emailError) {
        console.error("❌ Failed to send escrow notification:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully, funds escrowed",
      escrowDetails: {
        grossAmount: project.agreed_price,
        platformFee: platformFee,
        affiliateFee: affiliateFee,
        netAmount: netAmount,
        protectionDays: 15
      }
    })

  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
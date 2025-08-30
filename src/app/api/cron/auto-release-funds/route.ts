import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// GET /api/cron/auto-release-funds - 自动放款定时任务（每天运行）
export async function GET(request: NextRequest) {
  try {
    console.log("🕐 Running auto-release funds cron job")

    const now = new Date()

    // 查找所有保护期已过期的项目
    const { data: expiredProjects, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        location,
        email,
        user_id,
        agreed_price,
        protection_end_date,
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
      .eq('status', 'protection')
      .lt('protection_end_date', now.toISOString())

    if (projectError) {
      console.error("Error fetching expired projects:", projectError)
      return NextResponse.json(
        { error: "Failed to fetch expired projects" },
        { status: 500 }
      )
    }

    if (!expiredProjects || expiredProjects.length === 0) {
      console.log("✅ No projects with expired protection period found")
      return NextResponse.json({
        success: true,
        message: "No projects to auto-release",
        processedCount: 0
      })
    }

    console.log(`📋 Found ${expiredProjects.length} projects with expired protection period`)

    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    // 处理每个过期项目
    for (const project of expiredProjects) {
      try {
        console.log(`💰 Auto-releasing funds for project ${project.id}`)

        const releaseDate = new Date()
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

        // 更新项目状态为released
        const { error: projectUpdateError } = await supabase
          .from('projects')
          .update({
            status: 'released',
            release_date: releaseDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id)

        if (projectUpdateError) {
          throw new Error(`Failed to update project status: ${projectUpdateError.message}`)
        }

        // 更新托管记录状态为released
        const { error: escrowUpdateError } = await supabase
          .from('escrow_accounts')
          .update({
            status: 'released',
            release_trigger: 'automatic',
            release_notes: 'Auto-released after protection period expired',
            released_at: releaseDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', project.agreed_quote_id)

        if (escrowUpdateError) {
          console.error(`Warning: Failed to update escrow for project ${project.id}:`, escrowUpdateError)
        }

        // 更新技师余额
        if (tradie?.id) {
          const { error: tradieBalanceError } = await supabase
            .rpc('increment_user_balance', {
              user_id: tradie.id,
              amount: netAmount
            })

          if (tradieBalanceError) {
            console.error(`Error updating tradie balance for project ${project.id}:`, tradieBalanceError)
          } else {
            console.log(`✅ Added NZD $${netAmount} to tradie ${tradie.id} balance`)
          }

          // 如果有挂靠费用，更新parent_tradie的余额
          if (parentTradieId && affiliateFee > 0) {
            const { error: parentBalanceError } = await supabase
              .rpc('increment_user_balance', {
                user_id: parentTradieId,
                amount: affiliateFee
              })

            if (parentBalanceError) {
              console.error(`Error updating parent tradie balance for project ${project.id}:`, parentBalanceError)
            } else {
              console.log(`✅ Added NZD $${affiliateFee} to parent tradie ${parentTradieId} balance`)
            }
          }
        }

        // 发送邮件通知技师资金已自动释放
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
              releaseTrigger: 'Automatic - Protection period expired',
              confirmationNotes: 'Funds automatically released after 15-day protection period'
            })
            console.log(`✅ Auto-release notification sent to tradie for project ${project.id}`)
          } catch (emailError) {
            console.error(`❌ Failed to send auto-release notification for project ${project.id}:`, emailError)
          }
        }

        // 通知业主资金已自动释放
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

        if (ownerEmail) {
          try {
            await smtpEmailService.sendOwnerFundsReleasedNotification({
              to: ownerEmail,
              ownerName: ownerName,
              projectId: project.id,
              projectTitle: project.description || '',
              tradieName: tradie?.name || 'Unknown',
              amount: grossAmount,
              releaseDate: releaseDate.toISOString(),
              releaseTrigger: 'Automatic - Protection period expired'
            })
            console.log(`✅ Auto-release notification sent to owner for project ${project.id}`)
          } catch (emailError) {
            console.error(`❌ Failed to send auto-release notification to owner for project ${project.id}:`, emailError)
          }
        }

        successCount++
        console.log(`✅ Successfully auto-released funds for project ${project.id}`)

      } catch (error) {
        console.error(`❌ Error auto-releasing funds for project ${project.id}:`, error)
        errorCount++
        errors.push({
          projectId: project.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`🎯 Auto-release completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: "Auto-release funds job completed",
      processedCount: expiredProjects.length,
      successCount: successCount,
      errorCount: errorCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error("Error in auto-release funds cron job:", error)
    return NextResponse.json(
      { error: "Internal server error in cron job" },
      { status: 500 }
    )
  }
}
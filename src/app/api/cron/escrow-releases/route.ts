import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external cron service)
// Call this daily to process automatic escrow releases after protection period expires

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron service (basic security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Processing automatic escrow releases...')
    
    // Process all escrow accounts that have passed their protection period
    const releasedEscrows = await PaymentService.processAutomaticEscrowReleases()
    
    const releaseCount = releasedEscrows.length
    const totalAmount = releasedEscrows.reduce((sum, escrow) => sum + parseFloat(escrow.amount.toString()), 0)
    
    console.log(`Processed ${releaseCount} automatic escrow releases, total amount: $${totalAmount}`)

    // Send email notifications for each released escrow
    if (releaseCount > 0) {
      try {
        const { EmailNotificationService, getEmailRecipientData } = await import('@/lib/email-service')
        
        for (const escrowRelease of releasedEscrows) {
          try {
            // Get detailed escrow information for email
            const { data: escrowDetails } = await supabase
              .from('escrow_accounts')
              .select(`
                id,
                net_amount,
                payment:payments (
                  id,
                  payer_id,
                  projects (
                    id,
                    description
                  )
                )
              `)
              .eq('id', escrowRelease.escrow_id)
              .single()

            if (escrowDetails?.payment) {
              const tradieData = await getEmailRecipientData(escrowRelease.tradie_id)
              const ownerData = await getEmailRecipientData(escrowDetails.payment.payer_id)
              
              if (tradieData && ownerData) {
                await EmailNotificationService.sendEscrowReleaseNotification({
                  escrow: escrowDetails as any,
                  payment: escrowDetails.payment as any,
                  project: {
                    title: escrowDetails.payment.projects?.description || 'Project'
                  },
                  tradie: tradieData,
                  owner: ownerData,
                  releaseMethod: 'automatic',
                  amount: parseFloat(escrowDetails.net_amount.toString())
                })
              }
            }
          } catch (emailError) {
            console.error(`Failed to send email for escrow ${escrowRelease.escrow_id}:`, emailError)
          }
        }
        
        console.log('Email notifications sent for automatic releases')
      } catch (error) {
        console.error('Failed to send automatic release notifications:', error)
      }
    }

    return NextResponse.json({
      success: true,
      processed: releaseCount,
      totalAmount,
      escrows: releasedEscrows,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error processing automatic escrow releases:', error)
    
    // TODO: Send alert to admin about cron job failure
    
    return NextResponse.json(
      { error: error.message || 'Failed to process automatic escrow releases' },
      { status: 500 }
    )
  }
}

// GET endpoint to check escrow accounts ready for release (for debugging/monitoring)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { supabase } = await import('@/lib/supabase')
    
    // Get escrow accounts that are ready for automatic release
    const { data: readyForRelease, error } = await supabase
      .from('escrow_accounts')
      .select(`
        id,
        tradie_id,
        net_amount,
        protection_end_date,
        payment:payments (
          id,
          project_id,
          projects (
            id,
            title
          )
        ),
        tradie:users!escrow_accounts_tradie_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('status', 'held')
      .lte('protection_end_date', new Date().toISOString())

    if (error) {
      throw new Error(`Failed to fetch escrow accounts: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      readyForRelease: readyForRelease || [],
      count: readyForRelease?.length || 0,
      totalAmount: (readyForRelease || []).reduce((sum, escrow) => sum + parseFloat(escrow.net_amount.toString()), 0)
    })

  } catch (error: any) {
    console.error('Error fetching escrow accounts ready for release:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch escrow accounts' },
      { status: 500 }
    )
  }
}
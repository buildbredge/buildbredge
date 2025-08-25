import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const body = await request.json()
    const { releasedBy, notes } = body
    const { escrowId } = params

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      )
    }

    if (!releasedBy) {
      return NextResponse.json(
        { error: 'Released by user ID is required' },
        { status: 400 }
      )
    }

    // Verify escrow account exists and get details
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .select(`
        id,
        status,
        payment_id,
        tradie_id,
        net_amount,
        payment:payments (
          id,
          project_id,
          payer_id,
          projects (
            id,
            user_id,
            status
          )
        )
      `)
      .eq('id', escrowId)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow account not found' },
        { status: 404 }
      )
    }

    // Verify escrow is in held status
    if (escrow.status !== 'held') {
      return NextResponse.json(
        { error: `Escrow is not in held status (current: ${escrow.status})` },
        { status: 400 }
      )
    }

    // Verify the person releasing is the project owner
    if (escrow.payment?.projects?.user_id !== releasedBy) {
      return NextResponse.json(
        { error: 'Only project owner can release escrow funds' },
        { status: 403 }
      )
    }

    // Release the escrow funds
    const success = await PaymentService.releaseEscrowFunds(
      escrowId,
      releasedBy,
      notes
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to release escrow funds' },
        { status: 500 }
      )
    }

    // Get updated escrow details
    const { data: updatedEscrow } = await supabase
      .from('escrow_accounts')
      .select(`
        id,
        status,
        released_at,
        release_trigger,
        release_notes,
        net_amount,
        tradie:users!escrow_accounts_tradie_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', escrowId)
      .single()

    // Send email notifications about fund release
    try {
      const { EmailNotificationService, getEmailRecipientData } = await import('@/lib/email-service')
      
      if (updatedEscrow && escrow.payment?.projects) {
        const tradieData = await getEmailRecipientData(escrow.tradie_id)
        const ownerData = await getEmailRecipientData(releasedBy)
        
        if (tradieData && ownerData) {
          await EmailNotificationService.sendEscrowReleaseNotification({
            escrow: updatedEscrow,
            payment: escrow.payment as any,
            project: {
              title: escrow.payment.projects.title || escrow.payment.projects.description || 'Project'
            },
            tradie: tradieData,
            owner: ownerData,
            releaseMethod: 'manual',
            amount: parseFloat(updatedEscrow.net_amount.toString())
          })
        }
      }
    } catch (emailError) {
      console.error('Failed to send release notification emails:', emailError)
      // Don't throw - email failures shouldn't break the flow
    }

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message: `Escrow funds of $${escrow.net_amount} released successfully`
    })

  } catch (error: any) {
    console.error('Error releasing escrow funds:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to release escrow funds' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const { escrowId } = params

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      )
    }

    const escrowDetails = await PaymentService.getEscrowAccountDetails(escrowId)

    if (!escrowDetails) {
      return NextResponse.json(
        { error: 'Escrow account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      escrow: escrowDetails
    })

  } catch (error: any) {
    console.error('Error fetching escrow details:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch escrow details' },
      { status: 500 }
    )
  }
}
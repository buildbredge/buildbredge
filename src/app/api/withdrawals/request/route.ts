import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tradieId, escrowAccountId, amount, bankDetails } = body

    // Validate required fields
    if (!tradieId || !escrowAccountId || !amount || !bankDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Withdrawal amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate bank details
    const requiredBankFields = ['accountName', 'accountNumber', 'bankName', 'branchCode']
    for (const field of requiredBankFields) {
      if (!bankDetails[field]) {
        return NextResponse.json(
          { error: `Bank details missing: ${field}` },
          { status: 400 }
        )
      }
    }

    // Verify escrow account exists and belongs to tradie
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .select(`
        id,
        tradie_id,
        status,
        net_amount,
        released_at,
        payment:payments (
          id,
          project_id
        )
      `)
      .eq('id', escrowAccountId)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow account not found' },
        { status: 404 }
      )
    }

    // Verify escrow belongs to the requesting tradie
    if (escrow.tradie_id !== tradieId) {
      return NextResponse.json(
        { error: 'Escrow account does not belong to this tradie' },
        { status: 403 }
      )
    }

    // Verify escrow has been released
    if (escrow.status !== 'released') {
      return NextResponse.json(
        { error: 'Escrow funds have not been released yet' },
        { status: 400 }
      )
    }

    // Verify withdrawal amount doesn't exceed available amount
    if (amount > escrow.net_amount) {
      return NextResponse.json(
        { error: `Withdrawal amount ($${amount}) exceeds available balance ($${escrow.net_amount})` },
        { status: 400 }
      )
    }

    // Check if there's already a withdrawal request for this escrow
    const { data: existingWithdrawal } = await supabase
      .from('withdrawals')
      .select('id, status')
      .eq('escrow_account_id', escrowAccountId)
      .eq('tradie_id', tradieId)
      .in('status', ['pending', 'approved', 'processing'])
      .single()

    if (existingWithdrawal) {
      return NextResponse.json(
        { error: 'A withdrawal request for this escrow account is already pending' },
        { status: 400 }
      )
    }

    // Get minimum withdrawal amount from config
    const { data: minWithdrawalConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'MIN_WITHDRAWAL_AMOUNT')
      .single()

    const minAmount = parseFloat(minWithdrawalConfig?.value || '50.00')
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is $${minAmount}` },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const withdrawal = await PaymentService.requestWithdrawal(
      tradieId,
      escrowAccountId,
      amount,
      bankDetails
    )

    // Send email notifications
    try {
      const { EmailNotificationService, getEmailRecipientData } = await import('@/lib/email-service')
      
      const tradieData = await getEmailRecipientData(tradieId)
      
      if (tradieData) {
        await EmailNotificationService.sendWithdrawalNotification({
          withdrawal,
          tradie: tradieData,
          amount: amount,
          referenceNumber: withdrawal.reference_number || 'Unknown',
          estimatedProcessingTime: '1-3 business days'
        })
      }
    } catch (emailError) {
      console.error('Failed to send withdrawal notification email:', emailError)
      // Don't throw - email failures shouldn't break the flow
    }

    return NextResponse.json({
      success: true,
      withdrawal,
      message: 'Withdrawal request submitted successfully'
    })

  } catch (error: any) {
    console.error('Error creating withdrawal request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create withdrawal request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tradieId = searchParams.get('tradieId')

    if (!tradieId) {
      return NextResponse.json(
        { error: 'Tradie ID is required' },
        { status: 400 }
      )
    }

    // Get all withdrawal requests for the tradie
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select(`
        id,
        requested_amount,
        processing_fee,
        final_amount,
        status,
        reference_number,
        requested_at,
        processed_at,
        completed_at,
        escrow_account:escrow_accounts (
          id,
          gross_amount,
          net_amount,
          payment:payments (
            id,
            project_id,
            projects (
              id,
              title,
              description
            )
          )
        )
      `)
      .eq('tradie_id', tradieId)
      .order('requested_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch withdrawal requests: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals || []
    })

  } catch (error: any) {
    console.error('Error fetching withdrawal requests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
}
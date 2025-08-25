import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, quoteId, payerId, tradieId, amount, currency = 'NZD' } = body

    // Validate required fields
    if (!projectId || !quoteId || !payerId || !tradieId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify quote exists and belongs to the project
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        id,
        price,
        status,
        tradie_id,
        project:projects (
          id,
          user_id,
          status,
          accepted_quote_id
        )
      `)
      .eq('id', quoteId)
      .eq('project_id', projectId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Verify the quote is accepted and belongs to the correct tradie
    if (quote.status !== 'accepted' || quote.tradie_id !== tradieId) {
      return NextResponse.json(
        { error: 'Quote is not accepted or tradie mismatch' },
        { status: 400 }
      )
    }

    // Verify the payer is the project owner
    const project = Array.isArray(quote.project) ? quote.project[0] : quote.project
    if (project?.user_id !== payerId) {
      return NextResponse.json(
        { error: 'Only project owner can make payment' },
        { status: 403 }
      )
    }

    // Verify project is in the correct status for payment
    if (!['agreed', 'negotiating'].includes(project?.status || '')) {
      return NextResponse.json(
        { error: 'Project is not ready for payment' },
        { status: 400 }
      )
    }

    // Verify amount matches quote price (with small tolerance for rounding)
    const priceDifference = Math.abs(amount - quote.price)
    if (priceDifference > 0.01) {
      return NextResponse.json(
        { error: 'Payment amount does not match quote price' },
        { status: 400 }
      )
    }

    // Create payment intent
    const result = await PaymentService.createPayment(
      projectId,
      quoteId,
      payerId,
      tradieId,
      amount,
      currency
    )

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      clientSecret: result.clientSecret,
      fees: result.fees
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
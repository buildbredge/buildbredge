import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { StripePaymentProvider } from '@/lib/payment/providers/stripe/StripePaymentProvider'
import { supabase } from '@/lib/supabase'

// Register Stripe provider
PaymentProviderFactory.registerProvider('stripe', () => new StripePaymentProvider())

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
        project:projects!quotes_project_id_fkey (
          id,
          user_id,
          status,
          agreed_quote_id
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

    // Create Stripe payment using provider
    const stripeProvider = PaymentProviderFactory.createProvider('stripe')
    const result = await stripeProvider.createPayment({
      projectId,
      quoteId,
      payerId,
      tradieId,
      amount,
      currency,
    })

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      clientSecret: result.clientSecret,
      fees: result.fees,
      provider: result.provider,
      mode: result.mode
    })

  } catch (error: any) {
    console.error('Error creating Stripe payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
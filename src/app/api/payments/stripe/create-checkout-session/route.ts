import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { StripePaymentProvider } from '@/lib/payment/providers/stripe/StripePaymentProvider'
import { createCheckoutSession } from '@/lib/payment/providers/stripe/stripe-utils'
import type { StripePaymentIntentMetadata } from '@/lib/payment/providers/stripe/stripe-types'

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
          description,
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

    // Get tradie information for the checkout
    const { data: tradie, error: tradieError } = await supabase
      .from('users')
      .select('name, company, email')
      .eq('id', tradieId)
      .single()

    if (tradieError || !tradie) {
      return NextResponse.json(
        { error: 'Tradie not found' },
        { status: 404 }
      )
    }

    // Use Stripe provider to calculate fees and create payment
    const stripeProvider = PaymentProviderFactory.createProvider('stripe')
    const result = await stripeProvider.createPayment({
      projectId,
      quoteId,
      payerId,
      tradieId,
      amount,
      currency,
    })

    // Create checkout session metadata
    const metadata: StripePaymentIntentMetadata = {
      projectId,
      quoteId,
      tradieId,
      payerId,
      platformFee: result.fees.platformFee.toString(),
      affiliateFee: result.fees.affiliateFee.toString(),
      taxAmount: result.fees.taxAmount.toString(),
      netAmount: result.fees.netAmount.toString(),
      parentTradieId: result.fees.parentTradieId || null
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createCheckoutSession(
      amount,
      currency,
      metadata,
      `${baseUrl}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/payment/enhanced`
    )

    // Update payment record with session ID
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        stripe_checkout_session_id: session.id,
        payment_method: 'stripe_checkout'
      })
      .eq('id', result.paymentId)

    if (updateError) {
      console.warn('Failed to update payment with Stripe session:', updateError)
    }

    return NextResponse.json({
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
      paymentId: result.paymentId,
      fees: result.fees,
      provider: result.provider,
      mode: 'redirect'
    })

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
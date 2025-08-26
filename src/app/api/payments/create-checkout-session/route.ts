import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

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

    // Calculate fees
    const { data: fees, error: feesError } = await supabase
      .rpc('calculate_payment_fees', {
        p_amount: amount,
        p_tradie_id: tradieId,
        p_currency: currency
      })
      .single()

    if (feesError) {
      return NextResponse.json(
        { error: 'Failed to calculate fees' },
        { status: 500 }
      )
    }

    // Create payment record in database first
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        project_id: projectId,
        quote_id: quoteId,
        payer_id: payerId,
        tradie_id: tradieId,
        amount,
        platform_fee: parseFloat((fees as any).platform_fee),
        affiliate_fee: parseFloat((fees as any).affiliate_fee),
        tax_amount: parseFloat((fees as any).tax_amount),
        net_amount: parseFloat((fees as any).net_amount),
        currency,
        status: 'pending',
        payment_method: 'stripe_checkout'
      })
      .select()
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: `Failed to create payment record: ${paymentError?.message}` },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session with embedded UI
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      currency: currency.toLowerCase(),
      customer_email: project?.user_id === payerId ? undefined : (tradie.email || undefined),
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${project?.description || 'Project Payment'}`,
              description: `Payment to ${tradie.name || tradie.company || 'Tradie'}`,
              metadata: {
                project_id: projectId,
                quote_id: quoteId,
                tradie_id: tradieId
              }
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_id: payment.id,
        project_id: projectId,
        quote_id: quoteId,
        tradie_id: tradieId,
        payer_id: payerId,
        platform_fee: (fees as any).platform_fee.toString(),
        affiliate_fee: (fees as any).affiliate_fee.toString(),
        tax_amount: (fees as any).tax_amount.toString(),
        net_amount: (fees as any).net_amount.toString(),
        parent_tradie_id: (fees as any).parent_tradie_id || ''
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      payment_intent_data: {
        setup_future_usage: 'off_session', // Save payment method for future use
        metadata: {
          payment_id: payment.id,
          project_id: projectId,
          quote_id: quoteId,
          tradie_id: tradieId,
          payer_id: payerId
        }
      }
    })

    // Update payment record with Stripe session ID
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        stripe_checkout_session_id: session.id,
        status: 'processing'
      })
      .eq('id', payment.id)

    if (updateError) {
      console.warn('Failed to update payment with Stripe session:', updateError)
    }

    return NextResponse.json({
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
      paymentId: payment.id,
      fees: {
        platformFee: parseFloat((fees as any).platform_fee),
        affiliateFee: parseFloat((fees as any).affiliate_fee),
        taxAmount: parseFloat((fees as any).tax_amount),
        netAmount: parseFloat((fees as any).net_amount),
        parentTradieId: (fees as any).parent_tradie_id
      }
    })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
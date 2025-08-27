import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/payment/providers/stripe/stripe-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    })

    return NextResponse.json({
      success: true,
      session: session
    })

  } catch (error: any) {
    console.error('Error retrieving Stripe session status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session status' },
      { status: 500 }
    )
  }
}
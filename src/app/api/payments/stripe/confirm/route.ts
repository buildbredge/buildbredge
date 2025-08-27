import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { StripePaymentProvider } from '@/lib/payment/providers/stripe/StripePaymentProvider'

// Register Stripe provider
PaymentProviderFactory.registerProvider('stripe', () => new StripePaymentProvider())

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Confirm payment using Stripe provider
    const stripeProvider = PaymentProviderFactory.createProvider('stripe')
    const result = await stripeProvider.confirmPayment(paymentIntentId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.errorMessage || 'Payment confirmation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Payment confirmed successfully'
    })

  } catch (error: any) {
    console.error('Error confirming Stripe payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
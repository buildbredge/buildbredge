import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

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

    // Confirm payment and create escrow
    const escrowAccount = await PaymentService.confirmPayment(paymentIntentId)

    return NextResponse.json({
      success: true,
      escrowAccount,
      message: 'Payment confirmed and funds escrowed successfully'
    })

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
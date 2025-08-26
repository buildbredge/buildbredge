import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Stripe keys are configured
    const publishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = !!process.env.STRIPE_SECRET_KEY
    const webhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

    return NextResponse.json({
      publishableKey,
      secretKey,
      webhookSecret,
      configured: publishableKey && secretKey,
      testMode: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('pk_test_') || false
    })
  } catch (error) {
    return NextResponse.json({
      publishableKey: false,
      secretKey: false,
      webhookSecret: false,
      configured: false,
      testMode: false,
      error: 'Failed to check configuration'
    })
  }
}
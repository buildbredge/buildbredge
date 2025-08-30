import type Stripe from 'stripe'
import { stripe, formatAmountForStripe } from './stripe-client'
import type { StripePaymentIntentMetadata, StripeRefundRequest } from './stripe-types'

// Create payment intent with fee breakdown
export const createPaymentIntent = async (
  amount: number,
  currency: string,
  metadata: StripePaymentIntentMetadata
): Promise<Stripe.PaymentIntent> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount, currency),
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
    capture_method: 'automatic',
  })
  
  return paymentIntent
}

// Confirm payment intent
export const confirmPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  
  if (paymentIntent.status !== 'succeeded') {
    throw new Error(`Payment intent status is ${paymentIntent.status}`)
  }
  
  return paymentIntent
}

// Handle Stripe webhooks
export const constructWebhookEvent = (
  body: string | Buffer,
  signature: string
): Stripe.Event => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  try {
    return stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }
}

// Create Stripe customer
export const createStripeCustomer = async (
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })
  
  return customer
}

// Refund payment
export const refundPayment = async (
  request: StripeRefundRequest
): Promise<Stripe.Refund> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const paymentIntent = await stripe.paymentIntents.retrieve(request.paymentIntentId)
  
  if (!(paymentIntent as any).charges?.data[0]) {
    throw new Error('No charge found for this payment intent')
  }
  
  const refund = await stripe.refunds.create({
    charge: (paymentIntent as any).charges.data[0].id,
    amount: request.amount ? formatAmountForStripe(request.amount, paymentIntent.currency) : undefined,
    reason: request.reason,
  })
  
  return refund
}

// Get payment intent details
export const getPaymentIntentDetails = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  return await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges', 'customer']
  })
}

// Create checkout session
export const createCheckoutSession = async (
  amount: number,
  currency: string,
  metadata: StripePaymentIntentMetadata,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> => {
  if (!stripe) {
    throw new Error('Stripe is not available on client side')
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'BuildBridge Payment',
            description: `Payment for project ${metadata.projectId}`,
          },
          unit_amount: formatAmountForStripe(amount, currency),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...metadata,
      payment_id: metadata.projectId, // Add for webhook handling
    },
  })

  return session
}
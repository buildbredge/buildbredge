import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Payment amount helpers
export const formatAmountForStripe = (amount: number, currency: string): number => {
  // Stripe expects amounts in smallest currency unit (cents for most currencies)
  const currencyMultipliers: Record<string, number> = {
    'NZD': 100,
    'USD': 100,
    'AUD': 100,
    'CAD': 100,
    'EUR': 100,
    'GBP': 100,
  }
  
  return Math.round(amount * (currencyMultipliers[currency] || 100))
}

export const formatAmountFromStripe = (amount: number, currency: string): number => {
  const currencyMultipliers: Record<string, number> = {
    'NZD': 100,
    'USD': 100,
    'AUD': 100,
    'CAD': 100,
    'EUR': 100,
    'GBP': 100,
  }
  
  return amount / (currencyMultipliers[currency] || 100)
}

// Fee calculation types
export interface FeeBreakdown {
  platformFee: number
  affiliateFee: number
  taxAmount: number
  netAmount: number
  parentTradieId?: string
}

// Stripe payment intent metadata
export interface PaymentIntentMetadata {
  projectId: string
  quoteId: string
  tradieId: string
  payerId: string
  platformFee: string
  affiliateFee: string
  taxAmount: string
  netAmount: string
  parentTradieId?: string
}

// Create payment intent with fee breakdown
export const createPaymentIntent = async (
  amount: number,
  currency: string,
  metadata: PaymentIntentMetadata
): Promise<Stripe.PaymentIntent> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount, currency),
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
    capture_method: 'automatic', // Capture immediately upon confirmation
  })
  
  return paymentIntent
}

// Confirm payment and handle webhooks
export const confirmPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
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
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })
  
  return customer
}

// Refund payment
export const refundPayment = async (
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  
  if (!paymentIntent.charges.data[0]) {
    throw new Error('No charge found for this payment intent')
  }
  
  const refund = await stripe.refunds.create({
    charge: paymentIntent.charges.data[0].id,
    amount: amount ? formatAmountForStripe(amount, paymentIntent.currency) : undefined,
    reason,
  })
  
  return refund
}

// Get payment intent details
export const getPaymentIntentDetails = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges', 'customer']
  })
}

// Stripe webhook event types we care about
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  CUSTOMER_UPDATED: 'customer.updated',
} as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS]
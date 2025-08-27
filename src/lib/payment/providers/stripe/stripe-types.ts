import type Stripe from 'stripe'

// Stripe payment intent metadata
export interface StripePaymentIntentMetadata {
  projectId: string
  quoteId: string
  tradieId: string
  payerId: string
  platformFee: string
  affiliateFee: string
  taxAmount: string
  netAmount: string
  parentTradieId: string | null
  [key: string]: string | number | null
}

// Stripe webhook event types we care about
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  CUSTOMER_UPDATED: 'customer.updated',
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
} as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS]

export interface StripePaymentResult {
  success: boolean
  paymentIntentId: string
  chargeId?: string
  customerId?: string
  status: Stripe.PaymentIntent.Status
  failureReason?: string
}

export interface StripeRefundRequest {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}
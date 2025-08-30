import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance - only available on server
export const stripe = typeof window === 'undefined' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil',
    })
  : null

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>
export const getStripe = (): Promise<StripeJS | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Payment amount helpers
export const formatAmountForStripe = (amount: number, currency: string): number => {
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

// Validate Stripe configuration
export const validateStripeConfig = (): boolean => {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  )
}
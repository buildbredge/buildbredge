"use client"

import { useState, useCallback } from 'react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface EmbeddedCheckoutComponentProps {
  projectId: string
  quoteId: string
  payerId: string
  tradieId: string
  amount: number
  currency?: string
}

export default function EmbeddedCheckoutComponent({
  projectId,
  quoteId,
  payerId,
  tradieId,
  amount,
  currency = 'NZD'
}: EmbeddedCheckoutComponentProps) {
  const [loading, setLoading] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          quoteId,
          payerId,
          tradieId,
          amount,
          currency
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      return data.clientSecret
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [projectId, quoteId, payerId, tradieId, amount, currency])

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Stripe publishable key is not configured. Please check your environment variables.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Initializing secure payment form...</p>
            </div>
          </div>
        )}
        <EmbeddedCheckout />
      </div>
    </EmbeddedCheckoutProvider>
  )
}
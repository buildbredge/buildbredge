"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { Stripe as StripeJS } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Lock
} from "lucide-react"
import Link from "next/link"
import { getStripe } from "@/lib/stripe"
import { PaymentBreakdown } from "@/components/PaymentBreakdown"
import { useAuth } from "@/contexts/AuthContext"
import type { FeeBreakdown } from "@/lib/stripe"

interface PaymentData {
  projectId: string
  quoteId: string
  tradieId: string
  amount: number
  projectInfo: {
    title: string
    description: string
  }
  tradieInfo: {
    name: string
    company?: string
    isAffiliate: boolean
    parentTradieName?: string
  }
}

// Stripe Payment Form Component
function PaymentForm({ 
  paymentData, 
  fees, 
  clientSecret, 
  onSuccess, 
  onError 
}: {
  paymentData: PaymentData
  fees: FeeBreakdown
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        }
      })

      if (error) {
        onError(error.message || 'Payment failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment in our backend
        const confirmResponse = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        })

        const confirmData = await confirmResponse.json()

        if (confirmResponse.ok) {
          onSuccess()
        } else {
          onError(confirmData.error || 'Payment confirmation failed')
        }
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Enter your payment details to complete the transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Pay {new Intl.NumberFormat('en-NZ', {
                style: 'currency',
                currency: 'NZD'
              }).format(paymentData.amount)}
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Secured by Stripe • Your payment information is encrypted</span>
        </div>
      </div>
    </form>
  )
}

// Success Component
function PaymentSuccess({ paymentData }: { paymentData: PaymentData }) {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed and funds are now securely held in escrow.
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold text-green-800 mb-2">What happens next:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Funds are securely held in escrow</li>
            <li>• {paymentData.tradieInfo.name} has been notified to begin work</li>
            <li>• You'll receive email updates on project progress</li>
            <li>• Funds will be released after project completion and 15-day protection period</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/projects/${paymentData.projectId}`}>
              View Project
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EnhancedPaymentPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1) // 1: setup, 2: payment, 3: success
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [fees, setFees] = useState<FeeBreakdown | null>(null)
  const [clientSecret, setClientSecret] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [stripePromise] = useState<Promise<StripeJS | null>>(() => getStripe())

  // Get payment parameters from URL
  const projectId = searchParams.get('projectId')
  const quoteId = searchParams.get('quoteId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    if (!user || !projectId || !quoteId || !amount) {
      setError("Missing required payment parameters")
      setLoading(false)
      return
    }

    initializePayment()
  }, [user, projectId, quoteId, amount])

  const initializePayment = async () => {
    try {
      setLoading(true)
      setError("")

      // Get quote details first
      const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
      const quoteData = await quoteResponse.json()

      if (!quoteResponse.ok) {
        throw new Error(quoteData.error || 'Failed to fetch quote details')
      }

      const quote = quoteData.quote

      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          quoteId,
          payerId: user?.id,
          tradieId: quote.tradie_id,
          amount: parseFloat(amount!)
        })
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentResult.error || 'Failed to create payment')
      }

      // Set up payment data
      setPaymentData({
        projectId: projectId!,
        quoteId: quoteId!,
        tradieId: quote.tradie_id,
        amount: parseFloat(amount!),
        projectInfo: {
          title: quote.project?.title || quote.project?.description || 'Project',
          description: quote.description
        },
        tradieInfo: {
          name: quote.tradie?.name || 'Unknown Tradie',
          company: quote.tradie?.company,
          isAffiliate: !!quote.tradie?.parent_tradie_id,
          parentTradieName: quote.tradie?.parent_tradie?.name
        }
      })

      setFees(paymentResult.fees)
      setClientSecret(paymentResult.clientSecret)
      setCurrentStep(2) // Move to payment step

    } catch (err: any) {
      console.error('Error initializing payment:', err)
      setError(err.message || 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setCurrentStep(3) // Move to success step
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span>Initializing payment...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-600 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={initializePayment} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="text-2xl font-bold text-green-600">BuildBridge</Link>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= num
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > num ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentStep === 1 && "Initializing Payment"}
              {currentStep === 2 && "Complete Payment"}
              {currentStep === 3 && "Payment Successful"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 2 && paymentData && fees && clientSecret && (
              <Elements stripe={stripePromise} options={{
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}>
                <PaymentForm
                  paymentData={paymentData}
                  fees={fees}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )}

            {currentStep === 3 && paymentData && (
              <PaymentSuccess paymentData={paymentData} />
            )}
          </div>

          {/* Payment Summary Sidebar */}
          <div>
            {paymentData && fees && (
              <PaymentBreakdown
                amount={paymentData.amount}
                fees={fees}
                tradieInfo={paymentData.tradieInfo}
                projectInfo={paymentData.projectInfo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
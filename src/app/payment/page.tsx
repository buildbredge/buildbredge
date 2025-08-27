'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Home,
  Shield,
  Check,
  AlertCircle,
  Lock,
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { getStripe } from '@/lib/payment/providers/stripe/stripe-client'
import { PaymentBreakdown } from '@/components/PaymentBreakdown'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import { useAuth } from '@/contexts/AuthContext'
import type { PaymentProvider } from '@/lib/payment/interfaces/types'

interface PaymentPageProps {
  projectId?: string
  quoteId?: string
  tradieId?: string
  amount?: number
}

interface PaymentStep {
  step: number
  title: string
  description: string
}

const paymentSteps: PaymentStep[] = [
  { step: 1, title: 'Select Payment', description: 'Choose payment method' },
  { step: 2, title: 'Payment Details', description: 'Enter payment information' },
  { step: 3, title: 'Confirm', description: 'Review and confirm' },
  { step: 4, title: 'Complete', description: 'Payment complete' }
]

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  // Get payment details from URL params
  const projectId = searchParams.get('projectId')
  const quoteId = searchParams.get('quoteId')
  const tradieId = searchParams.get('tradieId')
  const amount = parseFloat(searchParams.get('amount') || '0')

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | undefined>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate required parameters
  useEffect(() => {
    if (!projectId || !quoteId || !tradieId || !amount || amount <= 0) {
      setError('Missing or invalid payment parameters. Please return to your project and try again.')
    }
  }, [projectId, quoteId, tradieId, amount])

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider)
    setCurrentStep(2)
  }

  const handleStripePayment = async () => {
    if (!projectId || !quoteId || !tradieId || !user?.id) {
      setError('Missing required payment information')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent using new Stripe API
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          quoteId,
          payerId: user.id,
          tradieId,
          amount,
          currency: 'NZD',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Initialize Stripe and confirm payment
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }

      const { error: stripeError } = await stripe.confirmPayment({
        elements: null as any, // This would be replaced with actual Elements in a real implementation
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/return`,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      setPaymentResult(data)
      setCurrentStep(4)

    } catch (error: any) {
      console.error('Stripe payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePoliPayment = async () => {
    if (!projectId || !quoteId || !tradieId || !user?.id) {
      setError('Missing required payment information')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create POLi payment using new API
      const response = await fetch('/api/poli/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          quoteId,
          payerId: user.id,
          tradieId,
          amount,
          currency: 'NZD',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create POLi payment')
      }

      // Redirect to POLi bank login
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error('No redirect URL received from POLi')
      }

    } catch (error: any) {
      console.error('POLi payment error:', error)
      setError(error.message || 'POLi payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (selectedProvider === 'stripe') {
      await handleStripePayment()
    } else if (selectedProvider === 'poli') {
      await handlePoliPayment()
    }
  }

  const getUserRegion = () => {
    // This could be enhanced to detect user's actual region
    return 'NZ' // Default to New Zealand
  }

  if (error && !projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Payment Request</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
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
            {paymentSteps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.step
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.step ? <Check className="w-5 h-5" /> : step.step}
                </div>
                {index < paymentSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.step ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {paymentSteps.find(step => step.step === currentStep)?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                  <CardDescription>
                    Choose your preferred payment method to complete the transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentMethodSelector
                    onSelect={handleProviderSelect}
                    selectedProvider={selectedProvider}
                    userRegion={getUserRegion()}
                    currency="NZD"
                    disabled={isProcessing}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && selectedProvider && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedProvider === 'stripe' ? 'Credit Card Payment' : 'POLi Bank Transfer'}
                  </CardTitle>
                  <CardDescription>
                    {selectedProvider === 'stripe' 
                      ? 'Enter your card details to complete the payment'
                      : 'You will be redirected to your bank to complete the payment'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedProvider === 'stripe' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Secure Card Payment</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Your payment will be processed securely through Stripe. 
                        Card details are encrypted and never stored on our servers.
                      </p>
                      <div className="text-xs text-blue-600">
                        🔒 PCI DSS compliant • 256-bit SSL encryption
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'poli' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">POLi Bank Transfer</h3>
                      <p className="text-sm text-green-700 mb-3">
                        You will be securely redirected to your bank's online banking platform 
                        to complete the payment. No card details required.
                      </p>
                      <div className="text-xs text-green-600 space-y-1">
                        <div>✓ Direct from your bank account</div>
                        <div>✓ No card fees</div>
                        <div>✓ Supports major NZ banks</div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : selectedProvider === 'poli' ? (
                        <>
                          Continue to Bank
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        `Pay $${amount.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your payment has been processed and funds are now held securely in escrow.
                  </p>
                  
                  {paymentResult && (
                    <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Payment Amount:</span>
                          <span className="font-medium">${amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-medium">
                            {selectedProvider === 'stripe' ? 'Credit Card' : 'POLi Bank Transfer'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment ID:</span>
                          <span className="font-mono text-xs">{paymentResult.paymentId}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href={`/my-projects?project=${projectId}`}>View Project</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PaymentBreakdown
                  amount={amount}
                  tradieId={tradieId || ''}
                  currency="NZD"
                  showDetails={true}
                />

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Escrow Protection</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your funds are held securely until project completion and your approval
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Security Features</span>
                  </div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• SSL encrypted transmission</li>
                    <li>• PCI DSS security compliance</li>
                    <li>• Third-party fund escrow</li>
                    <li>• Dispute resolution protection</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
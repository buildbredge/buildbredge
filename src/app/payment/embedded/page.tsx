"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Home,
  Shield,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Info
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import EmbeddedCheckoutComponent from "@/components/EmbeddedCheckout"

interface PaymentDetails {
  projectId: string
  projectTitle: string
  projectDescription: string
  tradieId: string
  tradieName: string
  tradieCompany: string
  quoteId: string
  amount: number
  currency: string
  paymentType: "deposit" | "milestone" | "final" | "full"
  description: string
}

export default function EmbeddedPaymentPage() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const projectId = searchParams?.get('project_id')
  const quoteId = searchParams?.get('quote_id')

  useEffect(() => {
    if (!projectId || !quoteId) {
      setError('Missing required payment parameters')
      setLoading(false)
      return
    }

    if (!user) {
      setError('Please log in to continue with payment')
      setLoading(false)
      return
    }

    fetchPaymentDetails()
  }, [projectId, quoteId, user])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}?include_project=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment details')
      }

      const data = await response.json()
      const quote = data.quote

      // Verify user is the project owner
      if (quote.project?.user_id !== user?.id) {
        throw new Error('You are not authorized to make payment for this project')
      }

      // Verify quote is accepted
      if (quote.status !== 'accepted') {
        throw new Error('This quote has not been accepted and cannot be paid')
      }

      setPaymentDetails({
        projectId: quote.project_id,
        projectTitle: quote.project?.title || 'Project Payment',
        projectDescription: quote.project?.description || '',
        tradieId: quote.tradie_id,
        tradieName: quote.tradie?.name || 'Unknown',
        tradieCompany: quote.tradie?.company || '',
        quoteId: quote.id,
        amount: quote.price,
        currency: 'NZD',
        paymentType: 'full',
        description: 'Full project payment as per accepted quote'
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  }

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case "deposit":
        return "Project Deposit"
      case "milestone":
        return "Milestone Payment"
      case "final":
        return "Final Payment"
      case "full":
        return "Full Payment"
      default:
        return "Project Payment"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading payment details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                Dashboard
              </Link>
            </Button>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
                <p className="text-gray-600 mb-6">{error || 'Unable to load payment details'}</p>
                <Button asChild>
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
              Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
            <p className="text-gray-600">Complete your payment securely with Stripe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Secure Payment Form
                  </CardTitle>
                  <CardDescription>
                    Your payment information is processed securely by Stripe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is a secure embedded payment form. Your card details are encrypted 
                      and never stored on our servers.
                    </AlertDescription>
                  </Alert>

                  <EmbeddedCheckoutComponent
                    projectId={paymentDetails.projectId}
                    quoteId={paymentDetails.quoteId}
                    payerId={user!.id}
                    tradieId={paymentDetails.tradieId}
                    amount={paymentDetails.amount}
                    currency={paymentDetails.currency}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">{paymentDetails.projectTitle}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Tradie: {paymentDetails.tradieName}
                        {paymentDetails.tradieCompany && ` (${paymentDetails.tradieCompany})`}
                      </p>
                      {paymentDetails.projectDescription && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {paymentDetails.projectDescription}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{getPaymentTypeText(paymentDetails.paymentType)}</span>
                        <Badge variant="secondary">{paymentDetails.paymentType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{paymentDetails.description}</p>

                      {/* Fee Breakdown - Simple display for now */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Project Amount:</span>
                          <span className="font-medium">{formatAmount(paymentDetails.amount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Processing Fee:</span>
                          <span>Included</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium text-lg">
                          <span>Total Payment:</span>
                          <span className="text-green-600">{formatAmount(paymentDetails.amount)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Platform fees are deducted from tradie's payment, not yours.
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Shield className="w-4 h-4" />
                        <span>Escrow Protection</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Funds are held securely until project completion
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Information */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-sm mb-3">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Security Guarantee</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• 256-bit SSL encryption</li>
                      <li>• PCI DSS Level 1 compliant</li>
                      <li>• Secure escrow protection</li>
                      <li>• Fraud protection included</li>
                      <li>• 15-day money-back guarantee</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2">Need Help?</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Our support team is available 24/7 to help with payment issues.
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="/support">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
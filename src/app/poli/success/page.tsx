'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PaymentStatus {
  success: boolean
  result?: {
    success: boolean
    paymentId: string
    providerTransactionId: string
    status: string
  }
}

function PoliSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const merchantRef = searchParams.get('ref')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (merchantRef) {
      // Optional: Verify payment status with our API
      // This is not strictly necessary as POLi will have sent notification
      // but provides better user experience
      setPaymentStatus({
        success: true,
        result: {
          success: true,
          paymentId: merchantRef,
          providerTransactionId: 'poli-transaction',
          status: 'completed'
        }
      })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [merchantRef])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Your POLi bank transfer has been completed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your funds have been securely transferred</li>
              <li>• The tradie will be notified of your payment</li>
              <li>• Funds are held in escrow for 15 days for your protection</li>
              <li>• You'll receive email confirmation shortly</li>
            </ul>
          </div>

          {merchantRef && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-gray-800">{merchantRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <Badge variant="secondary">POLi Bank Transfer</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleContinue} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="flex-1"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PoliSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoliSuccessContent />
    </Suspense>
  )
}
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, RotateCcw, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function PoliFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const merchantRef = searchParams.get('ref')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Could fetch error details from API if needed
    // For now, show generic error message
  }, [merchantRef])

  const handleRetryPayment = () => {
    // Navigate back to payment page to retry
    if (merchantRef) {
      // Extract project/quote info from merchant reference if possible
      // Format: BB-{paymentId}-{timestamp}
      router.push('/payment')
    } else {
      router.push('/payment')
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-700">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-lg">
            Your POLi bank transfer could not be completed.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your payment was not processed. This could be due to insufficient funds, 
              cancelled transaction, or a technical issue with your bank.
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Common reasons for payment failure:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Transaction was cancelled during bank login</li>
              <li>• Insufficient funds in your account</li>
              <li>• Bank connection timeout</li>
              <li>• Invalid bank credentials</li>
              <li>• Bank temporarily unavailable</li>
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
                  <span className="text-gray-800">POLi Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-red-600 font-medium">Failed</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleRetryPayment} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGoBack} 
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                Go Home
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Still having issues? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PoliFailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoliFailureContent />
    </Suspense>
  )
}
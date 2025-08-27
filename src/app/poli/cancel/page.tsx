'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MinusCircle, RotateCcw, ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function PoliCancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const merchantRef = searchParams.get('ref')

  const handleRetryPayment = () => {
    // Navigate back to payment page to retry
    if (merchantRef) {
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
            <MinusCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-orange-700">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-lg">
            Your POLi bank transfer was cancelled.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No payment was processed. You can try again whenever you're ready.
            </AlertDescription>
          </Alert>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">What happened?</h3>
            <p className="text-sm text-orange-700">
              You cancelled the payment during the bank authentication process. 
              This is completely normal and no charges were made to your account.
            </p>
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
                  <span className="text-orange-600 font-medium">Cancelled</span>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Need help with payment?</h4>
            <p className="text-sm text-blue-700 mb-2">
              If you're having trouble with POLi payments, you can:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Make sure you have sufficient funds</li>
              <li>• Check your online banking credentials</li>
              <li>• Try using a different browser</li>
              <li>• Contact your bank if issues persist</li>
            </ul>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Need assistance? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PoliCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoliCancelContent />
    </Suspense>
  )
}
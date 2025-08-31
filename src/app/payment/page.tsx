'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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


interface PaymentStep {
  step: number
  title: string
  description: string
}

const paymentSteps: PaymentStep[] = [
  { step: 1, title: '选择支付', description: '选择支付方式' },
  { step: 2, title: '支付详情', description: '输入支付信息' },
  { step: 3, title: '确认', description: '查看并确认' },
  { step: 4, title: '完成', description: '支付完成' }
]

function PaymentContent() {
  const searchParams = useSearchParams()
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
      setError('缺少或无效的支付参数。请返回到您的项目重试。')
    }
  }, [projectId, quoteId, tradieId, amount])

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider)
    setCurrentStep(2)
  }

  const handleStripePayment = async () => {
    if (!projectId || !quoteId || !tradieId || !user?.id) {
      setError('缺少必要的支付信息')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create checkout session using Stripe Checkout API
      const response = await fetch('/api/payments/stripe/create-checkout-session', {
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
        throw new Error(data.error || '创建支付失败')
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('加载支付系统失败')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (stripeError) {
        throw new Error(stripeError.message || '跳转到支付页面失败')
      }

      // User will be redirected, so we don't reach this point normally
      // But if we do, it means something went wrong
      throw new Error('支付重定向失败')

    } catch (error: any) {
      console.error('Stripe payment error:', error)
      setError(error.message || '支付失败，请重试。')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePoliPayment = async () => {
    if (!projectId || !quoteId || !tradieId || !user?.id) {
      setError('缺少必要的支付信息')
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
        throw new Error(data.error || '创建POLi支付失败')
      }

      // Redirect to POLi bank login
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error('未收到POLi重定向链接')
      }

    } catch (error: any) {
      console.error('POLi payment error:', error)
      setError(error.message || 'POLi支付失败，请重试。')
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
            <h2 className="text-xl font-semibold mb-2">支付请求无效</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard">返回控制台</Link>
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
              返回控制台
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
                  <CardTitle>选择支付方式</CardTitle>
                  <CardDescription>
                    选择您偏好的支付方式来完成交易
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
                    {selectedProvider === 'stripe' ? '信用卡支付' : 'POLi银行转账'}
                  </CardTitle>
                  <CardDescription>
                    {selectedProvider === 'stripe' 
                      ? '输入您的银行卡信息以完成支付'
                      : '您将被重定向到您的银行完成支付'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedProvider === 'stripe' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">安全银行卡支付</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        您的支付将通过Stripe安全处理。
                        银行卡信息已加密，永远不会存储在我们的服务器上。
                      </p>
                      <div className="text-xs text-blue-600">
                        🔒 PCI DSS合规 • 256位SSL加密
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'poli' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">POLi银行转账</h3>
                      <p className="text-sm text-green-700 mb-3">
                        您将被安全重定向到您银行的网上银行平台
                        完成支付。无需银行卡信息。
                      </p>
                      <div className="text-xs text-green-600 space-y-1">
                        <div>✓ 直接从您的银行账户扣款</div>
                        <div>✓ 无银行卡手续费</div>
                        <div>✓ 支持新西兰主要银行</div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      disabled={isProcessing}
                    >
                      返回
                    </Button>
                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : selectedProvider === 'poli' ? (
                        <>
                          前往银行支付
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        `支付 $${amount.toLocaleString()}`
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
                  <p className="text-gray-600 mb-6">
                    您的支付已处理完成，资金现已安全托管。
                  </p>
                  
                  {paymentResult && (
                    <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>支付金额:</span>
                          <span className="font-medium">${amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>支付方式:</span>
                          <span className="font-medium">
                            {selectedProvider === 'stripe' ? '信用卡' : 'POLi银行转账'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>支付ID:</span>
                          <span className="font-mono text-xs">{paymentResult.paymentId}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/dashboard">控制台</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href={`/my-projects?project=${projectId}`}>查看项目</Link>
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
                <CardTitle>支付摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PaymentBreakdown
                  amount={amount}
                  tradieId={tradieId || ''}
                  currency="NZD"
                  showDetails={true}
                  showPlatformFee={false}
                  showTradieEarnings={false}
                />

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>安全托管保护</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    您的资金将被安全托管直到项目完成并获得您的批准
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">安全特性</span>
                  </div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• SSL加密传输</li>
                    <li>• PCI DSS安全合规</li>
                    <li>• 第三方资金托管</li>
                    <li>• 争议解决保护</li>
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
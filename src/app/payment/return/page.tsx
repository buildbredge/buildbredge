"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Home,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { stripe } from "@/lib/stripe"

interface CheckoutSession {
  id: string
  status: string
  payment_status: string
  payment_intent: {
    id: string
    status: string
  }
  metadata: {
    payment_id: string
    project_id: string
    quote_id: string
    tradie_id: string
    payer_id: string
  }
  amount_total: number
  currency: string
  customer_details: {
    email: string
    name: string
  }
}

export default function PaymentReturnPage() {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    const fetchSessionStatus = async () => {
      try {
        const response = await fetch(`/api/payments/session-status?session_id=${sessionId}`)
        
        if (!response.ok) {
          throw new Error('Failed to retrieve session status')
        }

        const data = await response.json()
        setSession(data.session)

        // If payment was successful, confirm the payment on our end
        if (data.session.payment_status === 'paid') {
          await confirmPayment(data.session.payment_intent.id)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionStatus()
  }, [sessionId])

  const confirmPayment = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId })
      })

      if (!response.ok) {
        console.error('Failed to confirm payment on server')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在处理您的付款</h2>
          <p className="text-gray-600">请稍等，我们正在确认您的付款...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">付款错误</h2>
            <p className="text-gray-600 mb-6">{error || '无法获取付款状态'}</p>
            <div className="flex space-x-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回控制面板
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  首页
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSuccessful = session.payment_status === 'paid'
  const isFailed = session.status === 'complete' && session.payment_status !== 'paid'
  const isOpen = session.status === 'open'

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
              控制面板
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isSuccessful && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">付款成功！</h2>
                <p className="text-gray-600 mb-6">
                  您的付款已成功处理，资金现已安全托管。
                </p>

                <div className="bg-green-50 p-6 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold text-green-900 mb-3">付款详情</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">金额:</span>
                      <span className="font-medium">{formatAmount(session.amount_total, session.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">付款ID:</span>
                      <span className="font-medium font-mono text-xs">{session.payment_intent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        已托管
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">日期:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    您的付款现已安全托管。资金将在项目完成后释放给技师，
                    或在15天保护期后自动释放。
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/dashboard">
                      查看控制面板
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/projects/${session.metadata.project_id}`}>
                      查看项目
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isFailed && (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">付款失败</h2>
                <p className="text-gray-600 mb-6">
                  您的付款无法处理。请重试或使用其他付款方式。
                </p>

                <div className="bg-red-50 p-6 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold text-red-900 mb-3">发生了什么？</h3>
                  <p className="text-sm text-red-700 mb-2">
                    您的付款被拒绝。可能原因包括：
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>资金不足</li>
                    <li>银行拒绝卡片</li>
                    <li>卡片信息错误</li>
                    <li>网络超时</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/dashboard">
                      控制面板
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/payment?project_id=${session.metadata.project_id}&quote_id=${session.metadata.quote_id}`}>
                      重试
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isOpen && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">付款未完成</h2>
                <p className="text-gray-600 mb-6">
                  您的付款会话仍在进行中。您可以继续付款或重新开始。
                </p>

                <div className="flex space-x-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/dashboard">
                      控制面板
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/payment?project_id=${session.metadata.project_id}&quote_id=${session.metadata.quote_id}`}>
                      继续付款
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
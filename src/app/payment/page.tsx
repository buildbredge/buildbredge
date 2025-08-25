"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Home,
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  Lock,
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { getStripe } from "@/lib/stripe"
import { PaymentBreakdown } from "@/components/PaymentBreakdown"
import { useAuth } from "@/contexts/AuthContext"

interface PaymentDetails {
  projectId: string
  projectTitle: string
  tradieName: string
  amount: number
  paymentType: "deposit" | "milestone" | "final"
  description: string
}

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "bank"
  name: string
  icon: string
  description: string
  available: boolean
}

export default function PaymentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  // 模拟支付详情数据
  const paymentDetails: PaymentDetails = {
    projectId: "proj_001",
    projectTitle: "厨房翻新项目",
    tradieName: "张建国",
    amount: 6500,
    paymentType: "milestone",
    description: "项目进度付款 - 65%完成"
  }

  const paymentMethods: PaymentMethod[] = [
    {
      id: "stripe",
      type: "card",
      name: "信用卡/借记卡",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
      available: true
    },
    {
      id: "paypal",
      type: "paypal",
      name: "PayPal",
      icon: "🅿️",
      description: "通过PayPal账户支付",
      available: true
    },
    {
      id: "bank",
      type: "bank",
      name: "银行转账",
      icon: "🏦",
      description: "直接银行转账",
      available: true
    }
  ]

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  })

  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "NZ"
  })

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case "deposit":
        return "项目定金"
      case "milestone":
        return "进度付款"
      case "final":
        return "尾款支付"
      default:
        return "项目付款"
    }
  }

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const handleStripePayment = async () => {
    setIsProcessing(true)

    // 模拟支付处理
    try {
      // 这里会集成真实的Stripe API
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 模拟成功响应
      alert("支付成功！资金已托管，项目完成后将释放给技师。")
      setCurrentStep(4) // 跳转到成功页面
    } catch (error) {
      alert("支付失败，请重试。")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    setIsProcessing(true)

    try {
      // 这里会集成PayPal SDK
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert("PayPal支付成功！")
      setCurrentStep(4)
    } catch (error) {
      alert("PayPal支付失败，请重试。")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBankTransfer = () => {
    setCurrentStep(3) // 显示银行转账信息
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
              返回仪表板
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((num) => (
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
                {num < 4 && (
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
              {currentStep === 1 && "选择支付方式"}
              {currentStep === 2 && "填写支付信息"}
              {currentStep === 3 && "银行转账信息"}
              {currentStep === 4 && "支付完成"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    选择支付方式
                  </CardTitle>
                  <CardDescription>选择您偏好的支付方式完成付款</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <h3 className="font-medium">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedPaymentMethod}
                      className="w-full"
                    >
                      继续
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {selectedPaymentMethod === "stripe" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>信用卡支付</CardTitle>
                      <CardDescription>请填写您的信用卡信息</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">卡号</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({
                            ...cardDetails,
                            cardNumber: e.target.value
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">有效期</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) => setCardDetails({
                              ...cardDetails,
                              expiryDate: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName">持卡人姓名</Label>
                        <Input
                          id="cardholderName"
                          placeholder="请输入持卡人姓名"
                          value={cardDetails.cardholderName}
                          onChange={(e) => setCardDetails({
                            ...cardDetails,
                            cardholderName: e.target.value
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>账单地址</CardTitle>
                    <CardDescription>请填写您的账单地址信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">名</Label>
                        <Input
                          id="firstName"
                          value={billingAddress.firstName}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            firstName: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">姓</Label>
                        <Input
                          id="lastName"
                          value={billingAddress.lastName}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            lastName: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                          id="email"
                          type="email"
                          value={billingAddress.email}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            email: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">电话</Label>
                        <Input
                          id="phone"
                          value={billingAddress.phone}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            phone: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">地址</Label>
                      <Input
                        id="address"
                        value={billingAddress.address}
                        onChange={(e) => setBillingAddress({
                          ...billingAddress,
                          address: e.target.value
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">城市</Label>
                        <Input
                          id="city"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            city: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">邮编</Label>
                        <Input
                          id="postalCode"
                          value={billingAddress.postalCode}
                          onChange={(e) => setBillingAddress({
                            ...billingAddress,
                            postalCode: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    返回
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedPaymentMethod === "stripe") {
                        handleStripePayment()
                      } else if (selectedPaymentMethod === "paypal") {
                        handlePayPalPayment()
                      } else if (selectedPaymentMethod === "bank") {
                        handleBankTransfer()
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      `支付 ${formatAmount(paymentDetails.amount)}`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>银行转账信息</CardTitle>
                  <CardDescription>请使用以下信息完成银行转账</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">转账详情</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">收款人：</span>
                        <span className="font-medium">BuildBridge Limited</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">银行：</span>
                        <span className="font-medium">ANZ Bank New Zealand</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">账号：</span>
                        <span className="font-medium">01-0123-0123456-00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">转账备注：</span>
                        <span className="font-medium">{paymentDetails.projectId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">转账金额：</span>
                        <span className="font-medium text-lg">{formatAmount(paymentDetails.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">重要提醒</p>
                        <p className="text-yellow-700">
                          请在转账时务必填写正确的项目编号作为备注，以便我们快速确认您的付款。
                          资金将在确认收到后进入托管状态。
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setCurrentStep(4)} className="w-full">
                    我已完成转账
                  </Button>
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
                    您的付款已成功处理，资金已进入安全托管。
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>支付金额：</span>
                        <span className="font-medium">{formatAmount(paymentDetails.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>支付方式：</span>
                        <span className="font-medium">
                          {selectedPaymentMethod === "stripe" && "信用卡"}
                          {selectedPaymentMethod === "paypal" && "PayPal"}
                          {selectedPaymentMethod === "bank" && "银行转账"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>交易时间：</span>
                        <span className="font-medium">{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/dashboard">返回仪表板</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard`}>查看项目</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>支付摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{paymentDetails.projectTitle}</h3>
                  <p className="text-sm text-gray-600">技师：{paymentDetails.tradieName}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{getPaymentTypeText(paymentDetails.paymentType)}</span>
                    <Badge variant="secondary">{paymentDetails.paymentType}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{paymentDetails.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>项目金额：</span>
                      <span>{formatAmount(paymentDetails.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平台服务费：</span>
                      <span>$0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>总计：</span>
                      <span className="text-lg">{formatAmount(paymentDetails.amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>资金安全托管</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    您的付款将在项目完成并验收后释放给技师
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">安全保障</span>
                  </div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• SSL加密传输</li>
                    <li>• PCI DSS安全标准</li>
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

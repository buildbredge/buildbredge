"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  DollarSign,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Settings,
  Home
} from "lucide-react"
import Link from "next/link"
import EmbeddedCheckoutComponent from "@/components/EmbeddedCheckout"

// Test data for different scenarios
const testScenarios = [
  {
    id: "small-payment",
    name: "小额付款测试",
    amount: 50.00,
    description: "测试小额付款流程",
    projectTitle: "小型修理项目",
    tradieId: "test-tradie-1"
  },
  {
    id: "medium-payment", 
    name: "中等付款测试",
    amount: 500.00,
    description: "测试中等金额付款流程",
    projectTitle: "厨房翻新项目",
    tradieId: "test-tradie-2"
  },
  {
    id: "large-payment",
    name: "大额付款测试", 
    amount: 5000.00,
    description: "测试大额付款流程",
    projectTitle: "全屋装修项目",
    tradieId: "test-tradie-3"
  }
]

// Stripe test card numbers
const testCards = [
  {
    name: "成功付款",
    number: "4242 4242 4242 4242",
    cvc: "任意3位数",
    expiry: "未来日期",
    description: "测试成功的付款流程"
  },
  {
    name: "付款失败 - 资金不足",
    number: "4000 0000 0000 9995", 
    cvc: "任意3位数",
    expiry: "未来日期",
    description: "测试资金不足的情况"
  },
  {
    name: "付款失败 - 卡片被拒",
    number: "4000 0000 0000 0002",
    cvc: "任意3位数", 
    expiry: "未来日期",
    description: "测试卡片被拒绝的情况"
  },
  {
    name: "需要验证",
    number: "4000 0025 0000 3155",
    cvc: "任意3位数",
    expiry: "未来日期", 
    description: "测试3D Secure验证流程"
  }
]

export default function TestPaymentPage() {
  const [selectedScenario, setSelectedScenario] = useState(testScenarios[0])
  const [customAmount, setCustomAmount] = useState("")
  const [testMode, setTestMode] = useState<"predefined" | "custom">("predefined")
  const [showPayment, setShowPayment] = useState(false)
  const [configCheck, setConfigCheck] = useState<{
    publishableKey: boolean
    secretKey: boolean
  } | null>(null)

  // Check Stripe configuration
  const checkStripeConfig = async () => {
    try {
      const response = await fetch('/api/test/stripe-config')
      const data = await response.json()
      setConfigCheck(data)
    } catch (error) {
      setConfigCheck({
        publishableKey: false,
        secretKey: false
      })
    }
  }

  const handleStartTest = () => {
    if (testMode === "custom" && (!customAmount || parseFloat(customAmount) <= 0)) {
      alert("请输入有效的测试金额")
      return
    }
    setShowPayment(true)
  }

  const getTestAmount = () => {
    return testMode === "custom" ? parseFloat(customAmount) : selectedScenario.amount
  }

  const getTestDescription = () => {
    return testMode === "custom" ? "自定义金额测试" : selectedScenario.description
  }

  const getProjectTitle = () => {
    return testMode === "custom" ? "自定义测试项目" : selectedScenario.projectTitle
  }

  // Real database test data for payment
  const realProjectId = "714b37b9-b41d-47a5-92f4-9fa8cbb1a672"  // 花园整理砍树
  const realQuoteId = "524ba67d-4a85-4e09-829d-af7c071ebe63"     // Accepted quote
  const realPayerId = "c6ac7408-f8f4-4ef7-b177-debd766608ee"    // Mark
  const realTradieId = "14a742ec-1ee8-47e4-8b1c-26e834174b35"   // we

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
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <TestTube className="w-3 h-3 mr-1" />
              测试模式
            </Badge>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {!showPayment ? (
          /* Test Configuration */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe付款系统测试</h1>
              <p className="text-gray-600">测试嵌入式Stripe Checkout付款流程</p>
            </div>

            {/* Configuration Check */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  配置检查
                </CardTitle>
                <CardDescription>检查Stripe API密钥配置状态</CardDescription>
              </CardHeader>
              <CardContent>
                {configCheck === null ? (
                  <Button onClick={checkStripeConfig}>
                    检查配置
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {configCheck.publishableKey ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {configCheck.secretKey ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>STRIPE_SECRET_KEY</span>
                    </div>
                    
                    {(!configCheck.publishableKey || !configCheck.secretKey) && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>需要配置Stripe密钥:</strong>
                          <br />
                          请在 .env.local 文件中添加以下配置：
                          <br />
                          <code className="block mt-2 p-2 bg-gray-100 rounded">
                            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
                            <br />
                            STRIPE_SECRET_KEY=sk_test_...
                            <br />
                            STRIPE_WEBHOOK_SECRET=whsec_...
                          </code>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs value={testMode} onValueChange={(value: any) => setTestMode(value)} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="predefined">预定义场景</TabsTrigger>
                <TabsTrigger value="custom">自定义测试</TabsTrigger>
              </TabsList>
              
              <TabsContent value="predefined">
                <Card>
                  <CardHeader>
                    <CardTitle>选择测试场景</CardTitle>
                    <CardDescription>选择一个预定义的付款测试场景</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {testScenarios.map((scenario) => (
                        <div
                          key={scenario.id}
                          onClick={() => setSelectedScenario(scenario)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedScenario.id === scenario.id
                              ? "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{scenario.name}</h3>
                            <Badge variant="outline">
                              ${scenario.amount.toFixed(2)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{scenario.projectTitle}</p>
                          <p className="text-xs text-gray-500">{scenario.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="custom">
                <Card>
                  <CardHeader>
                    <CardTitle>自定义测试</CardTitle>
                    <CardDescription>输入自定义的测试金额</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customAmount">测试金额 (NZD)</Label>
                        <Input
                          id="customAmount"
                          type="number"
                          placeholder="输入测试金额"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Test Cards Reference */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Stripe测试卡号</CardTitle>
                <CardDescription>使用以下测试卡号来模拟不同的付款结果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testCards.map((card, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">{card.name}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>卡号:</strong> {card.number}</div>
                        <div><strong>有效期:</strong> {card.expiry}</div>
                        <div><strong>CVC:</strong> {card.cvc}</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{card.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={handleStartTest}
                size="lg"
                disabled={configCheck ? (!configCheck.publishableKey || !configCheck.secretKey) : true}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                开始付款测试 (${getTestAmount().toFixed(2)})
              </Button>
            </div>
          </div>
        ) : (
          /* Payment Test */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">付款测试进行中</h1>
              <p className="text-gray-600">测试金额: ${getTestAmount().toFixed(2)} NZD</p>
              <Button 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="mt-2"
              >
                返回配置
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      测试付款表单
                    </CardTitle>
                    <CardDescription>
                      使用上方的测试卡号进行付款测试
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmbeddedCheckoutComponent
                      projectId={realProjectId}
                      quoteId={realQuoteId}
                      payerId={realPayerId}
                      tradieId={realTradieId}
                      amount={getTestAmount()}
                      currency="NZD"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Test Information */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>测试信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>测试金额:</span>
                          <span className="font-medium">${getTestAmount().toFixed(2)} NZD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>项目:</span>
                          <span className="font-medium">{getProjectTitle()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>描述:</span>
                          <span className="font-medium">{getTestDescription()}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">真实数据库数据:</h4>
                        <div className="text-xs space-y-1 text-gray-600">
                          <div>项目ID: {realProjectId}</div>
                          <div>报价ID: {realQuoteId}</div>
                          <div>付款人ID: {realPayerId}</div>
                          <div>技师ID: {realTradieId}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-sm mb-3">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">测试提示</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 使用测试卡号不会产生真实费用</li>
                        <li>• 付款成功后会自动创建托管记录</li>
                        <li>• 可以在数据库中查看测试数据</li>
                        <li>• 所有测试都在沙盒环境中进行</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Home,
  Check,
  X,
  Crown,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
  Zap,
  Target,
  Award,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  Headphones,
  ArrowRight
} from "lucide-react"

interface PlanFeature {
  name: string
  basic: boolean | string
  pro: boolean | string
  premium: boolean | string
  tooltip?: string
}

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  description: string
  popular?: boolean
  features: string[]
  badge?: string
  color: string
}

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [activeTab, setActiveTab] = useState("plans")

  const plans: Plan[] = [
    {
      id: "basic",
      name: "基础版",
      price: 29,
      yearlyPrice: 299,
      description: "适合刚入驻的个人技师",
      features: [
        "基础档案展示",
        "每月5个项目报价",
        "客户联系方式",
        "基础客服支持",
        "移动App访问"
      ],
      color: "border-gray-200"
    },
    {
      id: "pro",
      name: "专业版",
      price: 79,
      yearlyPrice: 799,
      description: "适合专业技师和小型团队",
      popular: true,
      badge: "最受欢迎",
      features: [
        "优先档案展示",
        "无限项目报价",
        "即时消息通知",
        "客户管理系统",
        "项目进度跟踪",
        "专业客服支持",
        "业务分析报告",
        "优先技术支持"
      ],
      color: "border-green-500"
    },
    {
      id: "premium",
      name: "企业版",
      price: 149,
      yearlyPrice: 1499,
      description: "适合大型团队和建筑公司",
      badge: "企业首选",
      features: [
        "置顶档案展示",
        "无限项目报价",
        "多用户账户管理",
        "高级客户管理",
        "自定义品牌展示",
        "高级分析报告",
        "API集成支持",
        "专属客户经理",
        "优先项目推荐",
        "24/7技术支持"
      ],
      color: "border-purple-500"
    }
  ]

  const features: PlanFeature[] = [
    {
      name: "项目报价数量",
      basic: "5个/月",
      pro: "无限",
      premium: "无限"
    },
    {
      name: "档案展示优先级",
      basic: "标准",
      pro: "优先",
      premium: "置顶"
    },
    {
      name: "即时消息通知",
      basic: false,
      pro: true,
      premium: true
    },
    {
      name: "客户管理系统",
      basic: false,
      pro: true,
      premium: true
    },
    {
      name: "项目进度跟踪",
      basic: false,
      pro: true,
      premium: true
    },
    {
      name: "业务分析报告",
      basic: false,
      pro: true,
      premium: "高级版"
    },
    {
      name: "多用户账户",
      basic: false,
      pro: false,
      premium: true
    },
    {
      name: "自定义品牌",
      basic: false,
      pro: false,
      premium: true
    },
    {
      name: "API集成",
      basic: false,
      pro: false,
      premium: true
    },
    {
      name: "专属客户经理",
      basic: false,
      pro: false,
      premium: true
    }
  ]

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    return Math.round((1 - yearly / (monthly * 12)) * 100)
  }

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-600" />
    }
    if (value === false) {
      return <X className="w-5 h-5 text-gray-400" />
    }
    return <span className="text-sm font-medium">{value}</span>
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
            <span className="text-2xl font-bold text-green-600">BuildBridge</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <Crown className="w-3 h-3 mr-1" />
              技师订阅
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">技师订阅方案</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            选择适合您业务的订阅方案，获得更多项目机会和专业工具
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="plans">订阅方案</TabsTrigger>
            <TabsTrigger value="features">功能对比</TabsTrigger>
            <TabsTrigger value="faq">常见问题</TabsTrigger>
          </TabsList>

          {/* 订阅方案 */}
          <TabsContent value="plans" className="space-y-8">
            {/* 计费周期切换 */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                按月付费
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                按年付费
              </span>
              {billingCycle === 'yearly' && (
                <Badge className="bg-green-100 text-green-800">
                  节省 17%
                </Badge>
              )}
            </div>

            {/* 方案卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-green-500' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className={plan.popular ? "bg-green-600" : "bg-purple-600"}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>

                    <div className="pt-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                        </span>
                        <span className="text-gray-500 ml-1">
                          /{billingCycle === 'monthly' ? '月' : '年'}
                        </span>
                      </div>

                      {billingCycle === 'yearly' && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 line-through">
                            ${plan.price * 12}/年
                          </span>
                          <Badge className="ml-2 bg-green-100 text-green-800">
                            节省 ${plan.price * 12 - plan.yearlyPrice}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-green-600 hover:bg-green-700'
                          : plan.id === 'premium'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      {plan.id === 'basic' ? '免费试用' : '立即订阅'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 企业定制 */}
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">企业定制方案</h3>
                    <p className="text-gray-300 mb-6">
                      为大型建筑公司和连锁机构提供定制化解决方案，包括白标服务、专属功能开发和专业培训。
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>定制功能开发</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>白标解决方案</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>专业培训服务</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>专属技术支持</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      <Phone className="w-4 h-4 mr-2" />
                      联系销售团队
                    </Button>
                    <p className="text-sm text-gray-400 mt-4">
                      专业顾问为您定制最适合的解决方案
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 功能对比 */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>详细功能对比</CardTitle>
                <CardDescription>
                  了解不同订阅方案包含的具体功能和服务
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4">功能</th>
                        <th className="text-center py-4 px-4">基础版</th>
                        <th className="text-center py-4 px-4">专业版</th>
                        <th className="text-center py-4 px-4">企业版</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{feature.name}</td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.basic)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.pro)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderFeatureValue(feature.premium)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 常见问题 */}
          <TabsContent value="faq">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">如何选择合适的方案？</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      根据您的业务规模选择：个人技师选择基础版，专业团队选择专业版，大型公司选择企业版。
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">可以随时升级或降级吗？</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      是的，您可以随时升级订阅方案。降级将在当前计费周期结束后生效。
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">支持哪些付款方式？</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      支持信用卡、借记卡和银行转账。企业客户可申请月结服务。
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">有免费试用期吗？</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      新用户可免费试用基础版30天，专业版和企业版提供14天免费试用。
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 联系支持 */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Headphones className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-800 mb-2">需要帮助？</h3>
                    <p className="text-green-700 mb-4">
                      我们的客服团队随时为您提供订阅相关的咨询和支持
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Phone className="w-4 h-4 mr-2" />
                        电话咨询
                      </Button>
                      <Button variant="outline" className="border-green-600 text-green-600">
                        <Mail className="w-4 h-4 mr-2" />
                        邮件支持
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

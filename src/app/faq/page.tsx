"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Home,
  User,
  Settings,
  MessageCircle,
  Star,
  Shield,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react"
import Link from "next/link"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface FAQCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories: FAQCategory[] = [
    {
      id: "getting-started",
      title: "BuildBridge使用入门",
      description: "了解如何开始使用BuildBridge平台",
      icon: Home,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "posting-jobs",
      title: "发布项目需求",
      description: "如何发布和管理您的项目需求",
      icon: MessageCircle,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "finding-tradies",
      title: "寻找专业技师",
      description: "如何选择和联系合适的技师",
      icon: User,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "project-management",
      title: "项目管理",
      description: "如何管理您的项目进展",
      icon: Settings,
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: "reviews-ratings",
      title: "评价和评分",
      description: "如何给技师评价和查看评分",
      icon: Star,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: "account-settings",
      title: "账户设置",
      description: "管理您的个人账户信息",
      icon: Shield,
      color: "bg-gray-100 text-gray-600"
    }
  ]

  const faqs: FAQItem[] = [
    // Getting Started
    {
      id: "what-is-buildbridge",
      question: "什么是BuildBridge？",
      answer: "BuildBridge是专为海外华人设计的住房维护与建筑服务平台。我们帮助您连接当地的专业技师，提供从装修、维修到建筑的全方位服务。平台提供中文服务，让您在海外也能享受无障碍沟通。",
      category: "getting-started"
    },
    {
      id: "how-does-it-work",
      question: "BuildBridge是如何运作的？",
      answer: "很简单！1) 发布您的项目需求，描述具体需要什么服务；2) 我们会根据您的地区和需求智能匹配合适的技师；3) 技师会主动联系您并提供报价；4) 您选择最满意的技师开始项目；5) 项目完成后进行评价。整个过程都有中文支持。",
      category: "getting-started"
    },
    {
      id: "is-buildbridge-free",
      question: "使用BuildBridge需要付费吗？",
      answer: "对房主用户完全免费！您可以免费发布项目需求，免费接收技师报价，免费使用所有平台功能。我们的收入来自技师的会员费，所以房主使用所有服务都不收取任何费用。",
      category: "getting-started"
    },
    {
      id: "supported-areas",
      question: "BuildBridge支持哪些地区？",
      answer: "目前我们主要服务新西兰地区，覆盖奥克兰、惠灵顿、基督城、汉密尔顿等主要城市。我们正在扩展到澳大利亚、加拿大和美国，预计2025年陆续上线。",
      category: "getting-started"
    },

    // Posting Jobs
    {
      id: "how-to-post-job",
      question: "如何发布项目需求？",
      answer: "点击'发布需求'按钮，然后：1) 选择服务类型（如装修、维修等）；2) 详细描述您的项目需求；3) 选择项目地址和预算范围；4) 上传相关照片（可选）；5) 填写联系信息。发布后系统会自动匹配合适的技师。",
      category: "posting-jobs"
    },
    {
      id: "job-description-tips",
      question: "如何写好项目描述？",
      answer: "好的项目描述应该包含：1) 具体的工作内容和要求；2) 项目规模和时间要求；3) 特殊要求或偏好；4) 预算范围。越详细的描述越能吸引合适的技师。如果有现场照片，一定要上传，这能增加20%以上的关注度。",
      category: "posting-jobs"
    },
    {
      id: "add-photos",
      question: "如何添加项目照片？",
      answer: "在发布需求时，您可以上传最多5张照片和1个视频。照片有助于技师更好地了解项目现状和需求。建议拍摄不同角度的照片，但请注意保护隐私，不要在照片中包含个人信息。",
      category: "posting-jobs"
    },
    {
      id: "edit-job",
      question: "发布后还能修改项目信息吗？",
      answer: "可以的。登录您的账户，进入'项目管理'页面，选择相应项目点击'编辑'即可修改项目描述、预算、时间要求等信息。修改后技师会收到更新通知。",
      category: "posting-jobs"
    },

    // Finding Tradies
    {
      id: "how-matching-works",
      question: "系统如何为我匹配技师？",
      answer: "我们的智能匹配系统会根据以下因素选择技师：1) 技师的专业领域是否匹配您的需求；2) 技师的服务区域是否覆盖您的地址；3) 技师的评分和完成项目数量；4) 技师是否会中文（优先推荐）。",
      category: "finding-tradies"
    },
    {
      id: "verified-tradies",
      question: "'已认证'技师是什么意思？",
      answer: "'已认证'表示技师已通过我们的身份验证、资质审核和保险确认。这些技师具有：1) 有效的专业执照；2) 完整的保险覆盖；3) 良好的信用记录；4) 平台推荐。选择已认证技师更有保障。",
      category: "finding-tradies"
    },
    {
      id: "contact-tradies",
      question: "如何联系技师？",
      answer: "技师收到您的项目后会主动联系您。您也可以在技师列表中点击'联系技师'按钮发送消息。平台提供消息中心功能，您可以与多个技师同时沟通，比较不同的报价和方案。",
      category: "finding-tradies"
    },
    {
      id: "choose-tradie",
      question: "如何选择合适的技师？",
      answer: "建议综合考虑：1) 专业资质和经验年限；2) 客户评价和评分；3) 报价是否合理；4) 响应速度和沟通态度；5) 是否提供保修服务。不要只看价格，质量和服务同样重要。",
      category: "finding-tradies"
    },

    // Project Management
    {
      id: "project-timeline",
      question: "项目的一般流程是什么？",
      answer: "标准流程：1) 发布需求 → 2) 接收报价 → 3) 选择技师 → 4) 签署协议 → 5) 启动资金托管 → 6) 开始施工 → 7) 进度监督 → 8) 验收完工 → 9) 释放资金 → 10) 项目评价。整个过程平台提供全程支持。",
      category: "project-management"
    },
    {
      id: "payment-protection",
      question: "资金托管是如何保护我的？",
      answer: "资金托管确保您的资金安全：1) 费用由第三方平台托管，技师无法直接获得；2) 只有在您确认工作满意后才释放资金；3) 如有纠纷，平台会介入调解；4) 提供工作保修保障。这样您可以安心付款，无需担心资金风险。",
      category: "project-management"
    },
    {
      id: "change-tradie",
      question: "如果对技师不满意怎么办？",
      answer: "如果工作开始前发现问题，您可以：1) 先尝试沟通解决；2) 联系平台客服寻求帮助；3) 如有必要可以更换技师。如果工作已开始，我们会根据具体情况协调解决方案，保护您的合法权益。",
      category: "project-management"
    },

    // Reviews & Ratings
    {
      id: "leave-review",
      question: "如何给技师评价？",
      answer: "项目完成后，您会收到评价邀请。评价包括：1) 1-5星评分；2) 工作质量、沟通态度、时间准时性等多维度评分；3) 文字评价和建议。您的评价对其他用户很重要，也帮助技师改进服务。",
      category: "reviews-ratings"
    },
    {
      id: "review-system",
      question: "评价系统是如何工作的？",
      answer: "我们采用双向评价系统：1) 只有真实完成的项目才能评价；2) 评价一旦提交无法修改，确保真实性；3) 技师也会对客户进行评价；4) 平台会审核恶意评价。这样确保评价的公正性和可信度。",
      category: "reviews-ratings"
    },
    {
      id: "negative-review",
      question: "可以给差评吗？",
      answer: "可以的。如果服务确实不满意，您有权给出客观的负面评价。但请确保：1) 评价基于事实；2) 语言客观理性；3) 先尝试与技师沟通解决问题。恶意差评会被平台审核，但合理的负面反馈有助于维护平台质量。",
      category: "reviews-ratings"
    },

    // Account Settings
    {
      id: "update-profile",
      question: "如何更新个人信息？",
      answer: "登录后进入'个人中心'，点击'编辑资料'即可修改姓名、电话、地址等信息。邮箱地址修改需要重新验证。建议保持信息更新，这有助于技师更好地为您服务。",
      category: "account-settings"
    },
    {
      id: "account-security",
      question: "如何保护账户安全？",
      answer: "建议：1) 使用强密码并定期更改；2) 不要与他人分享账户信息；3) 及时更新联系方式；4) 如发现异常登录立即联系客服。我们采用银行级安全措施保护您的个人信息。",
      category: "account-settings"
    },
    {
      id: "delete-account",
      question: "如何删除账户？",
      answer: "如需删除账户，请联系客服。删除前请确保：1) 所有项目已完成；2) 没有待处理的纠纷；3) 已下载需要的历史记录。账户删除后无法恢复，相关数据会被永久清除。",
      category: "account-settings"
    }
  ]

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const faqsByCategory = categories.map(category => ({
    ...category,
    faqs: filteredFAQs.filter(faq => faq.category === category.id)
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">常见问题</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            如果您对BuildBridge有任何疑问，请先查看我们的详细FAQ
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="搜索问题..."
              className="pl-10 py-3 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="mb-2"
          >
            全部分类
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="mb-2"
            >
              {category.title}
            </Button>
          ))}
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {selectedCategory === "all" ? (
            // Show by categories
            faqsByCategory.map(category => (
              <div key={category.id}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {category.faqs.map(faq => (
                    <Card key={faq.id}>
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpanded(faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedItems.has(faq.id) && (
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show filtered results
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <Card key={faq.id}>
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                      {expandedItems.has(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedItems.has(faq.id) && (
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关问题</h3>
            <p className="text-gray-600 mb-4">请尝试其他关键词或联系我们的客服团队</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
            }}>
              清除搜索条件
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-12 bg-green-50 border-green-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-green-800 mb-2">没有找到答案？</h3>
            <p className="text-green-700 mb-6">
              开始使用BuildBridge或联系我们的客服团队获得帮助
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/post-job">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  免费发布项目
                </Link>
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                联系客服
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                电话支持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">新西兰免费热线</p>
              <p className="text-xl font-bold text-green-600">0800 BUILD NZ</p>
              <p className="text-sm text-gray-500 mt-2">
                工作时间：周一至周五 9:00-18:00 (NZST)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                邮件支持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">发送邮件至</p>
              <p className="text-xl font-bold text-green-600">support@buildbridge.nz</p>
              <p className="text-sm text-gray-500 mt-2">
                我们会在24小时内回复您的邮件
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

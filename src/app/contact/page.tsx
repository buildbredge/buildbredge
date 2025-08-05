"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  HelpCircle,
  Shield,
  Headphones,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert("您的消息已发送！我们会在24小时内回复您。")
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">联系我们</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            我们随时准备为您提供帮助。无论是技术支持、平台问题还是合作咨询，请联系我们的专业团队。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
                  发送消息
                </CardTitle>
                <CardDescription>
                  请填写下面的表单，我们会尽快回复您
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="请输入您的姓名"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">邮箱地址 *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">咨询类别</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择咨询类别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">技术支持</SelectItem>
                        <SelectItem value="account">账户问题</SelectItem>
                        <SelectItem value="billing">费用相关</SelectItem>
                        <SelectItem value="tradie">技师认证</SelectItem>
                        <SelectItem value="partnership">商务合作</SelectItem>
                        <SelectItem value="feedback">意见建议</SelectItem>
                        <SelectItem value="other">其他问题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">主题 *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="请简要描述您的问题"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">详细描述 *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="请详细描述您的问题或需求，我们会为您提供更准确的帮助"
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        发送消息
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-6 h-6 mr-2 text-green-600" />
                    联系方式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium">客服热线</p>
                      <p className="text-gray-600">新西兰：0800 BUILD NZ</p>
                      <p className="text-gray-600">国际：+64 9 XXX XXXX</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium">邮箱支持</p>
                      <p className="text-gray-600">support@buildbridge.nz</p>
                      <p className="text-gray-600">partnerships@buildbridge.nz</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium">办公地址</p>
                      <p className="text-gray-600">Level 10, 120 Albert Street</p>
                      <p className="text-gray-600">Auckland 1010, New Zealand</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium">客服时间</p>
                      <p className="text-gray-600">周一至周五：9:00 - 18:00 (NZST)</p>
                      <p className="text-gray-600">周末：10:00 - 16:00 (NZST)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                    快速帮助
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/faq" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">常见问题</p>
                      <p className="text-sm text-gray-600">查看常见问题和解答</p>
                    </div>
                  </Link>

                  <Link href="/how-it-works" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">平台指南</p>
                      <p className="text-sm text-gray-600">了解如何使用BuildBridge</p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">紧急支持</p>
                      <p className="text-sm text-gray-600">紧急情况请直接致电客服</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Support */}
              <Card>
                <CardHeader>
                  <CardTitle>多地区支持</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="text-lg mr-2">🇳🇿</span>
                        新西兰
                      </span>
                      <span className="text-green-600 font-medium">已开通</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="text-lg mr-2">🇦🇺</span>
                        澳大利亚
                      </span>
                      <span className="text-yellow-600 font-medium">即将开通</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="text-lg mr-2">🇨🇦</span>
                        加拿大
                      </span>
                      <span className="text-gray-500 font-medium">筹备中</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="text-lg mr-2">🇺🇸</span>
                        美国
                      </span>
                      <span className="text-gray-500 font-medium">筹备中</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    我们正在积极扩展服务区域，为更多地区的华人用户提供支持。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 bg-green-50 border-green-200">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-green-600 mb-2">还有其他问题？</h2>
            <p className="text-gray-700 mb-6">
              我们的客服团队随时准备为您提供专业的帮助和支持
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700">
                <Phone className="w-4 h-4 mr-2" />
                立即致电
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                在线客服
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

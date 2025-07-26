"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Shield, Users, Wrench, CheckCircle, Home, Zap, Hammer, Paintbrush, Settings, Leaf, Phone, Calendar, Globe, ChevronDown, MessageCircle, Bot, X } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import { useState } from "react"

export default function HomePage() {
  const [showAiChat, setShowAiChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      type: "ai",
      content: "您好！我是BuildBridge智能助理，很高兴为您服务！🏠✨\n\n我可以帮助您：\n• 了解我们的服务流程\n• 寻找合适的技师\n• 估算项目费用\n• 解答常见问题\n\n请问您需要什么帮助呢？",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const toggleAiChat = () => {
    setShowAiChat(!showAiChat)
  }

  const sendMessage = () => {
    if (!currentMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage("")

    // 模拟AI回复
    setTimeout(() => {
      let aiResponse = ""
      const message = currentMessage.toLowerCase()

      if (message.includes("价格") || message.includes("费用") || message.includes("多少钱")) {
        aiResponse = "关于价格，我们的服务费用因项目而异：\n\n🔧 基础维修：$50-100/小时\n🏗️ 装修项目：$80-150/小时\n🏠 大型建筑：$100-200/小时\n\n具体价格需要技师实地评估。您可以免费发布需求，收到多个报价后再选择。要不要我帮您开始发布项目？"
      } else if (message.includes("技师") || message.includes("工人")) {
        aiResponse = "我们平台有超过1,200名认证技师，覆盖64个专业类别：\n\n⚡ 电工服务\n🔧 水管维修\n🏗️ 建筑施工\n🎨 装修装饰\n🌿 园艺绿化\n\n所有技师都经过严格认证，有保险保障。您想找哪类技师呢？我可以帮您推荐合适的专业人士。"
      } else if (message.includes("流程") || message.includes("怎么") || message.includes("如何")) {
        aiResponse = "BuildBridge的服务流程很简单：\n\n1️⃣ 发布需求（5-10分钟）\n2️⃣ 收到报价（24小时内）\n3️⃣ 选择技师（对比评价和价格）\n4️⃣ 安全施工（资金托管保障）\n5️⃣ 验收完工（满意后付款）\n\n全程中文服务，有任何问题都有客服支持。要不要现在就开始发布您的项目需求？"
      } else if (message.includes("安全") || message.includes("保障")) {
        aiResponse = "安全保障是我们的重点：\n\n🛡️ 资金托管：完工验收后才付款\n✅ 技师认证：身份、资质、保险三重验证\n📋 保险覆盖：所有项目都有保险保障\n⭐ 评价体系：真实客户评价，透明可信\n📞 客服支持：24/7中文客服随时协助\n\n我们专为海外华人设计，让您用得安心放心！"
      } else if (message.includes("你好") || message.includes("hello") || message.includes("hi")) {
        aiResponse = "您好！欢迎来到BuildBridge！😊\n\n我是您的专属智能助理，可以帮您解决各种房屋维护和建筑需求。无论是水管漏水、电路故障，还是厨房翻新、房屋扩建，我们都有专业技师为您服务。\n\n您今天遇到什么房屋问题需要解决吗？"
      } else {
        aiResponse = "感谢您的咨询！🙏\n\n我正在学习中，可能没有完全理解您的问题。建议您：\n\n📞 联系人工客服：24/7中文服务\n📝 发布项目需求：技师直接为您解答\n🔍 浏览技师目录：查看专业人士资料\n\n我们的团队会确保您得到最专业的帮助！需要我为您转接人工客服吗？"
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            连接<span className="text-green-200">业主</span>与<span className="text-green-200">专业人员</span>的桥梁
          </h1>


        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">如何运作</h2>
            <p className="text-gray-600">服务流程，简单、透明、可信赖</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">发布需求</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>选择服务：</strong>从14大类84项服务中精确选择</p>
                <p><strong>详细描述：</strong>用中文描述具体需求和期望</p>
                <p><strong>设定预算：</strong>透明的价格范围和时间要求</p>
                <p><strong>上传图片：</strong>可添加现场照片帮助技师了解</p>
                <div className="bg-green-50 p-3 rounded mt-4">
                  <p className="text-sm text-green-700">⏱️ <strong>发布时间：</strong>5-10分钟即可完成</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">匹配技师</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>智能推荐：</strong>系统自动匹配附近的认证技师</p>
                <p><strong>多重验证：</strong>身份认证、资质证书、保险齐全</p>
                <p><strong>中文沟通：</strong>优先推荐会中文的技师</p>
                <p><strong>透明报价：</strong>详细的工作计划和材料清单</p>
                <div className="bg-blue-50 p-3 rounded mt-4">
                  <p className="text-sm text-blue-700">📞 <strong>响应时间：</strong>24小时内收到多个报价</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">安全完工</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>资金托管：</strong>费用由平台代管，完工后释放</p>
                <p><strong>进度跟踪：</strong>实时更新工作进展和照片</p>
                <p><strong>质量保证：</strong>提供工作保修和售后服务</p>
                <p><strong>评价体系：</strong>双向评价确保服务质量</p>
                <div className="bg-purple-50 p-3 rounded mt-4">
                  <p className="text-sm text-purple-700">🛡️ <strong>安全保障：</strong>全程保险覆盖，无忧售后</p>
                </div>
              </div>
            </div>
          </div>

          {/* 详细流程时间线 */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">完整服务时间线</h3>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200"></div>

                <div className="space-y-12">
                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <h4 className="font-semibold text-green-600">第1天</h4>
                      <p className="text-gray-600">发布需求，系统智能匹配</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    <div className="flex-1 pl-8">
                      <p className="text-sm text-gray-500">平台审核需求，推送给合适技师</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <p className="text-sm text-gray-500">技师查看需求，提供详细报价</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    <div className="flex-1 pl-8">
                      <h4 className="font-semibold text-green-600">第2-3天</h4>
                      <p className="text-gray-600">收到多个报价，对比选择</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <h4 className="font-semibold text-green-600">第4-7天</h4>
                      <p className="text-gray-600">确认技师，安排上门时间</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    <div className="flex-1 pl-8">
                      <p className="text-sm text-gray-500">签署协议，启动资金托管</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <p className="text-sm text-gray-500">按计划执行，实时进度更新</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    <div className="flex-1 pl-8">
                      <h4 className="font-semibold text-green-600">施工期间</h4>
                      <p className="text-gray-600">专业施工，质量监督</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <h4 className="font-semibold text-green-600">完工验收</h4>
                      <p className="text-gray-600">验收满意，释放资金</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    <div className="flex-1 pl-8">
                      <p className="text-sm text-gray-500">获得保修凭证，售后服务</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 特色保障 */}
          <div className="mt-16 bg-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">海外华人专属保障</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-600 font-bold">中</span>
                </div>
                <h4 className="font-semibold mb-2">中文服务</h4>
                <p className="text-sm text-gray-600">全程中文沟通，无语言障碍</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">资金安全</h4>
                <p className="text-sm text-gray-600">第三方托管，完工后付款</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">质量保证</h4>
                <p className="text-sm text-gray-600">认证技师，工作保修</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">24/7客服</h4>
                <p className="text-sm text-gray-600">随时解答，及时处理纠纷</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-green-600 mb-1">可信赖</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,200+</div>
              <p className="text-gray-600">认证技师工人</p>
            </div>

            <div>
              <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-green-600 mb-1">专业化</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">850</div>
              <p className="text-gray-600">完成项目</p>
            </div>

            <div>
              <Star className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-green-600 mb-1">高质量</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.9/5.0</div>
              <p className="text-gray-600">平均评分</p>
            </div>

            <div>
              <Wrench className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-green-600 mb-1">一站式</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">300+</div>
              <p className="text-gray-600">合作供应商</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门服务类别</h2>
            <p className="text-gray-600">专业技师为您提供全方位住房服务</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { icon: Hammer, name: "建筑施工" },
              { icon: Home, name: "水管维修" },
              { icon: Zap, name: "电工服务" },
              { icon: Paintbrush, name: "油漆装饰" },
              { icon: Settings, name: "木工制作" },
              { icon: Leaf, name: "园艺绿化" },
              { icon: Wrench, name: "设备安装" },
              { icon: Settings, name: "建材供应" },
            ].map((service, index) => (
              <Link key={index} href="/services">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <service.icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="font-medium text-sm">{service.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/services">查看全部服务类别</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">用户真实评价</h2>
            <p className="text-gray-600">看看其他华人用户的使用体验</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "张女士",
                location: "奥克兰 · 厨房翻新",
                review: "BuildBridge让我在新西兰找到了可靠的中文服务技师，沟通无障碍，工作质量很好！"
              },
              {
                name: "李先生",
                location: "悉尼 · 电路维修",
                review: "平台的资金托管让我很放心，技师很专业，价格也很透明。强烈推荐给华人朋友！"
              },
              {
                name: "王女士",
                location: "多伦多 · 屋顶维修",
                review: "从发布需求到完工只用了一周时间，效率很高。技师和建材供应商都很可靠。"
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.review}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="bg-green-600 hover:bg-green-700">立即开始</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">BuildBridge</span>
              </div>
              <p className="text-gray-400">海外华人住房维护与建筑服务平台</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">房主服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white">发布项目</Link></li>
                <li><Link href="/cost-estimator" className="hover:text-white">费用估算</Link></li>
                <li><Link href="/browse-tradies" className="hover:text-white">技师目录</Link></li>
                <li><Link href="/faq" className="hover:text-white">常见问题</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">技师工人</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">接单赚钱</a></li>
                <li><a href="#" className="hover:text-white">技师认证</a></li>
                <li><a href="#" className="hover:text-white">价格方案</a></li>
                <li><a href="#" className="hover:text-white">技师指南</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">公司介绍</Link></li>
                <li><Link href="/contact" className="hover:text-white">联系我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">服务条款</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 BuildBridge. 专为海外华人打造的住房服务平台。</p>
            <div className="mt-4">
              <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 text-xs">
                管理员登录
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showAiChat ? (
          <Button
            onClick={toggleAiChat}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-110"
            size="lg"
          >
            <Bot className="w-8 h-8" />
          </Button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border w-96 h-[500px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">AI智能助理</h3>
                  <p className="text-xs text-green-100">BuildBridge专属客服</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAiChat}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                      message.type === "user"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white rounded-b-2xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 p-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentMessage("我想了解价格")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600"
                  >
                    价格咨询
                  </button>
                  <button
                    onClick={() => setCurrentMessage("如何找技师")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600"
                  >
                    找技师
                  </button>
                  <button
                    onClick={() => setCurrentMessage("服务流程")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600"
                  >
                    服务流程
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

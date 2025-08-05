"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  Star,
  CheckCircle,
  Phone,
  Home,
  ArrowRight,
  Clock,
  DollarSign,
  FileText,
  Camera,
  MessageCircle,
  Handshake
} from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            如何使用<span className="text-green-200">BuildBridge</span>
          </h1>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            专为海外华人设计的生活服务流程，从发布需求到项目完工，每一步都简单透明
          </p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
            <Link href="/post-job">立即开始</Link>
          </Button>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">三步解决您的住房需求</h2>
            <p className="text-gray-600">简单、安全、高效的服务流程</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">发布需求</h3>
              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <span>详细描述项目需求</span>
                </div>
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-green-600 mr-3" />
                  <span>上传现场照片</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                  <span>设定预算范围</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-600 mr-3" />
                  <span>选择时间安排</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-700">⏱️ 只需5-10分钟即可完成</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">匹配技师</h3>
              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span>智能推荐合适技师</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-3" />
                  <span>多重身份认证</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <span>中文沟通无障碍</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-blue-600 mr-3" />
                  <span>查看评价和作品</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">📞 24小时内收到多个报价</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">安全完工</h3>
              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-3" />
                  <span>资金托管保护</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  <span>质量保证承诺</span>
                </div>
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-purple-600 mr-3" />
                  <span>进度实时更新</span>
                </div>
                <div className="flex items-center">
                  <Handshake className="w-5 h-5 text-purple-600 mr-3" />
                  <span>满意后释放付款</span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-purple-700">🛡️ 全程保险覆盖，无忧售后</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">详细流程时间线</h2>
            <p className="text-gray-600">了解每个步骤的具体时间安排</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200"></div>

              <div className="space-y-12">
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h4 className="font-semibold text-green-600">第1天</h4>
                    <p className="text-gray-600">发布需求，系统智能匹配</p>
                    <p className="text-sm text-gray-500">平台审核需求，推送给合适技师</p>
                  </div>
                  <div className="w-6 h-6 bg-green-600 rounded-full relative z-10 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1 pl-8">
                    <Badge className="bg-green-100 text-green-800">需求发布</Badge>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <Badge className="bg-blue-100 text-blue-800">技师响应</Badge>
                  </div>
                  <div className="w-6 h-6 bg-blue-600 rounded-full relative z-10 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1 pl-8">
                    <h4 className="font-semibold text-blue-600">第2-3天</h4>
                    <p className="text-gray-600">收到多个报价，对比选择</p>
                    <p className="text-sm text-gray-500">技师查看需求，提供详细报价</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h4 className="font-semibold text-orange-600">第4-7天</h4>
                    <p className="text-gray-600">确认技师，安排上门时间</p>
                    <p className="text-sm text-gray-500">签署协议，启动资金托管</p>
                  </div>
                  <div className="w-6 h-6 bg-orange-600 rounded-full relative z-10 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div className="flex-1 pl-8">
                    <Badge className="bg-orange-100 text-orange-800">协议签署</Badge>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <Badge className="bg-purple-100 text-purple-800">施工进行</Badge>
                  </div>
                  <div className="w-6 h-6 bg-purple-600 rounded-full relative z-10 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div className="flex-1 pl-8">
                    <h4 className="font-semibold text-purple-600">施工期间</h4>
                    <p className="text-gray-600">专业施工，质量监督</p>
                    <p className="text-sm text-gray-500">按计划执行，实时进度更新</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h4 className="font-semibold text-green-600">完工验收</h4>
                    <p className="text-gray-600">验收满意，释放资金</p>
                    <p className="text-sm text-gray-500">获得保修凭证，售后服务</p>
                  </div>
                  <div className="w-6 h-6 bg-green-600 rounded-full relative z-10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 pl-8">
                    <Badge className="bg-green-100 text-green-800">项目完成</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择BuildBridge</h2>
            <p className="text-gray-600">专为海外华人设计的服务保障</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold text-xl">中</span>
                </div>
                <h3 className="font-semibold mb-2">中文服务</h3>
                <p className="text-sm text-gray-600">全程中文沟通，消除语言障碍，让交流更顺畅</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">资金安全</h3>
                <p className="text-sm text-gray-600">第三方资金托管，完工验收后才释放付款</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">质量保证</h3>
                <p className="text-sm text-gray-600">严格技师认证，工作质量保修，售后无忧</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">24/7支持</h3>
                <p className="text-sm text-gray-600">全天候客服支持，及时解决问题和纠纷</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">常见问题</h2>
            <p className="text-gray-600">解答您最关心的问题</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">发布需求需要付费吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  发布需求完全免费！您只需在选定技师并开始工作后才需要支付费用。我们提供免费的需求发布、技师匹配和报价服务。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">如何保证技师的资质和可靠性？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  所有技师都经过严格的身份验证、资质认证和背景调查。我们要求技师提供相关证书、保险证明和工作经验证明。此外，用户评价系统也帮助筛选优质技师。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">资金托管如何保护我的利益？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  您的资金将由第三方安全托管，只有在您确认工作完成并满意后，资金才会释放给技师。如果出现纠纷，我们的客服团队会介入处理，确保您的权益。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">如果对工作质量不满意怎么办？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  我们提供工作质量保证。如果您对工作不满意，可以要求技师重新完成或修正。我们的客服团队也会协助处理争议，确保问题得到妥善解决。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备开始您的项目了吗？</h2>
          <p className="text-xl mb-8 text-green-100">
            加入数千名满意的海外华人用户，体验专业可靠的住房服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <Link href="/post-job">
                发布需求
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" asChild>
              <Link href="/browse-tradies">浏览技师</Link>
            </Button>
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
                <li><a href="#" className="hover:text-white">公司介绍</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
                <li><a href="#" className="hover:text-white">隐私政策</a></li>
                <li><a href="#" className="hover:text-white">服务条款</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 BuildBridge. 专为海外华人打造的住房服务平台。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

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
  Handshake,
  MapPin,
  Mail,
  Smartphone,
  TrendingUp,
  Award,
  Zap,
  Target,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function TradieSignupPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            技师工人<span className="text-blue-200">专业注册</span>
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            加入专为海外华人技师打造的工作平台，获得稳定客源，建立专业声誉
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/auth/register">立即注册</Link>
            </Button>
            
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">8,931</div>
              <p className="text-gray-600">上月发布工作</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">15,000+</div>
              <p className="text-gray-600">注册技师</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <p className="text-gray-600">平均评分</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">330k+</div>
              <p className="text-gray-600">信任房主</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Benefits */}
      <section id="benefits" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么技师选择BuildBridge</h2>
            <p className="text-gray-600">稳定收入，专业发展，建立声誉</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>稳定客源</CardTitle>
                <CardDescription>持续的工作机会，稳定收入来源</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-600 mr-3" />
                    <span>工作推送到邮箱和APP</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-blue-600 mr-3" />
                    <span>精准匹配您的技能</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-blue-600 mr-3" />
                    <span>24小时内回复报价</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>专业声誉</CardTitle>
                <CardDescription>建立可信任的专业品牌形象</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-3" />
                    <span>身份和资质认证</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-green-600 mr-3" />
                    <span>真实用户评价系统</span>
                  </div>
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 text-green-600 mr-3" />
                    <span>作品集展示空间</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>高效工具</CardTitle>
                <CardDescription>专业工具助力业务发展</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 text-purple-600 mr-3" />
                    <span>移动APP随时管理</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-purple-600 mr-3" />
                    <span>自动报价计算工具</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-purple-600 mr-3" />
                    <span>项目管理系统</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works for Tradies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技师工作流程</h2>
            <p className="text-gray-600">简单四步，开始赚钱</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">完善档案</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>上传资质证书</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>展示过往作品</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>设置服务区域</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">接收工作</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span>工作推送通知</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                  <span>匹配附近项目</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span>快速响应机会</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">提供报价</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-orange-600 mr-2" />
                  <span>合理定价建议</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 text-orange-600 mr-2" />
                  <span>与客户直接沟通</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-orange-600 mr-2" />
                  <span>详细方案说明</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">完成收款</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Handshake className="w-4 h-4 text-purple-600 mr-2" />
                  <span>专业服务交付</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-purple-600 mr-2" />
                  <span>安全资金托管</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-purple-600 mr-2" />
                  <span>获得用户好评</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技师成功故事</h2>
            <p className="text-gray-600">真实用户分享他们在BuildBridge的成长经历</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-blue-600">张师傅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">水电工程师</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">4.9 (156评价)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "自从加入BuildBridge，我的工作量增加了60%。中文沟通让我能更好地理解客户需求，平台的资金托管也让我放心接单。"
                </p>
                <div className="text-xs text-gray-500">
                  新西兰奥克兰 · 月均收入提升60%
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-green-600">李师傅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">装修师傅</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">4.8 (203评价)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "平台的客户质量很高，都是认真做项目的华人房主。通过BuildBridge，我建立了稳定的客户群，还有不少回头客。"
                </p>
                <div className="text-xs text-gray-500">
                  澳大利亚悉尼 · 回头客率达40%
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-purple-600">王师傅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">园艺师</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">5.0 (89评价)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "作为新移民，语言是我最大的障碍。BuildBridge的中文服务让我能够充分展示专业技能，现在已经有了固定的客户基础。"
                </p>
                <div className="text-xs text-gray-500">
                  加拿大多伦多 · 从零开始建立事业
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">注册要求</h2>
            <p className="text-gray-600">简单要求，快速通过审核</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  基础要求
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>有效身份证明文件</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>相关行业工作经验</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>基础中文沟通能力</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>当地合法工作资格</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 text-purple-600 mr-2" />
                  优先考虑
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>行业资质证书</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>商业保险证明</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>过往客户推荐</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>作品集展示</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技师常见问题</h2>
            <p className="text-gray-600">解答您最关心的问题</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">注册技师需要付费吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  注册和创建档案完全免费！我们只在您成功完成工作并收到付款后，收取少量服务费用。没有月费或年费。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">如何保证按时收到工作报酬？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  我们采用第三方资金托管系统，客户在确认工作开始前就将费用存入托管账户。工作完成并通过验收后，资金会及时释放给您。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">我可以选择接什么样的工作吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  当然可以！您可以设置工作类型偏好、服务区域范围、价格区间等。系统只会向您推送符合条件的工作机会，您有完全的选择权。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">新注册的技师如何获得第一个工作？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  新技师可以通过完善档案、上传作品集、获得朋友推荐等方式提高获单机会。我们也会优先向新技师推送一些合适的小型项目，帮助建立初期声誉。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备开始您的技师事业了吗？</h2>
          <p className="text-xl mb-8 text-blue-100">
            加入15,000+专业技师，在BuildBridge上建立您的事业
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/auth/register">
                立即注册
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
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
              <h4 className="font-semibold mb-4">技师服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/register" className="hover:text-white">技师注册</Link></li>
                <li><Link href="/browse-jobs" className="hover:text-white">浏览工作</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">技师中心</Link></li>
                <li><Link href="/faq" className="hover:text-white">常见问题</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">房主服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white">发布项目</Link></li>
                <li><Link href="/browse-tradies" className="hover:text-white">技师目录</Link></li>
                <li><Link href="/cost-estimator" className="hover:text-white">费用估算</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">如何运作</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">联系方式</Link></li>
                <li><Link href="/about" className="hover:text-white">关于我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">服务条款</Link></li>
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
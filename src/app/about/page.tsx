"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Shield,
  Globe,
  Heart,
  Target,
  TrendingUp,
  Home,
  MapPin,
  Calendar,
  Award,
  Handshake,
  Building
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">关于BuildBridge</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            我们是专为海外华人打造的住房维护与建筑服务平台，致力于连接业主与专业技师，
            为华人社区提供可信赖的中文服务体验。
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">我们的使命</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                为海外华人提供安全、透明、便捷的住房服务平台，消除语言和文化障碍，
                让每个华人家庭都能享受到专业可靠的技师服务，在异国他乡也能安心居住。
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-600">我们的愿景</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                成为全球海外华人首选的住房服务平台，建立覆盖北美、澳新等主要华人聚居地的
                服务网络，让华人无论走到哪里都能找到值得信赖的技师伙伴。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">我们的故事</CardTitle>
            <CardDescription className="text-center text-lg">
              BuildBridge诞生于海外华人的真实需求
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2023年初 - 问题发现</h4>
                  <p>
                    我们的创始团队在新西兰生活期间，深刻体会到海外华人在寻找可靠技师时面临的种种困难：
                    语言沟通障碍、文化差异、缺乏信任渠道、价格不透明等问题层出不穷。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <Handshake className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2023年中 - 团队组建</h4>
                  <p>
                    汇聚了来自技术、建筑、客服等不同领域的华人专业人士，我们决定为海外华人社区
                    打造一个专属的住房服务平台，让技师服务变得简单可信。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2024年 - 平台上线</h4>
                  <p>
                    BuildBridge正式上线，首先在新西兰市场启动。我们与本地优秀的华人技师和
                    认证的专业技师建立合作，为华人用户提供可靠的服务保障。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2025年 - 持续发展</h4>
                  <p>
                    平台不断优化用户体验，加强技师认证体系，扩展服务类别。我们正在计划
                    拓展至澳大利亚、加拿大等华人聚居地，为更多华人家庭提供服务。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">我们的核心价值观</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">以人为本</h3>
                <p className="text-gray-600 text-sm">
                  理解海外华人的真实需求，提供贴心的中文服务体验
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">安全可靠</h3>
                <p className="text-gray-600 text-sm">
                  严格的技师认证体系，资金托管保障，让每次服务都安心
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">开放包容</h3>
                <p className="text-gray-600 text-sm">
                  欢迎不同背景的技师加入，为华人用户提供多元化选择
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">持续创新</h3>
                <p className="text-gray-600 text-sm">
                  不断优化平台功能，引入AI技术，提升用户体验
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team & Stats */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-600" />
                我们的团队
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">技术开发团队</span>
                  <Badge className="bg-blue-100 text-blue-800">12人</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">客服支持团队</span>
                  <Badge className="bg-green-100 text-green-800">8人</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">质量监督团队</span>
                  <Badge className="bg-purple-100 text-purple-800">6人</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">市场运营团队</span>
                  <Badge className="bg-orange-100 text-orange-800">5人</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-green-600" />
                服务覆盖
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🇳🇿 新西兰</span>
                  <Badge className="bg-green-100 text-green-800">已上线</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🇦🇺 澳大利亚</span>
                  <Badge className="bg-yellow-100 text-yellow-800">筹备中</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🇨🇦 加拿大</span>
                  <Badge className="bg-gray-100 text-gray-800">规划中</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🇺🇸 美国</span>
                  <Badge className="bg-gray-100 text-gray-800">规划中</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              加入BuildBridge大家庭
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              无论您是需要找技师的业主，还是希望为华人社区服务的专业技师，
              BuildBridge都欢迎您的加入。让我们一起建设更好的华人服务生态。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/post-job">
                  <Home className="w-5 h-5 mr-2" />
                  发布项目需求
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600" asChild>
                <Link href="/register-tradie">
                  <Handshake className="w-5 h-5 mr-2" />
                  成为合作技师
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            如果您对BuildBridge有任何疑问或建议，请联系我们
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">联系我们</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

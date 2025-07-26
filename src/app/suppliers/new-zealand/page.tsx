"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Home,
  Users,
  DollarSign,
  Building2,
  Star,
  Shield,
  CheckCircle,
  Package,
  Calculator,
  CreditCard,
  FileText,
  Play,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  MapPin
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/Navigation"

export default function NewZealandSuppliersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage="suppliers" />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-green-600">首页</Link>
            <span className="text-gray-400">/</span>
            <Link href="/suppliers" className="text-gray-500 hover:text-green-600">配件供应商</Link>
            <span className="text-gray-400">/</span>
            <span className="text-green-600 font-medium">新西兰</span>
          </div>
        </div>
      </div>

      {/* Country Header */}
      <div className="bg-green-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-3xl">🇳🇿</span>
            <h1 className="text-3xl font-bold">新西兰配件供应商网络</h1>
          </div>
          <p className="text-green-100 max-w-2xl mx-auto">
            专为新西兰华人群体设计的配件采购网络，享受集团议价优势
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4 flex justify-center items-center space-x-12">
          <div className="text-center">
            <span className="text-sm opacity-90">新西兰华人群体</span>
            <span className="text-lg font-bold ml-2">150万+</span>
          </div>
          <div className="text-center">
            <span className="text-sm opacity-90">新西兰节省总额</span>
            <span className="text-lg font-bold ml-2">$250,000*</span>
          </div>
          <div className="text-center">
            <span className="text-sm opacity-90">新西兰合作供应商</span>
            <span className="text-lg font-bold ml-2">80+</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">新西兰配件供应商网络</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            加入BuildBridge新西兰配件供应商网络，享受集团采购优势，获得专业配件折扣优惠
          </p>
        </div>

        {/* Three Value Propositions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* 150万+ Members */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                超过150万的<br />新西兰华人群体
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              加入BuildBridge新西兰网络，您将与超过150万新西兰华人业主和技师以及数千家供应商组成采购联盟。
              这是强大的新西兰本地议价实力。
            </p>
            <p className="text-gray-600">
              我们称之为新西兰集团采购力量——您可以称之为花更少钱买更多东西。
            </p>
          </div>

          {/* Local NZ Suppliers */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                新西兰本地供应商<br />专属折扣价格
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              我们精选了新西兰最优质的配件供应商，涵盖您生活，服务，建筑和装修项目所需的几乎所有配件。
            </p>
            <p className="text-gray-600">
              我们与新西兰范围内的值得信赖的本地供应商签订了合作协议。
            </p>
          </div>

          {/* Your NZ Project */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                您的新西兰<br />项目
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              您可以立即获得我们新西兰采购专家为您协商的独家配件折扣优惠。
            </p>
            <p className="text-gray-600">
              凭借在新西兰超过20年的采购经验——您可以放心，我们为您提供最优质的新西兰本地服务。
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">观看我们的新西兰配件采购流程介绍</h2>
          <div className="relative max-w-md mx-auto">
            <div className="bg-green-600 rounded-lg p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700"></div>
              <div className="relative z-10 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100"
                >
                  <Play className="w-5 h-5 mr-2" />
                  新西兰配件采购如何运作
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              开始使用
            </Button>
          </div>
        </div>

        {/* New Zealand Supplier Logos */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            BuildBridge新西兰会员可享受这些供应商折扣优惠：
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* New Zealand specific supplier logos */}
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Bunnings NZ</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Mitre 10</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">PlaceMakers</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">ITM Building</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Hammer Hardware</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Carters</span>
            </div>
          </div>
          <div className="text-center mt-8 space-x-4">
            <Button variant="outline" className="border-green-600 text-green-600">
              浏览新西兰供应商
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              立即开始
            </Button>
          </div>
        </div>

        {/* New Zealand Specific Benefits */}
        <div className="bg-gray-50 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">作为BuildBridge新西兰会员</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                您可以从我们的任意新西兰供应商处购买配件——使用越多，节省越多
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                如果您目前已从我们的某家新西兰供应商处采购，我们可以将您的现有账户连接到BuildBridge新西兰价格体系
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                您保持与新西兰供应商的直接关系；按照平常方式采购——只是价格更低
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                您可以信任我们的新西兰供应商。要成为BuildBridge新西兰网络的一部分，供应商必须通过我们新西兰采购专家的严格招标、谈判和审查流程
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                完全访问我们的新西兰自助服务网站。登录查看您的月度配件采购和节省报告，开设和关联账户，发送查询等
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                此外，加入时，我们友好的新西兰团队的咨询服务将帮助您充分利用会员资格，识别BuildBridge可以帮助您降低新西兰项目成本的领域
              </p>
            </div>
          </div>
          <p className="text-gray-600 mt-6">
            新西兰会员费用根据业务结构和规模确定。开始使用以了解更多信息。
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              立即开始
            </Button>
          </div>
        </div>

        {/* Purchase Methods */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            通过BuildBridge为您的新西兰项目采购折扣配件和服务
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* On Account */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle>新西兰月付账户</CardTitle>
                <CardDescription>现在与新西兰供应商交易。接收月度发票。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 新西兰项目使用</li>
                  <li>• 80+ 新西兰供应商</li>
                  <li>• 月付发票方式</li>
                  <li>• 免费月度报告</li>
                </ul>
                <Button variant="outline" className="w-full">
                  了解更多
                </Button>
              </CardContent>
            </Card>

            {/* Trade Card */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle>新西兰采购卡</CardTitle>
                <CardDescription>现金/刷卡购买新西兰配件。随时享受折扣。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 新西兰项目使用</li>
                  <li>• 精选新西兰供应商</li>
                  <li>• 结账时现金/刷卡支付</li>
                  <li>• iOS & Android应用</li>
                </ul>
                <Button variant="outline" className="w-full">
                  了解更多
                </Button>
              </CardContent>
            </Card>

            {/* Calculator */}
            <Card className="text-center bg-green-600 text-white">
              <CardHeader>
                <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white">在新西兰您能节省多少？</CardTitle>
                <CardDescription className="text-green-100">
                  了解150万+新西兰华人会员的集团采购力量能为您节省多少。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-green-100 mb-6 font-medium">
                  试用我们快速简便的新西兰在线节省计算器。
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  立即试用
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <p className="text-gray-600 mb-6">
            <Link href="/suppliers/new-zealand" className="text-green-600 hover:underline">点击这里</Link>
            查看BuildBridge新西兰供应商的完整范围。
          </p>
          <p className="text-gray-600 mb-8">
            在我们的开始使用页面填写表单，我们的新西兰团队成员将与您联系。
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            立即开始
          </Button>
        </div>

        {/* Customer Reviews */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">95</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">新西兰当前NPS评分 95</h3>
                <p className="text-gray-600 text-sm">
                  新西兰专业服务NPS行业平均水平 78
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">新西兰会员评价</h3>
              <div className="space-y-6">
                <blockquote className="text-gray-700">
                  <p className="mb-2">
                    "BuildBridge让我在奥克兰找到了可靠的中文服务技师，沟通无障碍，工作质量很好！"
                  </p>
                  <footer className="text-sm text-gray-500">— 李师傅，奥克兰</footer>
                </blockquote>
                <blockquote className="text-gray-700">
                  <p className="mb-2">
                    "新西兰的配件折扣让我很放心，技师很专业，价格也很透明。强烈推荐给华人朋友！"
                  </p>
                  <footer className="text-sm text-gray-500">— 陈女士，惠灵顿</footer>
                </blockquote>
                <blockquote className="text-gray-700">
                  <p className="mb-2">
                    "从发布需求到完工只用了一周时间，效率很高。技师和建材供应都很靠谱。"
                  </p>
                  <footer className="text-sm text-gray-500">— 王师傅，基督城</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BuildBridge</span>
              </div>
              <p className="text-gray-400">新西兰华人配件采购与建筑服务平台</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">业主服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white">发布项目</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">如何运作</Link></li>
                <li><Link href="/browse-tradies" className="hover:text-white">技师目录</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">供应商</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/suppliers/new-zealand" className="hover:text-white">新西兰配件供应商</Link></li>
                <li><Link href="/suppliers" className="hover:text-white">加入网络</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">新西兰联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>0800 BUILD NZ</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>nz@buildbridge.nz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>奥克兰, 新西兰</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuildBridge Limited. 保留所有权利。</p>
            <p className="text-sm mt-2">除非另有说明，节省金额基于新西兰平均12个月期间计算。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

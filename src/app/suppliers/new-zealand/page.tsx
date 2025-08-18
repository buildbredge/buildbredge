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

export default function NewZealandSuppliersPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-green-600">首页</Link>
            <span className="text-gray-400">/</span>
            <Link href="/suppliers" className="text-gray-500 hover:text-green-600">会员折扣</Link>
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
            <h1 className="text-3xl font-bold">新西兰会员折扣网络</h1>
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
          <h2 className="text-4xl font-bold text-gray-900 mb-6">新西兰会员折扣网络</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            加入BuildBridge新西兰会员折扣网络，享受集团采购优势，获得专业配件折扣优惠
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
                聚合全球6000万+<br />海外华人力量
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              整合地区商家促销与大宗团购（汽油/油卡，视频等）
            </p>
            <p className="text-gray-600">
              以规模优势拿更低价格，话更少的钱，买更好物。
            </p>
          </div>

          {/* Local NZ Suppliers */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                企业批发价<br />会员同享
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              用企业自有的批发采购条件，向会员开放同批次，同标准的长期折扣。
            </p>
            <p className="text-gray-600">
              价格透明，稳定供货，一键下单。花更少的钱，买更好物。
            </p>
          </div>

          {/* Your NZ Project */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                全球供应链源头<br />会员专享一条龙采购
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              依托多年全球供应链采购经验，为会员提供源头直采一条龙服务。
            </p>
            <p className="text-gray-600">
              产地质检，国际物流，清关报税，当地仓配，建造安装，售后追踪，真正享受源头价。
            </p>
          </div>
        </div>

      

        {/* New Zealand Supplier Logos */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            BuildBridge会员最新折扣：
          </h2>
        
          <div className="text-center mt-8 space-x-4">
            <Button variant="outline" className="border-green-600 text-green-600">
              最新团购信息
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              最新商家折扣
            </Button>
             <Button className="bg-orange-500 hover:bg-orange-600">
              最新产地特供
            </Button>
          </div>
        </div>

        {/* New Zealand Specific Benefits */}
        <div className="bg-gray-50 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">作为尊贵的BuildBidge会员</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                您可以参加超实惠的团购促销，使用越多，节省越多。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                你可以从与buildbridge合作的任何商家采购商品，出示会员号即可享受最低折扣。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                海外采购的质检，物流，安装，售后我们负责，您只需享受服务。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                您可以完全信任与我们合作的供应商。要成为BuildBridge供应网络的一部分，必须通过我们采购专家的严格招标、谈判和审查流程。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                只需登录会员区即可轻松查看各商家的最新折扣以及最新的团购信息。参与越多省的越多。
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-gray-700">
                Buildbridge只收取商家的补贴或是促销返点，不收取任何会员费用。真真正正为会员谋福利，降成本。
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              立即开始
            </Button>
          </div>
        </div>

        {/* Purchase Methods */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            通过BuildBridge为您的项目采购折扣配件和服务
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* On Account */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle>会员团购</CardTitle>
                <CardDescription>征集最新的大宗采购优惠信息，组织会员集体采购</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 会员更加所付款金额获得相应采购卡</li>
                  <li>• 随用随取，方便自如</li>
                  <li>• 发票齐全，账目清晰</li>
              
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
                <CardTitle>会员采购条码</CardTitle>
                <CardDescription>现金/刷卡购买商品。随时享受折扣。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• 合作商家均可使用</li>
                  <li>• 精选当地优秀供应商</li>
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
                <CardTitle className="text-white">在Buildbridge您能节省多少？</CardTitle>
                <CardDescription className="text-green-100">
                  了解华人会员的集团采购力量能为您节省多少。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-green-100 mb-6 font-medium">
                  试用我们快速简便的在线节省计算器。
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
            查看BuildBridge合作商家的最新促销
          </p>
          <p className="text-gray-600 mb-8">
            填写注册表单，成为BuildBridge新会员，享受无比畅快的折扣促销。
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            立即开始
          </Button>
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
                <li><Link href="/suppliers/new-zealand" className="hover:text-white">新西兰会员折扣</Link></li>
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

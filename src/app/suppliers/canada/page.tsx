"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  DollarSign,
  Building2,
  CheckCircle,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Link from "next/link"

export default function CanadaSuppliersPage() {
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
            <span className="text-green-600 font-medium">加拿大</span>
          </div>
        </div>
      </div>

      {/* Country Header */}
      <div className="bg-green-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-3xl">🇨🇦</span>
            <h1 className="text-3xl font-bold">加拿大会员折扣网络</h1>
          </div>
          <p className="text-green-100 max-w-2xl mx-auto">
            专为加拿大华人群体设计的配件采购网络，享受集团议价优势
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4 flex justify-center items-center space-x-12">
          <div className="text-center">
            <span className="text-sm opacity-90">加拿大华人群体</span>
            <span className="text-lg font-bold ml-2">180万+</span>
          </div>
          <div className="text-center">
            <span className="text-sm opacity-90">加拿大节省总额</span>
            <span className="text-lg font-bold ml-2">CAD $420,000*</span>
          </div>
          <div className="text-center">
            <span className="text-sm opacity-90">加拿大合作供应商</span>
            <span className="text-lg font-bold ml-2">150+</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">加拿大会员折扣网络</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            加入BuildBridge加拿大会员折扣网络，享受集团采购优势，获得专业配件折扣优惠
          </p>
        </div>

        {/* Three Value Propositions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* 180万+ Members */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                超过180万的<br />加拿大华人群体
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              加入BuildBridge加拿大网络，您将与超过180万加拿大华人业主和技师以及数千家供应商组成采购联盟。
            </p>
            <p className="text-gray-600">
              我们称之为加拿大集团采购力量——享受最优惠的价格。
            </p>
          </div>

          {/* Local CA Suppliers */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                加拿大本地供应商<br />专属折扣价格
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              我们精选了加拿大最优质的会员折扣，涵盖您生活，服务，建筑和装修项目所需的几乎所有配件。
            </p>
            <p className="text-gray-600">
              我们与加拿大范围内的值得信赖的本地供应商签订了合作协议。
            </p>
          </div>

          {/* Your CA Project */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                您的加拿大<br />项目
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              您可以立即获得我们加拿大采购专家为您协商的独家配件折扣优惠。
            </p>
            <p className="text-gray-600">
              凭借在加拿大超过18年的采购经验——您可以放心，我们为您提供最优质的加拿大本地服务。
            </p>
          </div>
        </div>

        {/* Canada Supplier Logos */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            BuildBridge加拿大会员可享受这些供应商折扣优惠：
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* Canada specific supplier logos */}
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Home Depot CA</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Lowe's Canada</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Rona</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Canadian Tire</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">BMR</span>
            </div>
            <div className="bg-gray-100 h-16 rounded flex items-center justify-center">
              <span className="text-gray-500 font-medium">Kent Building</span>
            </div>
          </div>
          <div className="text-center mt-8 space-x-4">
            <Button variant="outline" className="border-green-600 text-green-600">
              浏览加拿大供应商
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              立即开始
            </Button>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-blue-50 rounded-lg p-8 mb-20 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">加拿大网络即将上线</h3>
          <p className="text-blue-700 mb-6">
            我们正在加拿大建立更大的供应商网络。预计2025年第三季度全面启动。
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">多伦多、温哥华、蒙特利尔技师网络</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">加拿大本地供应商折扣协议</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">加元计价和加拿大本地支付</span>
            </div>
          </div>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
            预约加拿大服务
          </Button>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-8">
            目前我们的加拿大服务正在建设中。如有急需，请联系我们的新西兰团队。
          </p>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/suppliers/new-zealand">访问新西兰服务</Link>
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              联系我们
            </Button>
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
              <p className="text-gray-400">加拿大华人配件采购与建筑服务平台</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">业主服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white">发布项目</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">获得工作</Link></li>
                <li><Link href="/browse-tradies" className="hover:text-white">技师目录</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">供应商</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/suppliers/canada" className="hover:text-white">加拿大会员折扣</Link></li>
                <li><Link href="/suppliers" className="hover:text-white">加入网络</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">加拿大联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-BUILD-CA</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>ca@buildbridge.ca</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>多伦多, 加拿大</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuildBridge Limited. 保留所有权利。</p>
            <p className="text-sm mt-2">加拿大服务即将推出，敬请期待。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

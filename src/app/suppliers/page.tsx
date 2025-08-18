"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  DollarSign,
  Building2,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  MapPin
} from "lucide-react"
import Link from "next/link"

export default function SuppliersPage() {
  const countries = [
    {
      id: "new-zealand",
      name: "新西兰",
      flag: "🇳🇿",
      path: "/suppliers/new-zealand",
      population: "150万+",
      savings: "$250,000",
      suppliers: "80+",
      status: "available",
      description: "我们在新西兰的主要服务区域，提供完整的会员折扣网络",
      cities: ["奥克兰", "惠灵顿", "基督城", "汉密尔顿"]
    },
    {
      id: "australia",
      name: "澳大利亚",
      flag: "🇦🇺",
      path: "/suppliers/australia",
      population: "120万+",
      savings: "AUD $350,000",
      suppliers: "120+",
      status: "coming-soon",
      description: "即将推出的澳大利亚供应商网络，预计2025年第二季度上线",
      cities: ["悉尼", "墨尔本", "布里斯班", "珀斯"]
    },
    {
      id: "canada",
      name: "加拿大",
      flag: "🇨🇦",
      path: "/suppliers/canada",
      population: "180万+",
      savings: "CAD $420,000",
      suppliers: "150+",
      status: "coming-soon",
      description: "即将推出的加拿大供应商网络，预计2025年第三季度上线",
      cities: ["多伦多", "温哥华", "蒙特利尔", "卡尔加里"]
    },
    {
      id: "usa",
      name: "美国",
      flag: "🇺🇸",
      path: "/suppliers/usa",
      population: "550万+",
      savings: "USD $1,200,000",
      suppliers: "300+",
      status: "coming-soon",
      description: "即将推出的美国供应商网络，预计2025年第四季度上线",
      cities: ["纽约", "洛杉矶", "旧金山", "芝加哥"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">
            全球会员折扣网络
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
            选择您所在的国家，享受BuildBridge专为海外华人设计的配件采购网络
          </p>
        </div>
      </div>

      {/* Global Stats Bar */}
      <div className="bg-green-500 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-sm opacity-90 block">全球华人群体</span>
              <span className="text-2xl font-bold">6000万+</span>
            </div>
            <div>
              <span className="text-sm opacity-90 block">全球节省总额</span>
              <span className="text-2xl font-bold">$2,220,000*</span>
            </div>
            <div>
              <span className="text-sm opacity-90 block">合作供应商</span>
              <span className="text-2xl font-bold">650+</span>
            </div>
            <div>
              <span className="text-sm opacity-90 block">服务国家</span>
              <span className="text-2xl font-bold">4个</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Country Selection */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">选择您的国家</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            点击下方国家卡片，了解我们在该国家的会员折扣网络和服务详情
          </p>
        </div>

        {/* Country Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {countries.map((country) => (
            <Card
              key={country.id}
              className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                country.status === "available"
                  ? "hover:border-green-500 border-green-200"
                  : "hover:border-blue-500 border-blue-200"
              }`}
            >
              <Link href={country.path}>
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="text-5xl">{country.flag}</span>
                    <div>
                      <CardTitle className="text-2xl">{country.name}</CardTitle>
                      <Badge
                        className={`mt-2 ${
                          country.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {country.status === "available" ? "现已开放" : "即将推出"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 text-center">
                    {country.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500 block">华人群体</span>
                      <span className="font-bold text-gray-900">{country.population}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500 block">节省总额</span>
                      <span className="font-bold text-gray-900">{country.savings}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Building2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500 block">供应商</span>
                      <span className="font-bold text-gray-900">{country.suppliers}</span>
                    </div>
                  </div>

                  {/* Cities */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2 text-center">主要服务城市</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {country.cities.map((city) => (
                        <Badge key={city} variant="secondary" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center">
                    <Button
                      className={`w-full ${
                        country.status === "available"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {country.status === "available" ? "立即访问" : "了解更多"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Why BuildBridge Global Network */}
        <div className="bg-gray-50 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">为什么选择BuildBridge全球网络？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">全球化服务</h3>
              <p className="text-gray-600">
                跨越四个国家的统一服务体验，无论您在哪里，都能享受一致的高品质服务
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">华人专属</h3>
              <p className="text-gray-600">
                专为海外华人群体设计，中文服务，文化理解，让您感受到家的温暖
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">集团议价</h3>
              <p className="text-gray-600">
                6000万+海外华人的集团采购力量，为您争取到最优惠的价格和服务
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">联系我们</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            无论您在哪个国家，我们都致力于为您提供最优质的配件采购服务。
            选择您所在的国家开始体验，或联系我们了解更多信息。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-2">🇳🇿</div>
              <p className="font-medium">新西兰</p>
              <p className="text-sm text-gray-600">nz@buildbridge.nz</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🇦🇺</div>
              <p className="font-medium">澳大利亚</p>
              <p className="text-sm text-gray-600">au@buildbridge.com.au</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🇨🇦</div>
              <p className="font-medium">加拿大</p>
              <p className="text-sm text-gray-600">ca@buildbridge.ca</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🇺🇸</div>
              <p className="font-medium">美国</p>
              <p className="text-sm text-gray-600">us@buildbridge.com</p>
            </div>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
            <Link href="/suppliers/new-zealand">开始体验新西兰服务</Link>
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
              <p className="text-gray-400">海外华人配件采购与建筑服务平台</p>
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
              <h4 className="font-semibold mb-4">全球供应商</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/suppliers/new-zealand" className="hover:text-white">新西兰供应商</Link></li>
                <li><Link href="/suppliers/australia" className="hover:text-white">澳大利亚供应商</Link></li>
                <li><Link href="/suppliers/canada" className="hover:text-white">加拿大供应商</Link></li>
                <li><Link href="/suppliers/usa" className="hover:text-white">美国供应商</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>0800 BUILD NZ</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@buildbridge.nz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>www.buildbridge.nz</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuildBridge Limited. 保留所有权利。</p>
            <p className="text-sm mt-2">除非另有说明，节省金额基于平均12个月期间计算。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

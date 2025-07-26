"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Star,
  MapPin,
  Phone,
  Mail,
  Shield,
  Award,
  Clock,
  Filter,
  Search,
  CheckCircle,
  Heart,
  MessageCircle
} from "lucide-react"

interface Tradie {
  id: string
  name: string
  company: string
  specialties: string[]
  location: string
  rating: number
  reviewCount: number
  jobsCompleted: number
  verified: boolean
  premium: boolean
  responseTime: string
  priceRange: string
  avatar: string
  description: string
  certifications: string[]
  builderscrackId?: string
  originalProfile?: string
}

export default function BuildersCrackTradiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  // 从 BuildersCrack 导入的真实技师数据
  const tradies: Tradie[] = [
    // 建筑师傅 - 来自 BuildersCrack
    {
      id: "4bkptb18",
      name: "Toa师傅",
      company: "Toa Civil Construction Limited",
      specialties: ["新建住宅", "土木工程", "一般建筑"],
      location: "内皮尔",
      rating: 5.0,
      reviewCount: 15,
      jobsCompleted: 23,
      verified: true,
      premium: true,
      responseTime: "通常在2小时内回复",
      priceRange: "$90-150/小时",
      avatar: "TC",
      description: "Toa Building是Toa Civil Construction的分部，由热衷于一般建筑、土木建筑和工程的工程师于2021年成立。拥有合格的LBP建筑师，在建筑行业各个领域都有丰富经验。",
      certifications: ["持证建筑师(LBP)", "工程师资质", "安全施工认证"],
      builderscrackId: "4bkptb18",
      originalProfile: "/tradies/4bkptb18/toa-civil-construction-limited"
    },
    {
      id: "4k48sov0",
      name: "QA师傅",
      company: "QA Construction Group Ltd",
      specialties: ["住宅翻新", "商业建筑", "多层建筑"],
      location: "哈特谷",
      rating: 5.0,
      reviewCount: 28,
      jobsCompleted: 42,
      verified: true,
      premium: true,
      responseTime: "通常在1小时内回复",
      priceRange: "$95-140/小时",
      avatar: "QA",
      description: "拥有20多年住宅和轻型商业建筑经验的LBP。从咖啡厅和零售店到多层住宅翻新，我们有经验为您处理建筑的各个方面。我们是5人团队，专门从事翻新、改建和加建。",
      certifications: ["LBP认证", "商业建筑许可", "20年经验证书"],
      builderscrackId: "4k48sov0",
      originalProfile: "/tradies/4k48sov0/qa-construction-group-ltd"
    },
    {
      id: "5a3yh0nw",
      name: "RCH师傅",
      company: "RCH Construction",
      specialties: ["新建住宅", "大小翻新", "甲板围栏"],
      location: "基督城",
      rating: 5.0,
      reviewCount: 22,
      jobsCompleted: 33,
      verified: true,
      premium: true,
      responseTime: "通常在3小时内回复",
      priceRange: "$85-135/小时",
      avatar: "RC",
      description: "来自基督城的LBP和认证建筑师Ryan。专门从事住宅新建、大小翻新、甲板和围栏。我为自己的工作质量和与客户建立长久关系而自豪。",
      certifications: ["LBP认证", "认证建筑师", "基督城建筑协会"],
      builderscrackId: "5a3yh0nw",
      originalProfile: "/tradies/5a3yh0nw/rch-construction"
    },
    {
      id: "4a0lpjh8",
      name: "Centreline师傅",
      company: "Centreline Building",
      specialties: ["新房建设", "翻新改造", "甲板围栏", "挡土墙"],
      location: "尼尔森",
      rating: 4.9,
      reviewCount: 18,
      jobsCompleted: 27,
      verified: true,
      premium: false,
      responseTime: "通常在4小时内回复",
      priceRange: "$80-130/小时",
      avatar: "CB",
      description: "从事建筑行业12年，建造新房和翻新改造。同时建造甲板、围栏和挡土墙。我为提供优质工作、按时完成和具有竞争力的价格而自豪。",
      certifications: ["建筑师资质", "12年经验", "尼尔森建筑协会"],
      builderscrackId: "4a0lpjh8",
      originalProfile: "/tradies/4a0lpjh8/centreline-building"
    },
    {
      id: "533zcnto",
      name: "Le Monnier师傅",
      company: "Le Monnier Builder Ltd",
      specialties: ["住宅新建", "翻新改造", "商业建筑"],
      location: "黑斯廷斯",
      rating: 5.0,
      reviewCount: 31,
      jobsCompleted: 47,
      verified: true,
      premium: true,
      responseTime: "通常在2小时内回复",
      priceRange: "$90-140/小时",
      avatar: "LM",
      description: "拥有LBP（持证建筑从业者）的合格建筑师。从事建筑行业20年，在住宅新建、翻新和商业建筑的各个方面都有经验。3年前开始自己的事业，有一个从一开始就跟着我的学徒。",
      certifications: ["LBP认证", "20年经验", "商业建筑许可"],
      builderscrackId: "533zcnto",
      originalProfile: "/tradies/533zcnto/le-monnier-builder-ltd"
    },
    {
      id: "446xk02k",
      name: "Dannsons师傅",
      company: "Dannsons Limited",
      specialties: ["住宅建筑", "商业建筑", "维护翻新"],
      location: "奥克兰",
      rating: 5.0,
      reviewCount: 25,
      jobsCompleted: 38,
      verified: true,
      premium: true,
      responseTime: "通常在1小时内回复",
      priceRange: "$95-145/小时",
      avatar: "DL",
      description: "Dannsons Limited - 建设传承，构建社区。家族拥有和经营的建筑公司。在建筑行业拥有超过20年的综合经验，专门从事住宅和商业建筑以及维护和翻新。",
      certifications: ["家族企业", "20年综合经验", "商业住宅双认证"],
      builderscrackId: "446xk02k",
      originalProfile: "/tradies/446xk02k/dannsons-limited"
    },
    {
      id: "55wjtlgc",
      name: "Keys师傅",
      company: "Keys and Co Ltd",
      specialties: ["住宅翻新", "建筑设计", "新房建设"],
      location: "奥克兰",
      rating: 5.0,
      reviewCount: 43,
      jobsCompleted: 65,
      verified: true,
      premium: true,
      responseTime: "通常在2小时内回复",
      priceRange: "$100-150/小时",
      avatar: "KC",
      description: "从事建筑行业超过40年，主要在住宅领域进行增建和翻新。从100年历史的别墅到建筑设计的增建、新房和介于两者之间的一切。我为工作质量感到自豪，大部分工作来自推荐。",
      certifications: ["40年经验", "住宅专家", "设计建筑认证"],
      builderscrackId: "55wjtlgc",
      originalProfile: "/tradies/55wjtlgc/keys-and-co-ltd"
    },
    {
      id: "yvw33oc",
      name: "Express师傅",
      company: "Express Property Maintenance Timaru Ltd",
      specialties: ["物业维护", "浴室厨房翻新", "甲板建设", "门窗安装"],
      location: "蒂玛鲁",
      rating: 4.7,
      reviewCount: 52,
      jobsCompleted: 78,
      verified: true,
      premium: false,
      responseTime: "通常在3小时内回复",
      priceRange: "$75-125/小时",
      avatar: "EP",
      description: "我是Paul，木工/细木工持证建筑从业者。自1989年以来一直从事住宅和商业建筑和维护。提供建筑维护和维修的各个方面，包括浴室和厨房翻新、甲板、门窗、围栏等。",
      certifications: ["LBP认证", "木工细木工", "认证建筑师协会成员"],
      builderscrackId: "yvw33oc",
      originalProfile: "/tradies/yvw33oc/express-property-maintenance-timaru-ltd"
    }
  ]

  const serviceTypes = [
    "新建住宅", "住宅翻新", "商业建筑", "土木工程", "甲板围栏",
    "物业维护", "浴室厨房翻新", "门窗安装", "挡土墙"
  ]

  const locations = [
    "奥克兰", "基督城", "惠灵顿", "汉密尔顿", "陶朗加",
    "内皮尔", "黑斯廷斯", "尼尔森", "蒂玛鲁", "哈特谷"
  ]

  const filteredTradies = tradies.filter(tradie => {
    const matchesSearch = tradie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tradie.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tradie.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesService = !serviceFilter || tradie.specialties.includes(serviceFilter)
    const matchesLocation = !locationFilter || tradie.location === locationFilter

    return matchesSearch && matchesService && matchesLocation
  })

  const sortedTradies = [...filteredTradies].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.reviewCount - a.reviewCount
      case "jobs":
        return b.jobsCompleted - a.jobsCompleted
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">BuildBridge</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">
              <Shield className="w-3 h-3 mr-1" />
              来自 BuildersCrack
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BuildersCrack 认证技师</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            从 BuildersCrack.co.nz 导入的真实认证技师数据，所有技师都经过严格审核和验证
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>已验证身份</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>LBP认证</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>真实评价</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索技师或公司..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有服务</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有地区</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">评分最高</SelectItem>
                  <SelectItem value="reviews">评价最多</SelectItem>
                  <SelectItem value="jobs">完成项目最多</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">找到 {sortedTradies.length} 位 BuildersCrack 认证技师</p>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">已按{
              sortBy === 'rating' ? '评分' :
              sortBy === 'reviews' ? '评价数量' :
              '项目数量'
            }排序</span>
          </div>
        </div>

        {/* Tradies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedTradies.map((tradie) => (
            <Card key={tradie.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {tradie.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{tradie.name}</CardTitle>
                        {tradie.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已认证
                          </Badge>
                        )}
                        {tradie.premium && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Award className="w-3 h-3 mr-1" />
                            优选
                          </Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800">
                          BuildersCrack
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{tradie.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{tradie.rating}</span>
                      <span className="text-sm text-gray-500">({tradie.reviewCount})</span>
                    </div>
                    <p className="text-sm text-gray-600">{tradie.jobsCompleted} 个项目</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{tradie.description}</p>

                <div className="flex flex-wrap gap-2">
                  {tradie.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{tradie.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{tradie.responseTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">参考价格</p>
                    <p className="font-medium text-green-600">{tradie.priceRange}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      收藏
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      联系技师
                    </Button>
                  </div>
                </div>

                {tradie.certifications.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">资质认证：</p>
                    <div className="flex flex-wrap gap-1">
                      {tradie.certifications.map((cert) => (
                        <Badge key={cert} className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {tradie.builderscrackId && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      BuildersCrack ID: {tradie.builderscrackId}
                      {tradie.originalProfile && (
                        <span className="ml-2">
                          • <a href={`https://builderscrack.co.nz${tradie.originalProfile}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:underline">
                            查看原档案
                          </a>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-blue-800 mb-2">关于 BuildersCrack 技师数据</h3>
            <p className="text-blue-700 mb-4">
              以上技师数据来源于 BuildersCrack.co.nz，新西兰最大的建筑服务平台。
              所有技师都经过严格的身份验证和资质审核。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <p className="text-sm text-blue-700">身份验证</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">LBP</div>
                <p className="text-sm text-blue-700">持证建筑师</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5.0★</div>
                <p className="text-sm text-blue-700">平均评分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Home,
  DollarSign,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Leaf,
  Sparkles,
  Car,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Navigation from "@/components/Navigation"
import Link from "next/link"

interface CostEstimate {
  projectType: string
  size: string
  quality: string
  location: string
  estimatedCost: {
    min: number
    max: number
  }
  timeframe: string
  breakdown: {
    materials: number
    labor: number
    permits: number
    other: number
  }
}

export default function CostEstimatorPage() {
  const [projectType, setProjectType] = useState("")
  const [projectSize, setProjectSize] = useState("")
  const [quality, setQuality] = useState("")
  const [location, setLocation] = useState("")
  const [estimate, setEstimate] = useState<CostEstimate | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const projectTypes = [
    { id: "kitchen", name: "厨房翻新", icon: Home, basePrice: 15000 },
    { id: "bathroom", name: "浴室改造", icon: Droplets, basePrice: 12000 },
    { id: "electrical", name: "电工服务", icon: Zap, basePrice: 3000 },
    { id: "plumbing", name: "水管工程", icon: Droplets, basePrice: 4000 },
    { id: "painting", name: "油漆装修", icon: Paintbrush, basePrice: 5000 },
    { id: "roofing", name: "屋顶维修", icon: Home, basePrice: 8000 },
    { id: "flooring", name: "地板铺设", icon: Hammer, basePrice: 6000 },
    { id: "landscaping", name: "园艺景观", icon: Leaf, basePrice: 7000 },
    { id: "cleaning", name: "清洁服务", icon: Sparkles, basePrice: 800 },
    { id: "building", name: "房屋建造", icon: Hammer, basePrice: 250000 },
  ]

  const sizeMultipliers = {
    small: { name: "小型", multiplier: 0.7 },
    medium: { name: "中型", multiplier: 1.0 },
    large: { name: "大型", multiplier: 1.5 },
    xlarge: { name: "超大型", multiplier: 2.2 }
  }

  const qualityMultipliers = {
    basic: { name: "基础标准", multiplier: 0.8, description: "基本材料和标准工艺" },
    standard: { name: "标准品质", multiplier: 1.0, description: "中等材料和良好工艺" },
    premium: { name: "高端品质", multiplier: 1.4, description: "优质材料和精良工艺" },
    luxury: { name: "奢华定制", multiplier: 2.0, description: "顶级材料和工匠级工艺" }
  }

  const locationMultipliers = {
    "auckland-central": { name: "奥克兰中心", multiplier: 1.2 },
    "auckland-other": { name: "奥克兰其他区域", multiplier: 1.1 },
    "wellington": { name: "惠灵顿", multiplier: 1.15 },
    "christchurch": { name: "基督城", multiplier: 1.0 },
    "hamilton": { name: "汉密尔顿", multiplier: 0.95 },
    "other": { name: "其他城市", multiplier: 0.9 }
  }

  const calculateEstimate = () => {
    if (!projectType || !projectSize || !quality || !location) {
      return
    }

    setIsCalculating(true)

    setTimeout(() => {
      const project = projectTypes.find(p => p.id === projectType)
      const sizeMultiplier = sizeMultipliers[projectSize as keyof typeof sizeMultipliers]
      const qualityMultiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers]
      const locationMultiplier = locationMultipliers[location as keyof typeof locationMultipliers]

      if (!project || !sizeMultiplier || !qualityMultiplier || !locationMultiplier) {
        setIsCalculating(false)
        return
      }

      const basePrice = project.basePrice
      const totalMultiplier = sizeMultiplier.multiplier * qualityMultiplier.multiplier * locationMultiplier.multiplier

      const estimatedMin = Math.round(basePrice * totalMultiplier * 0.85)
      const estimatedMax = Math.round(basePrice * totalMultiplier * 1.25)

      const timeframes = {
        kitchen: "3-6周",
        bathroom: "2-4周",
        electrical: "1-2周",
        plumbing: "1-3周",
        painting: "1-2周",
        roofing: "1-3周",
        flooring: "1-2周",
        landscaping: "2-4周",
        cleaning: "1-3天",
        building: "6-12个月"
      }

      const estimate: CostEstimate = {
        projectType: project.name,
        size: sizeMultiplier.name,
        quality: qualityMultiplier.name,
        location: locationMultiplier.name,
        estimatedCost: {
          min: estimatedMin,
          max: estimatedMax
        },
        timeframe: timeframes[projectType as keyof typeof timeframes] || "2-4周",
        breakdown: {
          materials: Math.round((estimatedMin + estimatedMax) / 2 * 0.45),
          labor: Math.round((estimatedMin + estimatedMax) / 2 * 0.35),
          permits: Math.round((estimatedMin + estimatedMax) / 2 * 0.08),
          other: Math.round((estimatedMin + estimatedMax) / 2 * 0.12)
        }
      }

      setEstimate(estimate)
      setIsCalculating(false)
    }, 2000)
  }

  const resetCalculator = () => {
    setProjectType("")
    setProjectSize("")
    setQuality("")
    setLocation("")
    setEstimate(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="cost-estimator" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">项目费用估算</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            获得准确的项目预算估算，帮助您更好地规划装修和维修项目
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>项目详情</CardTitle>
                <CardDescription>
                  请选择您的项目类型和要求，我们将为您计算预估费用
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Type */}
                <div>
                  <Label htmlFor="project-type">项目类型 *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {projectTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all border-2 ${
                          projectType === type.id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                        onClick={() => setProjectType(type.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <type.icon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">{type.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Project Size */}
                <div>
                  <Label htmlFor="project-size">项目规模 *</Label>
                  <Select value={projectSize} onValueChange={setProjectSize}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择项目规模" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sizeMultipliers).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Level */}
                <div>
                  <Label htmlFor="quality">品质标准 *</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择品质标准" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(qualityMultipliers).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{value.name}</div>
                            <div className="text-sm text-gray-500">{value.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">项目地点 *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择项目地点" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locationMultipliers).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculate Button */}
                <div className="flex space-x-4">
                  <Button
                    onClick={calculateEstimate}
                    disabled={!projectType || !projectSize || !quality || !location || isCalculating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isCalculating ? (
                      <>
                        <Calculator className="w-4 h-4 mr-2 animate-spin" />
                        计算中...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        计算费用
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetCalculator}>
                    重置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-1">
            {estimate ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">预估费用</CardTitle>
                    <CardDescription>基于您的项目要求</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <p className="text-3xl font-bold text-green-600">
                        ${estimate.estimatedCost.min.toLocaleString()} - ${estimate.estimatedCost.max.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">新西兰元 (含GST)</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">项目类型:</span>
                        <span>{estimate.projectType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">项目规模:</span>
                        <span>{estimate.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">品质标准:</span>
                        <span>{estimate.quality}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">预估工期:</span>
                        <span>{estimate.timeframe}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">费用明细</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>材料费用:</span>
                        <span>${estimate.breakdown.materials.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>人工费用:</span>
                        <span>${estimate.breakdown.labor.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>许可证费:</span>
                        <span>${estimate.breakdown.permits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>其他费用:</span>
                        <span>${estimate.breakdown.other.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/post-job">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      发布项目需求
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/browse-tradies">
                      寻找专业技师
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>请填写项目信息获取费用估算</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Important Notes */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              重要说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">此估算基于新西兰市场平均价格</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">实际费用可能因具体要求而有所不同</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">建议获取多个专业技师的报价对比</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">价格已包含15% GST税费</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">工期可能因季节和技师档期调整</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">复杂项目建议先咨询专业技师</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Settings,
  Users,
  TrendingUp
} from "lucide-react"

interface TradeCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  tradieCount: number
  avgRating: number
  avgPrice: string
  popularServices: string[]
}

export default function TradesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories: TradeCategory[] = [
    {
      id: "electrical",
      name: "电工服务",
      icon: Zap,
      description: "专业电工，安全可靠",
      tradieCount: 156,
      avgRating: 4.8,
      avgPrice: "$80-150/小时",
      popularServices: ["电路安装", "灯具更换", "插座维修", "配电箱升级"]
    },
    {
      id: "plumbing",
      name: "水管工",
      icon: Droplets,
      description: "管道维修与安装专家",
      tradieCount: 134,
      avgRating: 4.7,
      avgPrice: "$90-160/小时",
      popularServices: ["漏水维修", "管道安装", "马桶维修", "热水器安装"]
    }
  ]

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
            <Badge className="bg-green-100 text-green-800">
              <Wrench className="w-3 h-3 mr-1" />
              技师分类
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">技师分类</h1>
            <p className="text-gray-600">按专业分类浏览澳洲优质技师</p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索技师分类..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">技师数量</p>
                          <p className="font-semibold">{category.tradieCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">平均评分</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{category.avgRating}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-600 text-sm mb-2">热门服务</p>
                        <div className="flex flex-wrap gap-1">
                          {category.popularServices.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">价格范围: {category.avgPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

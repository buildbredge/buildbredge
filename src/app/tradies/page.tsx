"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"

// 模拟技师列表数据
const tradiesList = [
  {
    id: "zhang-shifu",
    name: "张师傅",
    companyName: "精工水电工程",
    rating: 4.8,
    reviewCount: 156,
    jobsCompleted: 234,
    location: "新西兰奥克兰",
    category: "水电工程",
    verified: true,
    skills: ["住宅水电安装", "水管维修", "电路改造"],
    responseTime: "2小时内"
  },
  {
    id: "li-shifu",
    name: "李师傅",
    companyName: "完美装修工作室",
    rating: 4.7,
    reviewCount: 203,
    jobsCompleted: 189,
    location: "澳大利亚悉尼",
    category: "装修翻新",
    verified: true,
    skills: ["厨房翻新", "浴室装修", "油漆粉刷"],
    responseTime: "1小时内"
  },
  {
    id: "wang-shifu",
    name: "王师傅",
    companyName: "绿色园艺服务",
    rating: 4.9,
    reviewCount: 89,
    jobsCompleted: 134,
    location: "加拿大多伦多",
    category: "园艺服务",
    verified: true,
    skills: ["草坪维护", "花园设计", "树木修剪"],
    responseTime: "3小时内"
  }
]

export default function TradiesListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">专业技师目录</h1>
            <p className="text-xl text-gray-600">找到您需要的专业技师，查看详细档案</p>
          </div>
        </div>
      </div>

      {/* Tradies List */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tradiesList.map((tradie) => (
            <Card key={tradie.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">
                      {tradie.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{tradie.name}</CardTitle>
                      {tradie.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已认证
                        </Badge>
                      )}
                    </div>
                    
                    <CardDescription className="mb-2">{tradie.companyName}</CardDescription>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(tradie.rating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{tradie.rating}</span>
                      <span className="text-xs text-gray-500">({tradie.reviewCount}评价)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{tradie.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{tradie.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {tradie.jobsCompleted}个项目
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {tradie.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    通常在{tradie.responseTime}回复
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/tradies/${tradie.id}`}>
                        查看详细档案
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Demo Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-2">演示说明</h3>
            <p className="text-sm text-blue-700 mb-3">
              这是技师详情页面的演示。点击"查看详细档案"按钮可以查看完整的技师介绍页面。
            </p>
            <p className="text-xs text-blue-600">
              页面路径格式：/tradies/[技师ID] - 例如：/tradies/zhang-shifu
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
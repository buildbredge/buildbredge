"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Calculator,
  DollarSign,
  Home as HomeIcon,
  Wrench,
  Paintbrush,
  Zap,
  Droplets,
  Leaf,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export default function CostEstimatorPage() {
  const [projectType, setProjectType] = useState("")
  const [estimate, setEstimate] = useState<number | null>(null)

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
              <Calculator className="w-3 h-3 mr-1" />
              费用估算
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">项目费用估算</h1>
            <p className="text-gray-600">获取您项目的准确费用估算</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>项目信息</CardTitle>
              <CardDescription>请填写项目详细信息获取准确估算</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="project-type">项目类型</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择项目类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen">厨房翻新</SelectItem>
                      <SelectItem value="bathroom">卫生间翻新</SelectItem>
                      <SelectItem value="electrical">电工服务</SelectItem>
                      <SelectItem value="plumbing">水管服务</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center pt-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-green-600 mb-2">准备开始您的项目了吗？</h3>
                    <p className="text-gray-600">发布您的项目需求，获取专业技师报价</p>
                  </div>
                  <Link href="/post-job">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      立即发布项目
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

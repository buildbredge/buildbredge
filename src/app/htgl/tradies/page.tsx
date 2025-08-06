"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Wrench,
  Search,
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  UserPlus,
  FileText,
  Download
} from "lucide-react"
import { useRouter } from "next/navigation"

// Simplified AdminLayout
function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const user = localStorage.getItem("adminUser")

    if (!token || !user) {
      router.push("/htgl/login")
      return
    }

    setAdminUser(JSON.parse(user))
  }, [router])

  if (!adminUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">检查登录状态...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-gray-900">BuildBridge 管理后台</h1>
              <div className="text-gray-300">|</div>
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{adminUser.name}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/htgl/login")}>
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li><a href="/htgl/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>仪表板</span></a></li>
              <li><a href="/htgl/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>用户管理</span></a></li>
              <li><a href="/htgl/tradies" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700"><Wrench className="w-5 h-5" /><span>技师管理</span></a></li>
              <li><a href="/htgl/suppliers" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>供应商管理</span></a></li>
              <li><a href="/htgl/support" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>客服管理</span></a></li>
              <li><a href="/htgl/complaints" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>投诉管理</span></a></li>
              <li><a href="/htgl/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>评价管理</span></a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function TradiesManagePage() {
  const [tradies, setTradies] = useState([
    {
      id: "1",
      name: "李师傅专业装修",
      contact: "李建华",
      email: "li@buildbridge.nz",
      phone: "+64 21 111 2222",
      specialties: ["厨房翻新", "浴室改造", "木工制作"],
      location: "奥克兰中心区",
      rating: 4.9,
      reviewCount: 127,
      completedJobs: 156,
      revenue: "$45,600",
      status: "verified",
      joinDate: "2023-08-15",
      licenses: ["Building License", "Electrical License"],
      insurance: "有效至 2025-12-31"
    },
    {
      id: "2",
      name: "王师傅电工服务",
      contact: "王明",
      email: "wang@buildbridge.nz",
      phone: "+64 21 222 3333",
      specialties: ["电路安装", "照明系统", "安全检查"],
      location: "奥克兰西区",
      rating: 4.8,
      reviewCount: 89,
      completedJobs: 203,
      revenue: "$52,300",
      status: "verified",
      joinDate: "2023-06-20",
      licenses: ["Electrical License"],
      insurance: "有效至 2025-08-15"
    },
    {
      id: "3",
      name: "刘师傅水管维修",
      contact: "刘强",
      email: "liu@buildbridge.nz",
      phone: "+64 21 333 4444",
      specialties: ["水管维修", "热水器安装", "排水系统"],
      location: "奥克兰南区",
      rating: 4.6,
      reviewCount: 64,
      completedJobs: 98,
      revenue: "$28,900",
      status: "pending",
      joinDate: "2024-01-10",
      licenses: ["Plumbing License"],
      insurance: "待审核"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [showTradieDialog, setShowTradieDialog] = useState(false)
  const [selectedTradie, setSelectedTradie] = useState<any>(null)

  const filteredTradies = tradies.filter(tradie => {
    const matchesSearch = tradie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tradie.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || tradie.status === statusFilter
    const matchesSpecialty = specialtyFilter === "all" ||
                            tradie.specialties.some(s => s.includes(specialtyFilter))
    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />已认证</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />待审核</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />已暂停</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleViewTradie = (tradie: any) => {
    setSelectedTradie(tradie)
    setShowTradieDialog(true)
  }

  const handleApproveTradie = (tradieId: string) => {
    setTradies(tradies.map(t =>
      t.id === tradieId ? { ...t, status: "verified" } : t
    ))
  }

  const handleSuspendTradie = (tradieId: string) => {
    if (confirm("确定要暂停这个技师吗？")) {
      setTradies(tradies.map(t =>
        t.id === tradieId ? { ...t, status: "suspended" } : t
      ))
    }
  }

  return (
    <AdminLayout title="技师管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">技师管理</h1>
            <p className="text-gray-600">管理平台注册技师和服务提供者</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              添加技师
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总技师数</p>
                  <p className="text-2xl font-bold text-gray-900">{tradies.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">已认证</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tradies.filter(t => t.status === "verified").length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待审核</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tradies.filter(t => t.status === "pending").length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均评分</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总收入</p>
                  <p className="text-2xl font-bold text-gray-900">$126K</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索技师姓名或联系人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="verified">已认证</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="suspended">已暂停</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有专业</SelectItem>
                  <SelectItem value="装修">装修翻新</SelectItem>
                  <SelectItem value="电工">电工服务</SelectItem>
                  <SelectItem value="水管">水管维修</SelectItem>
                  <SelectItem value="木工">木工制作</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tradies Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">技师信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">专业技能</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">评价</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">业绩</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTradies.map((tradie) => (
                    <tr key={tradie.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tradie.name}</p>
                            <p className="text-sm text-gray-500">{tradie.contact}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {tradie.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {tradie.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {tradie.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tradie.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{tradie.rating}</span>
                          <span className="text-sm text-gray-500">({tradie.reviewCount})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{tradie.completedJobs} 个项目</p>
                          <p className="text-gray-600">{tradie.revenue} 收入</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(tradie.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTradie(tradie)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {tradie.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600"
                              onClick={() => handleApproveTradie(tradie.id)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendTradie(tradie.id)}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tradie Detail Dialog */}
        <Dialog open={showTradieDialog} onOpenChange={setShowTradieDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-green-600" />
                <span>技师详情：{selectedTradie?.name}</span>
              </DialogTitle>
              <DialogDescription>
                查看和管理技师的详细信息
              </DialogDescription>
            </DialogHeader>

            {selectedTradie && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">业务名称</Label>
                        <p className="text-gray-900">{selectedTradie.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">联系人</Label>
                        <p className="text-gray-900">{selectedTradie.contact}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">邮箱</Label>
                        <p className="text-gray-900">{selectedTradie.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">电话</Label>
                        <p className="text-gray-900">{selectedTradie.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">服务地区</Label>
                        <p className="text-gray-900">{selectedTradie.location}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">业务统计</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">客户评分</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{selectedTradie.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">评价数量</span>
                        <span className="font-medium">{selectedTradie.reviewCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">完成项目</span>
                        <span className="font-medium">{selectedTradie.completedJobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总收入</span>
                        <span className="font-medium">{selectedTradie.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">加入时间</span>
                        <span className="font-medium">{selectedTradie.joinDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">专业技能</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTradie.specialties.map((specialty: string, index: number) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Licenses & Insurance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">资质认证</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">执业许可证</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTradie.licenses.map((license: string, index: number) => (
                          <Badge key={index} variant="outline">
                            <Award className="w-3 h-3 mr-1" />
                            {license}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">保险状态</Label>
                      <p className="text-gray-900 mt-1">{selectedTradie.insurance}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  {selectedTradie.status === "pending" && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApproveTradie(selectedTradie.id)
                        setShowTradieDialog(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      批准认证
                    </Button>
                  )}
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑信息
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600"
                    onClick={() => {
                      handleSuspendTradie(selectedTradie.id)
                      setShowTradieDialog(false)
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    暂停账户
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

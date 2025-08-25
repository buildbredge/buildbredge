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
              <li><a href="/htgl" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Wrench className="w-5 h-5" /><span>仪表板</span></a></li>
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
  const [tradies, setTradies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTradies, setTotalTradies] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [showTradieDialog, setShowTradieDialog] = useState(false)
  const [selectedTradie, setSelectedTradie] = useState<any>(null)

  // 加载技师数据
  const loadTradies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
        search: searchTerm,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      const response = await fetch(`/api/admin/tradie-activity?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setTradies(result.data.users)
        setTotalPages(result.data.pagination.totalPages || 1)
        setTotalTradies(result.data.pagination.total || 0)
      }
    } catch (error) {
      console.error('加载技师数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadTradies()
  }, [currentPage, statusFilter, searchTerm])

  // 当搜索或筛选条件改变时，重置到第一页
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [statusFilter, searchTerm])

  // 由于API已经处理了搜索和状态过滤，这里直接使用tradies数据
  const filteredTradies = tradies.filter(tradie => {
    // 只需要处理专业技能过滤（如果需要的话）
    if (specialtyFilter === "all") return true
    return tradie.bio?.includes(specialtyFilter) || false
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />已认证</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />待审核</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />已暂停</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleViewTradie = (tradie: any) => {
    setSelectedTradie(tradie)
    setShowTradieDialog(true)
  }

  const handleApproveTradie = async (tradieId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${tradieId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'approved' })
      })

      const result = await response.json()
      
      if (result.success) {
        setTradies(tradies.map(t =>
          t.id === tradieId ? { ...t, status: "approved" } : t
        ))
        alert("技师已成功审核通过")
      } else {
        alert(`更新失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('审核技师时发生错误，请稍后重试')
    }
  }

  const handleSuspendTradie = async (tradieId: string) => {
    const tradie = tradies.find(t => t.id === tradieId)
    if (!tradie) return

    if (!confirm(`确定要暂停技师 ${tradie.name || tradie.email} 吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${tradieId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'closed' })
      })

      const result = await response.json()
      
      if (result.success) {
        setTradies(tradies.map(t =>
          t.id === tradieId ? { ...t, status: "closed" } : t
        ))
        alert("技师已成功暂停")
      } else {
        alert(`更新失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Suspension error:', error)
      alert('暂停技师时发生错误，请稍后重试')
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
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : totalTradies}
                  </p>
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
                    {loading ? "..." : tradies.filter(t => t.status === "approved").length}
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
                    {loading ? "..." : tradies.filter(t => t.status === "pending").length}
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
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : tradies.length > 0 
                      ? (tradies.reduce((sum, t) => sum + (t.rating || 0), 0) / tradies.length).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总项目数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : tradies.reduce((sum, t) => sum + (t.projects?.total || 0), 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
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
                  <SelectItem value="approved">已认证</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="closed">已暂停</SelectItem>
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
                            <p className="font-medium text-gray-900">{tradie.name || tradie.company}</p>
                            <p className="text-sm text-gray-500">{tradie.email}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {tradie.service_area || tradie.address || "未设置"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {tradie.bio ? (
                            <>
                              {tradie.bio.split('、').slice(0, 2).map((specialty: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {specialty.trim()}
                                </Badge>
                              ))}
                              {tradie.bio.split('、').length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{tradie.bio.split('、').length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">未设置</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{tradie.rating || 0}</span>
                          <span className="text-sm text-gray-500">({tradie.review_count || 0})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{tradie.projects?.total || 0} 个项目</p>
                          <p className="text-gray-600">
                            已完成: {tradie.projects?.completed || 0}
                          </p>
                          <p className="text-gray-500 text-xs">
                            余额: ${tradie.balance?.toFixed(2) || "0.00"}
                          </p>
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
                          {tradie.status !== "closed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600"
                              onClick={() => handleSuspendTradie(tradie.id)}
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">加载中...</p>
              </div>
            )}

            {!loading && filteredTradies.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">没有找到匹配的技师</p>
              </div>
            )}
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
                        <Label className="text-sm font-medium text-gray-600">姓名</Label>
                        <p className="text-gray-900">{selectedTradie.name || "未设置"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">公司</Label>
                        <p className="text-gray-900">{selectedTradie.company || "未设置"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">邮箱</Label>
                        <p className="text-gray-900">{selectedTradie.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">电话</Label>
                        <p className="text-gray-900">{selectedTradie.phone || "未设置"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">服务地区</Label>
                        <p className="text-gray-900">{selectedTradie.service_area || selectedTradie.address || "未设置"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">服务半径</Label>
                        <p className="text-gray-900">{selectedTradie.service_radius || 0} 公里</p>
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
                          <span className="font-medium">{selectedTradie.rating || 0}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">评价数量</span>
                        <span className="font-medium">{selectedTradie.review_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">完成项目</span>
                        <span className="font-medium">{selectedTradie.projects?.completed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总项目数</span>
                        <span className="font-medium">{selectedTradie.projects?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">账户余额</span>
                        <span className="font-medium">${selectedTradie.balance?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">加入时间</span>
                        <span className="font-medium">{new Date(selectedTradie.created_at).toLocaleDateString('zh-CN')}</span>
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
                      {selectedTradie.bio ? (
                        selectedTradie.bio.split('、').map((specialty: string, index: number) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            {specialty.trim()}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">未设置专业技能</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">附加信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">语言</Label>
                      <p className="text-gray-900 mt-1">{selectedTradie.language || "未设置"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">网站</Label>
                      <p className="text-gray-900 mt-1">
                        {selectedTradie.website ? (
                          <a href={selectedTradie.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedTradie.website}
                          </a>
                        ) : (
                          "未设置"
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">用户状态</Label>
                      <div className="mt-1">{getStatusBadge(selectedTradie.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">电话验证</Label>
                      <p className="text-gray-900 mt-1">
                        {selectedTradie.phone_verified ? (
                          <span className="text-green-600">✓ 已验证</span>
                        ) : (
                          <span className="text-red-600">✗ 未验证</span>
                        )}
                      </p>
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
                  {selectedTradie.status !== "closed" && (
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
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

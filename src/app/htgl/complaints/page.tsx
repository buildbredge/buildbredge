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
import {
  AlertTriangle,
  Search,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  Calendar,
  Filter
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
              <li><a href="/htgl/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>仪表板</span></a></li>
              <li><a href="/htgl/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>用户管理</span></a></li>
              <li><a href="/htgl/tradies" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>技师管理</span></a></li>
              <li><a href="/htgl/suppliers" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>供应商管理</span></a></li>
              <li><a href="/htgl/support" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>客服管理</span></a></li>
              <li><a href="/htgl/complaints" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700"><AlertTriangle className="w-5 h-5" /><span>投诉管理</span></a></li>
              <li><a href="/htgl/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><AlertTriangle className="w-5 h-5" /><span>评价管理</span></a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function ComplaintsManagePage() {
  const [complaints, setComplaints] = useState([
    {
      id: "C001",
      title: "技师未按时完成工作",
      description: "李师傅承诺一周内完成厨房翻新，但已经延期10天，严重影响我们的生活。",
      complainant: "张女士",
      complainantEmail: "zhang@email.com",
      against: "李师傅专业装修",
      againstType: "tradie",
      category: "service_quality",
      priority: "high",
      status: "pending",
      createdDate: "2024-12-01",
      lastUpdate: "2024-12-05",
      assignedTo: "客服小王",
      notes: [
        { date: "2024-12-01", author: "系统", content: "投诉自动创建" },
        { date: "2024-12-02", author: "客服小王", content: "已联系技师了解情况" },
        { date: "2024-12-05", author: "客服小王", content: "技师承诺本周内完成，持续跟进中" }
      ]
    },
    {
      id: "C002",
      title: "材料质量问题",
      description: "供应商提供的材料质量不符合描述，要求退货或换货。",
      complainant: "李先生",
      complainantEmail: "li@email.com",
      against: "奥克兰建材供应",
      againstType: "supplier",
      category: "product_quality",
      priority: "medium",
      status: "investigating",
      createdDate: "2024-12-03",
      lastUpdate: "2024-12-08",
      assignedTo: "客服小李",
      notes: [
        { date: "2024-12-03", author: "系统", content: "投诉自动创建" },
        { date: "2024-12-04", author: "客服小李", content: "已联系供应商核实情况" },
        { date: "2024-12-08", author: "客服小李", content: "供应商同意换货，安排时间中" }
      ]
    },
    {
      id: "C003",
      title: "技师沟通态度恶劣",
      description: "王师傅在项目过程中态度很差，不耐烦回答问题，服务体验很差。",
      complainant: "刘女士",
      complainantEmail: "liu@email.com",
      against: "王师傅电工服务",
      againstType: "tradie",
      category: "behavior",
      priority: "low",
      status: "resolved",
      createdDate: "2024-11-28",
      lastUpdate: "2024-12-10",
      assignedTo: "客服小张",
      resolution: "经调解，技师道歉并承诺改进服务态度。客户满意并撤销投诉。",
      notes: [
        { date: "2024-11-28", author: "系统", content: "投诉自动创建" },
        { date: "2024-11-29", author: "客服小张", content: "联系双方了解情况" },
        { date: "2024-12-02", author: "客服小张", content: "组织三方沟通会议" },
        { date: "2024-12-10", author: "客服小张", content: "问题已解决，双方达成和解" }
      ]
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [showComplaintDialog, setShowComplaintDialog] = useState(false)

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.against.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />待处理</Badge>
      case "investigating":
        return <Badge className="bg-blue-100 text-blue-800"><Search className="w-3 h-3 mr-1" />调查中</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已解决</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">高优先级</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">中优先级</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">低优先级</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const handleViewComplaint = (complaint: any) => {
    setSelectedComplaint(complaint)
    setShowComplaintDialog(true)
  }

  const handleUpdateStatus = (complaintId: string, newStatus: string) => {
    setComplaints(complaints.map(c =>
      c.id === complaintId ? {
        ...c,
        status: newStatus,
        lastUpdate: new Date().toISOString().split('T')[0]
      } : c
    ))
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus })
    }
  }

  const categoryLabels: Record<string, string> = {
    service_quality: "服务质量",
    product_quality: "产品质量",
    behavior: "行为态度",
    pricing: "价格争议",
    delay: "进度延误",
    other: "其他"
  }

  return (
    <AdminLayout title="投诉管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">投诉管理</h1>
            <p className="text-gray-600">处理和跟踪用户投诉</p>
          </div>
          <Button>
            <Flag className="w-4 h-4 mr-2" />
            创建投诉
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总投诉数</p>
                  <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.status === "pending").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">调查中</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.status === "investigating").length}
                  </p>
                </div>
                <Search className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">已解决</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaints.filter(c => c.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
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
                  placeholder="搜索投诉标题、投诉人或被投诉方..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="investigating">调查中</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有优先级</SelectItem>
                  <SelectItem value="high">高优先级</SelectItem>
                  <SelectItem value="medium">中优先级</SelectItem>
                  <SelectItem value="low">低优先级</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类别</SelectItem>
                  <SelectItem value="service_quality">服务质量</SelectItem>
                  <SelectItem value="product_quality">产品质量</SelectItem>
                  <SelectItem value="behavior">行为态度</SelectItem>
                  <SelectItem value="pricing">价格争议</SelectItem>
                  <SelectItem value="delay">进度延误</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Complaints Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">投诉信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">投诉人</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">被投诉方</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">类别</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">优先级</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">负责人</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.title}</p>
                          <p className="text-sm text-gray-500">#{complaint.id}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {complaint.createdDate}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.complainant}</p>
                          <p className="text-sm text-gray-500">{complaint.complainantEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.against}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {complaint.againstType === "tradie" ? "技师" : "供应商"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">
                          {categoryLabels[complaint.category] || complaint.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {getPriorityBadge(complaint.priority)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(complaint.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{complaint.assignedTo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          查看
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Detail Dialog */}
        <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>投诉详情：{selectedComplaint?.title}</span>
              </DialogTitle>
              <DialogDescription>
                投诉编号：{selectedComplaint?.id} | 创建时间：{selectedComplaint?.createdDate}
              </DialogDescription>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">投诉信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">投诉标题</Label>
                        <p className="text-gray-900">{selectedComplaint.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">投诉内容</Label>
                        <p className="text-gray-900 text-sm">{selectedComplaint.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">投诉类别</Label>
                        <Badge variant="outline">
                          {categoryLabels[selectedComplaint.category]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">处理状态</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">当前状态</Label>
                        <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">优先级</Label>
                        <div className="mt-1">{getPriorityBadge(selectedComplaint.priority)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">负责客服</Label>
                        <p className="text-gray-900">{selectedComplaint.assignedTo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">最后更新</Label>
                        <p className="text-gray-900">{selectedComplaint.lastUpdate}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">投诉人</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedComplaint.complainant}</p>
                        <p className="text-sm text-gray-600">{selectedComplaint.complainantEmail}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">被投诉方</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedComplaint.against}</p>
                        <Badge variant="outline">
                          {selectedComplaint.againstType === "tradie" ? "技师" : "供应商"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resolution */}
                {selectedComplaint.resolution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">解决方案</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900">{selectedComplaint.resolution}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Notes Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">处理记录</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedComplaint.notes.map((note: any, index: number) => (
                        <div key={index} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{note.author}</span>
                              <span className="text-xs text-gray-500">{note.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{note.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Select
                      value={selectedComplaint.status}
                      onValueChange={(value) => handleUpdateStatus(selectedComplaint.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="investigating">调查中</SelectItem>
                        <SelectItem value="resolved">已解决</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      添加备注
                    </Button>
                    <Button>
                      联系相关方
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

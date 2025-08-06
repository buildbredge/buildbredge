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
  MessageSquare,
  Search,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Headphones,
  MessageCircle,
  BarChart
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
              <li><a href="/htgl/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>仪表板</span></a></li>
              <li><a href="/htgl/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>用户管理</span></a></li>
              <li><a href="/htgl/tradies" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>技师管理</span></a></li>
              <li><a href="/htgl/suppliers" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>供应商管理</span></a></li>
              <li><a href="/htgl/support" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700"><MessageSquare className="w-5 h-5" /><span>客服管理</span></a></li>
              <li><a href="/htgl/complaints" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>投诉管理</span></a></li>
              <li><a href="/htgl/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><MessageSquare className="w-5 h-5" /><span>评价管理</span></a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function SupportManagePage() {
  const [supportStaff, setSupportStaff] = useState([
    {
      id: "CS001",
      name: "客服小王",
      email: "wang@buildbridge.nz",
      phone: "+64 21 111 1111",
      department: "技术支持",
      role: "高级客服",
      status: "online",
      activeTickets: 8,
      resolvedToday: 12,
      totalResolved: 456,
      avgResponseTime: "15分钟",
      satisfaction: 4.8,
      joinDate: "2023-06-15",
      languages: ["中文", "英文"],
      specialties: ["技师问题", "平台使用"]
    },
    {
      id: "CS002",
      name: "客服小李",
      email: "li@buildbridge.nz",
      phone: "+64 21 222 2222",
      department: "用户服务",
      role: "客服专员",
      status: "online",
      activeTickets: 5,
      resolvedToday: 8,
      totalResolved: 289,
      avgResponseTime: "12分钟",
      satisfaction: 4.9,
      joinDate: "2023-08-20",
      languages: ["中文", "英文", "粤语"],
      specialties: ["用户注册", "账户问题"]
    },
    {
      id: "CS003",
      name: "客服小张",
      email: "zhang@buildbridge.nz",
      phone: "+64 21 333 3333",
      department: "投诉处理",
      role: "投诉专员",
      status: "busy",
      activeTickets: 12,
      resolvedToday: 6,
      totalResolved: 234,
      avgResponseTime: "25分钟",
      satisfaction: 4.6,
      joinDate: "2023-10-10",
      languages: ["中文", "英文"],
      specialties: ["投诉调解", "纠纷处理"]
    },
    {
      id: "CS004",
      name: "客服小刘",
      email: "liu@buildbridge.nz",
      phone: "+64 21 444 4444",
      department: "技术支持",
      role: "客服专员",
      status: "offline",
      activeTickets: 0,
      resolvedToday: 0,
      totalResolved: 178,
      avgResponseTime: "18分钟",
      satisfaction: 4.7,
      joinDate: "2024-01-15",
      languages: ["中文", "英文"],
      specialties: ["支付问题", "技术故障"]
    }
  ])

  const [tickets, setTickets] = useState([
    {
      id: "T001",
      title: "无法登录账户",
      user: "张女士",
      assignedTo: "客服小王",
      priority: "high",
      status: "open",
      createdDate: "2024-12-10 09:30",
      category: "账户问题",
      lastResponse: "2024-12-10 10:15"
    },
    {
      id: "T002",
      title: "技师评价无法提交",
      user: "李先生",
      assignedTo: "客服小李",
      priority: "medium",
      status: "pending",
      createdDate: "2024-12-10 08:45",
      category: "功能问题",
      lastResponse: "2024-12-10 09:20"
    },
    {
      id: "T003",
      title: "投诉技师服务态度",
      user: "王女士",
      assignedTo: "客服小张",
      priority: "high",
      status: "in_progress",
      createdDate: "2024-12-09 16:20",
      category: "投诉处理",
      lastResponse: "2024-12-10 08:30"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [showStaffDialog, setShowStaffDialog] = useState(false)

  const filteredStaff = supportStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800"><div className="w-2 h-2 bg-green-500 rounded-full mr-1" />在线</Badge>
      case "busy":
        return <Badge className="bg-yellow-100 text-yellow-800"><div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />忙碌</Badge>
      case "offline":
        return <Badge className="bg-gray-100 text-gray-800"><div className="w-2 h-2 bg-gray-500 rounded-full mr-1" />离线</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">高</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">低</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">待处理</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">等待回复</Badge>
      case "in_progress":
        return <Badge className="bg-orange-100 text-orange-800">处理中</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">已解决</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleViewStaff = (staff: any) => {
    setSelectedStaff(staff)
    setShowStaffDialog(true)
  }

  const totalActiveTickets = tickets.filter(t => t.status !== "resolved").length
  const totalResolvedToday = supportStaff.reduce((sum, staff) => sum + staff.resolvedToday, 0)
  const avgSatisfaction = (supportStaff.reduce((sum, staff) => sum + staff.satisfaction, 0) / supportStaff.length).toFixed(1)

  return (
    <AdminLayout title="客服管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">客服管理</h1>
            <p className="text-gray-600">管理客服团队和工单处理</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <BarChart className="w-4 h-4 mr-2" />
              性能报告
            </Button>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              添加客服
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">在线客服</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {supportStaff.filter(s => s.status === "online").length}
                  </p>
                </div>
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">活跃工单</p>
                  <p className="text-2xl font-bold text-gray-900">{totalActiveTickets}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">今日已解决</p>
                  <p className="text-2xl font-bold text-gray-900">{totalResolvedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均满意度</p>
                  <p className="text-2xl font-bold text-gray-900">{avgSatisfaction}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Support Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                客服团队
              </CardTitle>
              <CardDescription>客服人员状态和工作负载</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索客服..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="online">在线</SelectItem>
                      <SelectItem value="busy">忙碌</SelectItem>
                      <SelectItem value="offline">离线</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.name}</p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(staff.status)}
                            <span className="text-xs text-gray-500">{staff.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{staff.activeTickets} 活跃</p>
                        <p className="text-xs text-gray-500">{staff.resolvedToday} 今日解决</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                最新工单
              </CardTitle>
              <CardDescription>近期客服工单处理情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 text-sm">{ticket.title}</p>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      {getTicketStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>用户：{ticket.user}</span>
                        <span>客服：{ticket.assignedTo}</span>
                      </div>
                      <span>{ticket.createdDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>客服绩效概览</CardTitle>
            <CardDescription>客服人员详细工作数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">客服信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">工作负载</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">绩效指标</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">专业领域</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {supportStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.role}</p>
                            <p className="text-xs text-gray-500">{staff.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(staff.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">{staff.activeTickets}</span> 活跃工单</p>
                          <p className="text-sm"><span className="font-medium">{staff.resolvedToday}</span> 今日解决</p>
                          <p className="text-sm"><span className="font-medium">{staff.totalResolved}</span> 总计解决</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-sm">{staff.avgResponseTime}</span>
                          </div>
                          <div className="flex items-center">
                            <Award className="w-3 h-3 text-yellow-400 mr-1" />
                            <span className="text-sm">{staff.satisfaction} 满意度</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {staff.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {specialty}
                            </Badge>
                          ))}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {staff.languages.map((lang, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStaff(staff)}
                        >
                          详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Staff Detail Dialog */}
        <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <span>客服详情：{selectedStaff?.name}</span>
              </DialogTitle>
              <DialogDescription>
                查看客服的详细信息和绩效数据
              </DialogDescription>
            </DialogHeader>

            {selectedStaff && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">姓名</Label>
                        <p className="text-gray-900">{selectedStaff.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">邮箱</Label>
                        <p className="text-gray-900">{selectedStaff.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">电话</Label>
                        <p className="text-gray-900">{selectedStaff.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">部门</Label>
                        <p className="text-gray-900">{selectedStaff.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">职位</Label>
                        <p className="text-gray-900">{selectedStaff.role}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">入职时间</Label>
                        <p className="text-gray-900">{selectedStaff.joinDate}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">绩效统计</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">当前状态</span>
                        {getStatusBadge(selectedStaff.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">活跃工单</span>
                        <span className="font-medium">{selectedStaff.activeTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">今日解决</span>
                        <span className="font-medium">{selectedStaff.resolvedToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总计解决</span>
                        <span className="font-medium">{selectedStaff.totalResolved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">平均响应时间</span>
                        <span className="font-medium">{selectedStaff.avgResponseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">客户满意度</span>
                        <span className="font-medium">{selectedStaff.satisfaction}/5.0</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">专业技能</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">专业领域</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedStaff.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">语言能力</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedStaff.languages.map((language: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    编辑信息
                  </Button>
                  <Button>
                    查看工单历史
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

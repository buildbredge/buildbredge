"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  User,
  Home,
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  Star,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie' | 'supplier'
  location: string
  joinDate: string
  status: 'active' | 'inactive' | 'suspended'
  avatar?: string
  lastLogin: string
  projectsCount: number
  totalSpent?: number
  rating?: number
}

interface Project {
  id: string
  title: string
  description: string
  category: string
  location: string
  budget: string
  urgency: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string
  responses: number
  selectedTradie?: string
}

interface AdminStats {
  totalUsers: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  monthlyGrowth: number
  newUsersThisMonth: number
  newProjectsThisMonth: number
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    newUsersThisMonth: 0,
    newProjectsThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Mock data - 在真实应用中，这些数据会从API获取
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "张女士",
        email: "zhang@example.com",
        phone: "+64 21 123 4567",
        userType: "homeowner",
        location: "奥克兰中心",
        joinDate: "2024-01-15",
        status: "active",
        lastLogin: "2025-01-08",
        projectsCount: 3,
        totalSpent: 15000,
        rating: 4.8
      },
      {
        id: "2",
        name: "李师傅",
        email: "li@example.com",
        phone: "+64 21 234 5678",
        userType: "tradie",
        location: "奥克兰西区",
        joinDate: "2024-02-10",
        status: "active",
        lastLogin: "2025-01-09",
        projectsCount: 25,
        rating: 4.9
      },
      {
        id: "3",
        name: "王先生",
        email: "wang@example.com",
        phone: "+64 21 345 6789",
        userType: "homeowner",
        location: "惠灵顿",
        joinDate: "2024-03-20",
        status: "inactive",
        lastLogin: "2024-12-15",
        projectsCount: 1,
        totalSpent: 3500,
        rating: 4.5
      },
      {
        id: "4",
        name: "陈师傅",
        email: "chen@example.com",
        phone: "+64 21 456 7890",
        userType: "tradie",
        location: "基督城",
        joinDate: "2024-01-05",
        status: "active",
        lastLogin: "2025-01-09",
        projectsCount: 18,
        rating: 4.7
      },
      {
        id: "5",
        name: "建材供应商",
        email: "supplier@example.com",
        phone: "+64 21 567 8901",
        userType: "supplier",
        location: "奥克兰南区",
        joinDate: "2024-02-28",
        status: "active",
        lastLogin: "2025-01-08",
        projectsCount: 50
      }
    ]

    const mockProjects: Project[] = [
      {
        id: "p1",
        title: "厨房翻新项目",
        description: "需要重新装修厨房，包括橱柜、台面和电器安装",
        category: "厨房翻新",
        location: "奥克兰中心",
        budget: "$15,000 - $25,000",
        urgency: "未来几周",
        status: "in_progress",
        userId: "1",
        userName: "张女士",
        userEmail: "zhang@example.com",
        createdAt: "2025-01-05",
        updatedAt: "2025-01-08",
        responses: 5,
        selectedTradie: "李师傅"
      },
      {
        id: "p2",
        title: "电路安装工程",
        description: "新房子需要完整的电路系统安装",
        category: "电工服务",
        location: "惠灵顿",
        budget: "$8,000 - $12,000",
        urgency: "今天（紧急）",
        status: "open",
        userId: "3",
        userName: "王先生",
        userEmail: "wang@example.com",
        createdAt: "2025-01-08",
        updatedAt: "2025-01-08",
        responses: 3
      },
      {
        id: "p3",
        title: "浴室改造",
        description: "老旧浴室需要现代化改造，包括瓷砖和淋浴设备",
        category: "浴室改造",
        location: "基督城",
        budget: "$10,000 - $18,000",
        urgency: "时间灵活",
        status: "completed",
        userId: "1",
        userName: "张女士",
        userEmail: "zhang@example.com",
        createdAt: "2024-12-20",
        updatedAt: "2025-01-02",
        responses: 8,
        selectedTradie: "陈师傅"
      }
    ]

    setUsers(mockUsers)
    setProjects(mockProjects)
    setStats({
      totalUsers: mockUsers.length,
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter(p => p.status === 'open' || p.status === 'in_progress').length,
      completedProjects: mockProjects.filter(p => p.status === 'completed').length,
      totalRevenue: 125000,
      monthlyGrowth: 15.5,
      newUsersThisMonth: 8,
      newProjectsThisMonth: 12
    })
    setLoading(false)
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.userType === userFilter
    return matchesSearch && matchesFilter
  })

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = projectFilter === "all" || project.status === projectFilter
    return matchesSearch && matchesFilter
  })

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'homeowner': return { label: '房主', color: 'bg-green-100 text-green-800' }
      case 'tradie': return { label: '技师', color: 'bg-blue-100 text-blue-800' }
      case 'supplier': return { label: '供应商', color: 'bg-purple-100 text-purple-800' }
      default: return { label: '未知', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return { label: '活跃', color: 'bg-green-100 text-green-800' }
      case 'inactive': return { label: '不活跃', color: 'bg-yellow-100 text-yellow-800' }
      case 'suspended': return { label: '已暂停', color: 'bg-red-100 text-red-800' }
      case 'open': return { label: '开放中', color: 'bg-blue-100 text-blue-800' }
      case 'in_progress': return { label: '进行中', color: 'bg-orange-100 text-orange-800' }
      case 'completed': return { label: '已完成', color: 'bg-green-100 text-green-800' }
      case 'cancelled': return { label: '已取消', color: 'bg-red-100 text-red-800' }
      default: return { label: '未知', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const exportData = (type: 'users' | 'projects') => {
    const csvContent = type === 'users'
      ? "姓名,邮箱,电话,用户类型,地区,注册日期,状态\n" +
        filteredUsers.map(u => `${u.name},${u.email},${u.phone},${getUserTypeLabel(u.userType).label},${u.location},${u.joinDate},${getStatusLabel(u.status).label}`).join('\n')
      : "项目标题,分类,地区,预算,状态,发布者,创建日期\n" +
        filteredProjects.map(p => `${p.title},${p.category},${p.location},${p.budget},${getStatusLabel(p.status).label},${p.userName},${p.createdAt}`).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-green-600">BuildBridge</h1>
                <Badge className="bg-blue-100 text-blue-800">管理后台</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  返回前台
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    管理员
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>系统管理</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    系统设置
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600">+{stats.newUsersThisMonth} 本月新增</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总项目数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                  <p className="text-xs text-green-600">+{stats.newProjectsThisMonth} 本月新增</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">进行中项目</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                  <p className="text-xs text-gray-600">{stats.completedProjects} 已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">月增长率</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
                  <p className="text-xs text-green-600">持续增长</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="projects">项目管理</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>查看和管理平台用户信息</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData('users')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      导出数据
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索用户姓名或邮箱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="筛选用户类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部用户</SelectItem>
                      <SelectItem value="homeowner">房主</SelectItem>
                      <SelectItem value="tradie">技师</SelectItem>
                      <SelectItem value="supplier">供应商</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>联系方式</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>地区</TableHead>
                        <TableHead>注册日期</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>项目数</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const userType = getUserTypeLabel(user.userType)
                        const status = getStatusLabel(user.status)
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500">#{user.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                  {user.email}
                                </div>
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                  {user.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={userType.color}>
                                {userType.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                {user.location}
                              </div>
                            </TableCell>
                            <TableCell>{user.joinDate}</TableCell>
                            <TableCell>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="font-medium">{user.projectsCount}</div>
                                {user.rating && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                                    {user.rating}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    查看详情
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑信息
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    发送消息
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    暂停账户
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>项目管理</CardTitle>
                    <CardDescription>查看和管理平台发布的项目需求</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData('projects')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      导出数据
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索项目标题或发布者..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="筛选项目状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部项目</SelectItem>
                      <SelectItem value="open">开放中</SelectItem>
                      <SelectItem value="in_progress">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Projects Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目信息</TableHead>
                        <TableHead>发布者</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>地区</TableHead>
                        <TableHead>预算</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>响应数</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => {
                        const status = getStatusLabel(project.status)
                        return (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{project.title}</div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {project.description}
                                </div>
                                <div className="text-xs text-gray-400">#{project.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{project.userName}</div>
                                <div className="text-xs text-gray-500">{project.userEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{project.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                {project.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{project.budget}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="font-medium">{project.responses}</div>
                                <div className="text-xs text-gray-500">个回复</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    查看详情
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑项目
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    查看回复
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除项目
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>用户分析</CardTitle>
                  <CardDescription>用户类型和活跃度统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">房主用户</span>
                      <span className="font-medium">{users.filter(u => u.userType === 'homeowner').length}人</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">专业技师</span>
                      <span className="font-medium">{users.filter(u => u.userType === 'tradie').length}人</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">建材供应商</span>
                      <span className="font-medium">{users.filter(u => u.userType === 'supplier').length}人</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">活跃用户</span>
                        <span className="font-medium text-green-600">
                          {users.filter(u => u.status === 'active').length}人
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>项目分析</CardTitle>
                  <CardDescription>项目状态和分类统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">开放中项目</span>
                      <span className="font-medium text-blue-600">
                        {projects.filter(p => p.status === 'open').length}个
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">进行中项目</span>
                      <span className="font-medium text-orange-600">
                        {projects.filter(p => p.status === 'in_progress').length}个
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">已完成项目</span>
                      <span className="font-medium text-green-600">
                        {projects.filter(p => p.status === 'completed').length}个
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">平均响应数</span>
                        <span className="font-medium">
                          {(projects.reduce((sum, p) => sum + p.responses, 0) / projects.length).toFixed(1)}个
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>最新活动</CardTitle>
                <CardDescription>平台最新的用户活动和项目动态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">新用户注册</p>
                      <p className="text-sm text-gray-600">张女士 注册为房主用户</p>
                    </div>
                    <div className="text-sm text-gray-500">2小时前</div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">新项目发布</p>
                      <p className="text-sm text-gray-600">王先生 发布了电路安装工程项目</p>
                    </div>
                    <div className="text-sm text-gray-500">4小时前</div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">项目完成</p>
                      <p className="text-sm text-gray-600">浴室改造项目已完成并获得5星评价</p>
                    </div>
                    <div className="text-sm text-gray-500">1天前</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>用户详细信息</AlertDialogTitle>
              <AlertDialogDescription>
                查看 {selectedUser.name} 的完整用户信息
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">用户ID</Label>
                  <p className="text-sm text-gray-600">#{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">用户类型</Label>
                  <Badge className={getUserTypeLabel(selectedUser.userType).color}>
                    {getUserTypeLabel(selectedUser.userType).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">注册日期</Label>
                  <p className="text-sm text-gray-600">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">最后登录</Label>
                  <p className="text-sm text-gray-600">{selectedUser.lastLogin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">项目数量</Label>
                  <p className="text-sm text-gray-600">{selectedUser.projectsCount}个</p>
                </div>
                {selectedUser.rating && (
                  <div>
                    <Label className="text-sm font-medium">评分</Label>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{selectedUser.rating}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">联系信息</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedUser.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>关闭</AlertDialogCancel>
              <AlertDialogAction>编辑用户</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <AlertDialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>项目详细信息</AlertDialogTitle>
              <AlertDialogDescription>
                查看项目 "{selectedProject.title}" 的完整信息
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">项目ID</Label>
                  <p className="text-sm text-gray-600">#{selectedProject.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">项目状态</Label>
                  <Badge className={getStatusLabel(selectedProject.status).color}>
                    {getStatusLabel(selectedProject.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">分类</Label>
                  <Badge variant="outline">{selectedProject.category}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">地区</Label>
                  <p className="text-sm text-gray-600">{selectedProject.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">预算范围</Label>
                  <p className="text-sm text-gray-600">{selectedProject.budget}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">紧急程度</Label>
                  <p className="text-sm text-gray-600">{selectedProject.urgency}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">项目描述</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">发布者信息</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedProject.userName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedProject.userEmail}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">创建时间</Label>
                  <p className="text-sm text-gray-600">{selectedProject.createdAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">更新时间</Label>
                  <p className="text-sm text-gray-600">{selectedProject.updatedAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">回复数量</Label>
                  <p className="text-sm text-gray-600">{selectedProject.responses}个</p>
                </div>
              </div>
              {selectedProject.selectedTradie && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">选中技师</Label>
                  <p className="text-sm text-gray-600">{selectedProject.selectedTradie}</p>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>关闭</AlertDialogCancel>
              <AlertDialogAction>管理项目</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

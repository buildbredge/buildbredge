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
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// AdminLayout component
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

  const handleLogout = async () => {
    // 清除localStorage
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    
    // 清除cookies
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Supabase登出
    await supabase.auth.signOut()
    
    router.push("/htgl/login")
  }

  // 检查token有效性（可选：定期检查）
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("adminToken")
      if (token) {
        try {
          const response = await fetch('/api/admin/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.status === 401) {
            // Token无效，清除并跳转
            localStorage.removeItem("adminToken")
            localStorage.removeItem("adminUser")
            document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            router.push("/htgl/login")
          }
        } catch (error) {
          console.error('Token验证失败:', error)
        }
      }
    }

    // 初始检查
    checkTokenValidity()
    
    // 每5分钟检查一次token有效性
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [router])

  if (!adminUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">检查登录状态...</p>
      </div>
    </div>
  }

  const navItems = [
    { href: "/htgl", icon: BarChart3, label: "仪表板", active: title === "仪表板" },
    { href: "/htgl/users", icon: Users, label: "用户管理" },
    { href: "/htgl/tradies", icon: Users, label: "技师管理" },
    { href: "/htgl/suppliers", icon: Users, label: "供应商管理" },
    { href: "/htgl/industries", icon: FileText, label: "行业管理" },
    { href: "/htgl/support", icon: Users, label: "客服管理" },
    { href: "/htgl/complaints", icon: Users, label: "投诉管理" },
    { href: "/htgl/reviews", icon: Users, label: "评价管理" },
    { href: "/htgl/admins", icon: Shield, label: "管理员管理" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">BuildBridge</h1>
                  <p className="text-xs text-gray-500">管理后台</p>
                </div>
              </div>
              <div className="text-gray-300">|</div>
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {adminUser.name?.charAt(0) || "A"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{adminUser.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie' | 'supplier'
  location: string
  joinDate: string
  status: 'active' | 'inactive' | 'suspended' | 'approved' | 'pending' | 'closed'
  avatar?: string
  lastLogin: string
  projectsCount: number
  totalSpent?: number
  rating?: number
  company?: string | null
  specialty?: string | null
}

interface Project {
  id: string
  title: string
  description: string
  category: string
  location: string
  budget: string
  urgency: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'published'
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string
  responses: number
  selectedTradie?: string
  images?: string[]
  video?: string
  phone?: string
  detailedDescription?: string
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
  const [statusChanging, setStatusChanging] = useState<string | null>(null)

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // 处理token过期
  const handleTokenExpired = () => {
    // 清除localStorage
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    
    // 清除cookies
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // 显示提示信息
    alert('登录已过期，请重新登录')
    
    // 跳转到登录页
    window.location.href = '/htgl/login'
  }

  // 从真实数据库获取数据
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 获取admin token用于API请求
      const adminToken = localStorage.getItem('adminToken')
      const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
      
      // 并行获取所有数据
      const [statsResponse, usersResponse, projectsResponse] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users-list?limit=10', { headers }), // 只获取前10个用户用于显示
        fetch('/api/admin/projects-list?limit=10', { headers }) // 只获取前10个项目用于显示
      ])

      // 处理统计数据
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats({
            totalUsers: statsData.stats.totalUsers,
            totalProjects: statsData.stats.totalProjects,
            activeProjects: statsData.stats.activeProjects,
            completedProjects: statsData.stats.completedProjects,
            totalRevenue: statsData.stats.totalRevenue,
            monthlyGrowth: statsData.stats.monthlyGrowth,
            newUsersThisMonth: statsData.stats.newUsersThisMonth,
            newProjectsThisMonth: statsData.stats.newProjectsThisMonth
          })
        }
      } else if (statsResponse.status === 401) {
        // Token过期，清除凭据并跳转到登录页
        handleTokenExpired()
        return
      } else {
        console.error('Failed to fetch stats:', await statsResponse.text())
      }

      // 处理用户数据
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        if (usersData.success) {
          setUsers(usersData.users)
        }
      } else if (usersResponse.status === 401) {
        handleTokenExpired()
        return
      } else {
        console.error('Failed to fetch users:', await usersResponse.text())
      }

      // 处理项目数据
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        if (projectsData.success) {
          setProjects(projectsData.projects)
        }
      } else if (projectsResponse.status === 401) {
        handleTokenExpired()
        return
      } else {
        console.error('Failed to fetch projects:', await projectsResponse.text())
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.userType === userFilter
    return matchesSearch && matchesFilter
  })

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = projectFilter === "all" || project.status === projectFilter
    return matchesSearch && matchesFilter
  })

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Phone,Type,Location,Status,Join Date\n" +
      filteredUsers.map(user => 
        `${user.name},${user.email},${user.phone},${user.userType},${user.location},${user.status},${user.joinDate}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "users.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportProjects = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Description,Location,Status,User,Created Date\n" +
      filteredProjects.map(project => 
        `"${project.title}","${project.description}",${project.location},${project.status},${project.userName},${project.createdAt}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "projects.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleStatusChange = async (userId: string, newStatus: 'pending' | 'approved' | 'closed' | 'active' | 'inactive' | 'suspended') => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const statusText = {
      pending: '待审核',
      approved: '已开通', 
      closed: '已关闭',
      active: '激活',
      inactive: '未激活',
      suspended: '已暂停'
    }[newStatus]

    if (!confirm(`确定要将用户 ${user.name} 的状态更改为 "${statusText}" 吗？`)) {
      return
    }

    try {
      setStatusChanging(userId)
      
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.status === 401) {
        handleTokenExpired()
        return
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ))
        alert(`用户状态已成功更新为 "${statusText}"`)
      } else {
        alert(`更新失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Status change error:', error)
      alert('更新用户状态时发生错误，请稍后重试')
    } finally {
      setStatusChanging(null)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    const confirmMessage = `⚠️ 危险操作！\n\n确定要完全删除用户 "${userName}" (${userEmail}) 吗？\n\n此操作将：\n- 删除用户的所有数据（用户信息、角色、技师资料等）\n- 清除项目关联（保留项目但移除用户关联）\n- 删除认证账户\n- 此操作不可撤销！\n\n请输入用户名 "${userName}" 确认删除：`
    
    const confirmation = prompt(confirmMessage)
    
    if (confirmation !== userName) {
      if (confirmation !== null) {
        alert('用户名确认不匹配，删除操作已取消')
      }
      return
    }

    try {
      setStatusChanging(userId)
      
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.status === 401) {
        handleTokenExpired()
        return
      }

      const result = await response.json()
      
      if (result.success) {
        // Remove user from local state
        setUsers(users.filter(u => u.id !== userId))
        alert(`用户删除成功：${result.message}`)
        
        // 刷新数据以确保UI同步
        fetchDashboardData()
      } else {
        alert(`删除失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Delete user error:', error)
      alert('删除用户时发生错误，请稍后重试')
    } finally {
      setStatusChanging(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <AdminLayout title="仪表板">
      <div className="space-y-6">

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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects.toLocaleString()}</p>
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
                      onClick={exportUsers}
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
                      {filteredUsers.map((user) => (
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
                            <Badge className={user.userType === 'homeowner' ? 'bg-green-100 text-green-800' : user.userType === 'tradie' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                              {user.userType === 'homeowner' ? '房主' : user.userType === 'tradie' ? '技师' : '供应商'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              {user.location}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(user.joinDate).toLocaleDateString('zh-CN')}</TableCell>
                          <TableCell>
                            <Badge className={user.status === 'active' || user.status === 'approved' ? 'bg-green-100 text-green-800' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {user.status === 'active' || user.status === 'approved' ? '活跃' : user.status === 'pending' ? '待审核' : '暂停'}
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
                                {/* 只为技师用户显示状态更改选项 */}
                                {user.userType === 'tradie' && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(user.id, 'approved')}
                                      disabled={user.status === 'approved' || statusChanging === user.id}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      审核通过
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(user.id, 'pending')}
                                      disabled={user.status === 'pending' || statusChanging === user.id}
                                      className="text-yellow-600"
                                    >
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      设为待审核
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(user.id, 'closed')}
                                      disabled={user.status === 'closed' || statusChanging === user.id}
                                      className="text-red-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      拒绝审核
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {/* 房主用户只显示暂停选项 */}
                                {user.userType === 'homeowner' && (
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    暂停账户
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {/* 开发环境删除用户功能 */}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                                  className="text-red-600 bg-red-50"
                                  disabled={statusChanging === user.id}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {statusChanging === user.id ? '删除中...' : '删除用户'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    没有找到符合条件的用户
                  </div>
                )}
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
                      onClick={exportProjects}
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
                      <SelectItem value="published">已发布</SelectItem>
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
                      {filteredProjects.map((project) => (
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
                            <Badge className={
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                              project.status === 'published' || project.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }>
                              {project.status === 'published' || project.status === 'open' ? '开放' :
                               project.status === 'in_progress' ? '进行中' :
                               project.status === 'completed' ? '已完成' : '已取消'}
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
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    没有找到符合条件的项目
                  </div>
                )}
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
                          {users.filter(u => u.status === 'active' || u.status === 'approved').length}人
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
                        {projects.filter(p => p.status === 'open' || p.status === 'published').length}个
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
                          {projects.length > 0 ? (projects.reduce((sum, p) => sum + p.responses, 0) / projects.length).toFixed(1) : 0}个
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
                      <p className="text-sm text-gray-600">本月有 {stats.newUsersThisMonth} 名新用户加入平台</p>
                    </div>
                    <div className="text-sm text-gray-500">实时数据</div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">新项目发布</p>
                      <p className="text-sm text-gray-600">本月发布了 {stats.newProjectsThisMonth} 个新项目</p>
                    </div>
                    <div className="text-sm text-gray-500">实时数据</div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">项目完成</p>
                      <p className="text-sm text-gray-600">总共完成了 {stats.completedProjects} 个项目</p>
                    </div>
                    <div className="text-sm text-gray-500">累计统计</div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">平台增长</p>
                      <p className="text-sm text-gray-600">月增长率达到 {stats.monthlyGrowth}%，持续稳定增长</p>
                    </div>
                    <div className="text-sm text-gray-500">增长趋势</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>

    {/* User Detail Dialog */}
      {selectedUser && (
        <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>用户详情</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">电话:</span> {selectedUser.phone}
                    </div>
                    <div>
                      <span className="font-medium">用户类型:</span> {selectedUser.userType === 'homeowner' ? '房主' : selectedUser.userType === 'tradie' ? '技师' : '供应商'}
                    </div>
                    <div>
                      <span className="font-medium">位置:</span> {selectedUser.location}
                    </div>
                    <div>
                      <span className="font-medium">状态:</span> 
                      <Badge className="ml-2" variant={selectedUser.status === 'active' || selectedUser.status === 'approved' ? 'default' : 'secondary'}>
                        {selectedUser.status === 'active' || selectedUser.status === 'approved' ? '活跃' : selectedUser.status === 'pending' ? '待审核' : '暂停'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">加入时间:</span> {new Date(selectedUser.joinDate).toLocaleDateString('zh-CN')}
                    </div>
                    <div>
                      <span className="font-medium">最后登录:</span> {new Date(selectedUser.lastLogin).toLocaleDateString('zh-CN')}
                    </div>
                    {selectedUser.rating && (
                      <div>
                        <span className="font-medium">评分:</span> {selectedUser.rating} ⭐
                      </div>
                    )}
                    {selectedUser.company && (
                      <div>
                        <span className="font-medium">公司:</span> {selectedUser.company}
                      </div>
                    )}
                    {selectedUser.specialty && (
                      <div>
                        <span className="font-medium">专业:</span> {selectedUser.specialty}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>关闭</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Project Detail Dialog */}
      {selectedProject && (
        <AlertDialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>项目详情</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="font-medium text-lg">{selectedProject.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{selectedProject.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">发布者:</span> {selectedProject.userName}
                    </div>
                    <div>
                      <span className="font-medium">联系邮箱:</span> {selectedProject.userEmail}
                    </div>
                    <div>
                      <span className="font-medium">位置:</span> {selectedProject.location}
                    </div>
                    <div>
                      <span className="font-medium">状态:</span> 
                      <Badge className="ml-2" variant={
                        selectedProject.status === 'completed' ? 'default' :
                        selectedProject.status === 'in_progress' ? 'secondary' :
                        selectedProject.status === 'published' || selectedProject.status === 'open' ? 'outline' : 'destructive'
                      }>
                        {selectedProject.status === 'published' || selectedProject.status === 'open' ? '开放' :
                         selectedProject.status === 'in_progress' ? '进行中' :
                         selectedProject.status === 'completed' ? '已完成' : '已取消'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">创建时间:</span> {new Date(selectedProject.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    <div>
                      <span className="font-medium">更新时间:</span> {new Date(selectedProject.updatedAt).toLocaleDateString('zh-CN')}
                    </div>
                    {selectedProject.phone && (
                      <div>
                        <span className="font-medium">联系电话:</span> {selectedProject.phone}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">响应数:</span> {selectedProject.responses}
                    </div>
                  </div>
                  {selectedProject.detailedDescription && (
                    <div>
                      <div className="font-medium">详细描述:</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedProject.detailedDescription}</div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>关闭</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
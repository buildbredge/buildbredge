"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Download,
  RefreshCw,
  Star,
  Eye,
  XCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

// Reuse AdminLayout component from dashboard
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

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    router.push("/htgl/login")
  }

  if (!adminUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">检查登录状态...</p>
      </div>
    </div>
  }

  const navItems = [
    { href: "/htgl/dashboard", icon: Users, label: "仪表板" },
    { href: "/htgl/users", icon: Users, label: "用户管理", active: true },
    { href: "/htgl/tradies", icon: Users, label: "技师管理" },
    { href: "/htgl/suppliers", icon: Users, label: "供应商管理" },
    { href: "/htgl/support", icon: Users, label: "客服管理" },
    { href: "/htgl/complaints", icon: Users, label: "投诉管理" },
    { href: "/htgl/reviews", icon: Users, label: "评价管理" },
    { href: "/htgl/htgls", icon: Users, label: "管理员管理" }
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

interface UserWithProjects {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  status: 'pending' | 'approved' | 'closed'
  created_at: string
  userType: 'owner' | 'tradie'
  company?: string | null
  specialty?: string | null
  service_radius?: number | null
  rating?: number | null
  review_count?: number
  balance?: number
  latitude?: number | null
  longitude?: number | null
  projects?: {
    total: number
    published: number
    completed: number
    cancelled: number
    lastPostDate: string | null
  }
}

interface UserStats {
  overview: {
    totalUsers: number
    totalOwners: number
    totalTradies: number
    totalProjects: number
    activeUsers: number
    pendingUsers: number
    thisMonthNewUsers: number
    lastMonthNewUsers: number
  }
  activity?: {
    activeOwners: number
    activeTradies: number
    inactiveOwners: number
    inactiveTradies: number
  }
  trends?: {
    registration: Array<{
      month: string
      owners: number
      tradies: number
      total: number
    }>
  }
}

export default function UsersManagePage() {
  const [users, setUsers] = useState<UserWithProjects[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null)
  const [statusChanging, setStatusChanging] = useState<string | null>(null)

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/users-stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载用户数据
  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        userType: userTypeFilter,
        status: statusFilter,
        search: searchTerm,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/user-activity?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data.users)
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadStats()
    loadUsers()
  }, [currentPage, userTypeFilter, statusFilter, searchTerm, sortBy, sortOrder])

  const filteredUsers = users

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowUserDialog(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("确定要删除这个用户吗？")) {
      setUsers(users.filter(user => user.id !== userId))
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'pending' | 'approved' | 'closed') => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const statusText = {
      pending: '待审核',
      approved: '已开通', 
      closed: '已关闭'
    }[newStatus]

    if (!confirm(`确定要将用户 ${user.name || user.email} 的状态更改为 "${statusText}" 吗？`)) {
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

  const handleViewUserDetail = (user: any) => {
    setSelectedUserDetail(user)
    setShowUserDetailDialog(true)
  }

  const handleBatchDelete = () => {
    if (selectedUsers.length === 0) return
    if (confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？`)) {
      setUsers(users.filter(user => !selectedUsers.includes(user.id)))
      setSelectedUsers([])
    }
  }

  const handleBatchApprove = () => {
    if (selectedUsers.length === 0) return
    if (confirm(`确定要批量审核通过选中的 ${selectedUsers.length} 个用户吗？`)) {
      // 这里可以调用API进行批量更新
      alert("批量审核功能开发中...")
    }
  }

  const handleExportUsers = () => {
    const csvContent = [
      ['姓名', '邮箱', '电话', '用户类型', '状态', '注册时间', '项目总数', '最后发帖时间'].join(','),
      ...users.map(user => [
        user.name || '',
        user.email,
        user.phone || '',
        user.userType === 'owner' ? '业主' : '技师',
        user.status === 'pending' ? '待审核' : user.status === 'approved' ? '已开通' : '已关闭',
        new Date(user.created_at).toLocaleDateString('zh-CN'),
        user.projects?.total || 0,
        user.projects?.lastPostDate ? new Date(user.projects.lastPostDate).toLocaleDateString('zh-CN') : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `用户数据_${new Date().toLocaleDateString('zh-CN')}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">待审核</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">已开通</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800">已关闭</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "owner":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">业主</Badge>
      case "tradie":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">技师</Badge>
      default:
        return <Badge variant="outline">{userType}</Badge>
    }
  }

  return (
    <AdminLayout title="用户管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-600">管理平台注册用户信息</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="w-4 h-4 mr-2" />
              导出用户
            </Button>
            <Button onClick={() => setShowUserDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats?.overview?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    业主 {stats?.overview?.totalOwners || 0} | 技师 {stats?.overview?.totalTradies || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">活跃用户</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats?.overview?.activeUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500">已发帖用户</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待审核用户</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats?.overview?.pendingUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500">等待审核</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">本月新增</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats?.overview?.thisMonthNewUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats?.overview?.lastMonthNewUsers && stats.overview.thisMonthNewUsers > stats.overview.lastMonthNewUsers 
                      ? `↗ +${stats.overview.thisMonthNewUsers - stats.overview.lastMonthNewUsers}` 
                      : stats?.overview?.lastMonthNewUsers && stats.overview.thisMonthNewUsers < stats.overview.lastMonthNewUsers
                      ? `↘ -${stats.overview.lastMonthNewUsers - stats.overview.thisMonthNewUsers}`
                      : ""}
                  </p>
                </div>
                <UserPlus className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trend Chart */}
        {stats?.trends?.registration && (
          <Card>
            <CardHeader>
              <CardTitle>用户注册趋势 (过去12个月)</CardTitle>
              <CardDescription>显示业主和技师的注册趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>业主</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span>技师</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>总计</span>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2 h-48">
                  {stats.trends.registration.map((month: any, index: number) => {
                    const maxTotal = Math.max(...stats.trends!.registration.map((m: any) => m.total))
                    const ownerHeight = maxTotal > 0 ? (month.owners / maxTotal) * 100 : 0
                    const tradieHeight = maxTotal > 0 ? (month.tradies / maxTotal) * 100 : 0
                    const totalHeight = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0
                    
                    return (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="flex-1 flex flex-col justify-end space-y-1" style={{ height: '160px' }}>
                          <div 
                            className="bg-blue-500 rounded-t" 
                            style={{ height: `${ownerHeight}%`, minHeight: month.owners > 0 ? '2px' : '0' }}
                            title={`业主: ${month.owners}`}
                          ></div>
                          <div 
                            className="bg-purple-500" 
                            style={{ height: `${tradieHeight}%`, minHeight: month.tradies > 0 ? '2px' : '0' }}
                            title={`技师: ${month.tradies}`}
                          ></div>
                          <div className="text-xs text-center text-gray-600 font-medium">
                            {month.total}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 transform -rotate-45 origin-center w-16 text-center">
                          {month.month}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Activity Overview */}
        {stats?.activity && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">用户活跃度分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>业主活跃度</span>
                      <span>{stats.activity.activeOwners}/{stats.overview.totalOwners}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.overview.totalOwners > 0 ? (stats.activity.activeOwners / stats.overview.totalOwners) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>技师活跃度</span>
                      <span>{stats.activity.activeTradies}/{stats.overview.totalTradies}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.overview.totalTradies > 0 ? (stats.activity.activeTradies / stats.overview.totalTradies) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">用户类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      {/* 简单的饼图 */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#e5e7eb"
                          strokeWidth="20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray={`${(stats.overview.totalOwners / stats.overview.totalUsers) * 251.3} 251.3`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="20"
                          strokeDasharray={`${(stats.overview.totalTradies / stats.overview.totalUsers) * 251.3} 251.3`}
                          strokeDashoffset={`-${(stats.overview.totalOwners / stats.overview.totalUsers) * 251.3}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-bold">{stats.overview.totalUsers}</div>
                          <div className="text-xs text-gray-500">总用户</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span>业主</span>
                      </div>
                      <div className="font-semibold">{stats.overview.totalOwners}</div>
                      <div className="text-gray-500">
                        {((stats.overview.totalOwners / stats.overview.totalUsers) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        <span>技师</span>
                      </div>
                      <div className="font-semibold">{stats.overview.totalTradies}</div>
                      <div className="text-gray-500">
                        {((stats.overview.totalTradies / stats.overview.totalUsers) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索用户姓名或邮箱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="用户类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="owner">业主</SelectItem>
                    <SelectItem value="tradie">技师</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="approved">已开通</SelectItem>
                    <SelectItem value="closed">已关闭</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">已选择 {selectedUsers.length} 个用户</span>
                  <Button variant="outline" size="sm" onClick={handleBatchApprove}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    批量审核
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBatchDelete}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    批量删除
                  </Button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">用户信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">联系方式</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">发帖统计</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">加入时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked === true)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-green-600 text-sm">
                              {user.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{user.name || "未设置"}</p>
                              {getUserTypeBadge(user.userType)}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.userType === 'tradie' && user.company && (
                              <p className="text-xs text-gray-400">{user.company}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone || "未设置"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.address || "未设置"}
                          </div>
                          {user.userType === 'tradie' && user.specialty && (
                            <div className="text-xs text-gray-500">
                              专长: {user.specialty}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(user.status)}
                          {user.userType === 'tradie' && user.rating && (
                            <div className="flex items-center text-xs text-yellow-600">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {user.rating.toFixed(1)} ({user.review_count})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{user.projects?.total || 0} 个项目</p>
                          <p className="text-gray-600">
                            {user.projects?.published || 0} 已发布 | {user.projects?.completed || 0} 已完成
                          </p>
                          {user.projects?.lastPostDate && (
                            <p className="text-xs text-gray-500">
                              最后发帖: {new Date(user.projects.lastPostDate).toLocaleDateString('zh-CN')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetail(user)}
                            title="查看详情"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="编辑用户"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={statusChanging === user.id}
                                title="更改状态"
                              >
                                {statusChanging === user.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Shield className="w-3 h-3" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* 只为技师用户显示状态更改选项 */}
                              {user.userType === 'tradie' ? (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(user.id, 'approved')}
                                    disabled={user.status === 'approved' || statusChanging === user.id}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-2" />
                                    审核通过
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(user.id, 'pending')}
                                    disabled={user.status === 'pending' || statusChanging === user.id}
                                    className="text-yellow-600"
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-2" />
                                    设为待审核
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(user.id, 'closed')}
                                    disabled={user.status === 'closed' || statusChanging === user.id}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-3 h-3 mr-2" />
                                    拒绝审核
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem disabled className="text-gray-400">
                                  <CheckCircle className="w-3 h-3 mr-2" />
                                  房主用户无需审核
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            title="删除用户"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">加载中...</p>
              </div>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">没有找到匹配的用户</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "编辑用户" : "添加新用户"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "修改用户信息" : "创建新的平台用户"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input id="name" placeholder="请输入姓名" />
              </div>
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="请输入邮箱" />
              </div>
              <div>
                <Label htmlFor="phone">电话</Label>
                <Input id="phone" placeholder="请输入电话号码" />
              </div>
              <div>
                <Label htmlFor="location">地区</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择地区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auckland-central">奥克兰中心</SelectItem>
                    <SelectItem value="auckland-north">奥克兰北岸</SelectItem>
                    <SelectItem value="auckland-west">奥克兰西区</SelectItem>
                    <SelectItem value="auckland-south">奥克兰南区</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">状态</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">不活跃</SelectItem>
                    <SelectItem value="suspended">已暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="verified" />
                <Label htmlFor="verified">邮箱已验证</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                取消
              </Button>
              <Button onClick={() => setShowUserDialog(false)}>
                {editingUser ? "保存修改" : "创建用户"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Detail Dialog */}
        <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>用户详情</DialogTitle>
              <DialogDescription>
                查看用户完整信息和活动记录
              </DialogDescription>
            </DialogHeader>
            {selectedUserDetail && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-green-600 text-xl">
                            {selectedUserDetail.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedUserDetail.name || "未设置"}</h3>
                          <div className="flex items-center space-x-2">
                            {getUserTypeBadge(selectedUserDetail.userType)}
                            {getStatusBadge(selectedUserDetail.status)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedUserDetail.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedUserDetail.phone || "未设置"}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedUserDetail.address || "未设置"}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>注册时间: {new Date(selectedUserDetail.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        {selectedUserDetail.userType === 'tradie' && (
                          <>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-400">🏢</span>
                              <span>公司: {selectedUserDetail.company || "未设置"}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-400">⚡</span>
                              <span>专长: {selectedUserDetail.specialty || "未设置"}</span>
                            </div>
                            {selectedUserDetail.rating && (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                                <span>评分: {selectedUserDetail.rating.toFixed(1)} ({selectedUserDetail.review_count} 评价)</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">活动统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedUserDetail.projects?.total || 0}
                            </div>
                            <div className="text-sm text-gray-600">总项目数</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedUserDetail.projects?.published || 0}
                            </div>
                            <div className="text-sm text-gray-600">已发布</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {selectedUserDetail.projects?.completed || 0}
                            </div>
                            <div className="text-sm text-gray-600">已完成</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {selectedUserDetail.projects?.cancelled || 0}
                            </div>
                            <div className="text-sm text-gray-600">已取消</div>
                          </div>
                        </div>
                        {selectedUserDetail.projects?.lastPostDate && (
                          <div className="text-sm text-gray-600 border-t pt-3">
                            <strong>最后发帖时间:</strong> {new Date(selectedUserDetail.projects.lastPostDate).toLocaleString('zh-CN')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 账户信息 */}
                {selectedUserDetail.userType === 'tradie' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">技师信息</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">服务半径</label>
                          <p className="text-lg">{selectedUserDetail.service_radius || 0} 公里</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">账户余额</label>
                          <p className="text-lg">${selectedUserDetail.balance?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">坐标位置</label>
                          <p className="text-sm text-gray-600">
                            {selectedUserDetail.latitude && selectedUserDetail.longitude 
                              ? `${selectedUserDetail.latitude.toFixed(4)}, ${selectedUserDetail.longitude.toFixed(4)}`
                              : "未设置"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowUserDetailDialog(false)}>
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Shield, 
  Eye,
  UserCheck,
  UserX,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react"
// import { AdminAPI } from "@/lib/htgl-api"
import { AdminRole, AdminSession } from "../../../../lib/supabase"

interface AdminData {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: string[]
  avatar: string | null
  phone: string | null
  department: string | null
  is_active: boolean
  last_login_at: string | null
  login_count: number
  created_at: string
  total_activities: number
  recent_activities: number
  last_action: string | null
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<AdminRole | "">("")
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<AdminSession | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 新管理员表单数据
  const [newAdminData, setNewAdminData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin" as AdminRole,
    phone: "",
    department: "",
    permissions: [] as string[]
  })

  useEffect(() => {
    // 获取当前管理员信息
    const adminUser = localStorage.getItem('adminUser')
    if (adminUser) {
      setCurrentAdmin(JSON.parse(adminUser))
    }
    
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      // const adminsList = await AdminAPI.getAdmins()
      // setAdmins(adminsList)
      setAdmins([]) // Temporary - will implement API calls later
    } catch (error) {
      console.error('加载管理员列表失败:', error)
      setError('加载管理员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!currentAdmin) return

    try {
      setError("")
      setSuccess("")

      // const result = await AdminAPI.createAdmin({
      //   ...newAdminData,
      //   created_by: currentAdmin.id
      // })

      // Temporary mock success
      const result = true

      if (result) {
        setSuccess("管理员创建成功")
        setShowCreateDialog(false)
        setNewAdminData({
          email: "",
          password: "",
          name: "",
          role: "admin",
          phone: "",
          department: "",
          permissions: []
        })
        loadAdmins()
      } else {
        setError("创建管理员失败")
      }
    } catch (error) {
      console.error('创建管理员错误:', error)
      setError("创建管理员时发生错误")
    }
  }

  const handleToggleAdminStatus = async (adminId: string, isActive: boolean) => {
    if (!currentAdmin) return

    try {
      setError("")
      setSuccess("")

      // const result = isActive 
      //   ? await AdminAPI.deactivateAdmin(adminId, currentAdmin.id)
      //   : await AdminAPI.activateAdmin(adminId, currentAdmin.id)

      // Temporary mock success
      const result = true

      if (result) {
        setSuccess(`管理员${isActive ? '停用' : '激活'}成功`)
        loadAdmins()
      } else {
        setError(`${isActive ? '停用' : '激活'}管理员失败`)
      }
    } catch (error) {
      console.error('更新管理员状态错误:', error)
      setError("更新管理员状态时发生错误")
    }
  }

  // 过滤管理员列表
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || admin.role === roleFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === "active" && admin.is_active) ||
                         (statusFilter === "inactive" && !admin.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'moderator': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return '超级管理员'
      case 'admin': return '管理员'
      case 'moderator': return '版主'
      default: return role
    }
  }

  const availablePermissions = [
    { key: 'user_management', label: '用户管理' },
    { key: 'project_management', label: '项目管理' },
    { key: 'tradie_management', label: '技师管理' },
    { key: 'review_management', label: '评价管理' },
    { key: 'system_settings', label: '系统设置' },
    { key: 'admin_management', label: '管理员管理' },
    { key: 'activity_logs', label: '活动日志' },
    { key: 'database_management', label: '数据库管理' },
    { key: 'support_tickets', label: '支持工单' },
    { key: 'content_moderation', label: '内容审核' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">管理员管理</h1>
          </div>
          <p className="text-gray-600">管理系统管理员账户和权限</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>管理员列表</CardTitle>
            <CardDescription>当前共有 {filteredAdmins.length} 个管理员账户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索管理员..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as AdminRole | "")}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="所有角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="moderator">版主</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "active" | "inactive" | "")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="所有状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>

              {/* Create Button */}
              {currentAdmin?.role === 'super_admin' && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      新建管理员
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>创建新管理员</DialogTitle>
                      <DialogDescription>
                        添加新的管理员账户到系统
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">邮箱地址</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAdminData.email}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="admin@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">密码</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="至少8位字符"
                        />
                      </div>

                      <div>
                        <Label htmlFor="name">姓名</Label>
                        <Input
                          id="name"
                          value={newAdminData.name}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="管理员姓名"
                        />
                      </div>

                      <div>
                        <Label htmlFor="role">角色</Label>
                        <Select value={newAdminData.role} onValueChange={(value) => setNewAdminData(prev => ({ ...prev, role: value as AdminRole }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">管理员</SelectItem>
                            <SelectItem value="moderator">版主</SelectItem>
                            <SelectItem value="super_admin">超级管理员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="department">部门</Label>
                        <Input
                          id="department"
                          value={newAdminData.department}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="IT部门"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleCreateAdmin} className="flex-1">
                          创建管理员
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          取消
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Admins Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>管理员信息</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead>活动统计</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(admin.role)}>
                          {getRoleDisplayName(admin.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{admin.department || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.is_active ? "default" : "secondary"}>
                          {admin.is_active ? "活跃" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {admin.last_login_at 
                            ? new Date(admin.last_login_at).toLocaleString('zh-CN')
                            : '从未登录'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          登录 {admin.login_count} 次
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>总活动: {admin.total_activities}</div>
                          <div className="text-gray-500">近30天: {admin.recent_activities}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {currentAdmin?.role === 'super_admin' && admin.id !== currentAdmin.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAdminStatus(admin.id, admin.is_active)}
                            >
                              {admin.is_active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAdmins.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                未找到符合条件的管理员
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
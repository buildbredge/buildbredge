"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Tag,
  Briefcase,
  AlertCircle,
  CheckCircle,
  // 职业图标
  Hammer,
  Wrench,
  HardHat,
  Zap,
  Droplets,
  Paintbrush,
  Scissors,
  Car,
  Truck,
  Home,
  Building,
  Building2,
  Trees,
  Flower,
  Stethoscope,
  GraduationCap,
  Calculator,
  PenTool,
  Camera,
  Music,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Laptop,
  Smartphone,
  Settings,
  Cog,
  Users,
  User,
  Shield,
  Lock,
  Key,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  MapPin,
  Plane,
  Ship,
  Train,
  Heart,
  Star,
  Award,
  Target,
  TrendingUp
} from "lucide-react"
import { useRouter } from "next/navigation"
import { adminGet, adminPost, adminPatch, adminDelete } from "@/lib/adminApi"

// 图标映射
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Hammer,
  Wrench,
  HardHat,
  Zap,
  Droplets,
  Paintbrush,
  Scissors,
  Car,
  Truck,
  Home,
  Building,
  Building2,
  Trees,
  Flower,
  Stethoscope,
  GraduationCap,
  Calculator,
  PenTool,
  Camera,
  Music,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Laptop,
  Smartphone,
  Settings,
  Cog,
  Users,
  User,
  Shield,
  Lock,
  Key,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  MapPin,
  Plane,
  Ship,
  Train,
  Heart,
  Star,
  Award,
  Target,
  TrendingUp
}

// 按分类组织的图标
const iconCategories = {
  建筑工具: ['Hammer', 'Wrench', 'HardHat', 'Building', 'Building2', 'Home'],
  电气水暖: ['Zap', 'Droplets', 'Settings', 'Cog'],
  艺术设计: ['Paintbrush', 'PenTool', 'Camera', 'Scissors'],
  交通运输: ['Car', 'Truck', 'Plane', 'Ship', 'Train'],
  园艺绿化: ['Trees', 'Flower'],
  医疗健康: ['Stethoscope', 'Heart'],
  教育培训: ['GraduationCap', 'Calculator'],
  科技数码: ['Laptop', 'Smartphone', 'Globe'],
  商业服务: ['ShoppingCart', 'Coffee', 'UtensilsCrossed'],
  人员管理: ['Users', 'User', 'Shield'],
  通讯联络: ['MessageSquare', 'Phone', 'Mail'],
  其他: ['Lock', 'Key', 'MapPin', 'Music', 'Star', 'Award', 'Target', 'TrendingUp']
}

// 获取图标组件
const getIconComponent = (iconName: string | null) => {
  if (!iconName || !iconMap[iconName]) {
    return Briefcase // 默认图标
  }
  return iconMap[iconName]
}

// AdminLayout component (from parent page)
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
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
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
    { href: "/htgl", icon: FileText, label: "仪表板" },
    { href: "/htgl/users", icon: FileText, label: "用户管理" },
    { href: "/htgl/tradies", icon: FileText, label: "技师管理" },
    { href: "/htgl/suppliers", icon: FileText, label: "供应商管理" },
    { href: "/htgl/industries", icon: FileText, label: "行业管理", active: title === "行业管理" },
    { href: "/htgl/support", icon: FileText, label: "客服管理" },
    { href: "/htgl/complaints", icon: FileText, label: "投诉管理" },
    { href: "/htgl/reviews", icon: FileText, label: "评价管理" },
    { href: "/htgl/admins", icon: FileText, label: "管理员管理" }
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
                  <FileText className="w-5 h-5 text-white" />
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

interface Category {
  id: string
  name_en: string
  name_zh: string
  description: string | null
  created_at: string
  professionsCount?: number
}

interface Profession {
  id: string
  category_id: string | null
  name_en: string
  name_zh: string
  description: string | null
  icon: string | null
  created_at: string
  category?: {
    name_zh: string
    name_en: string
  }
}

export default function IndustriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [professions, setProfessions] = useState<Profession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showProfessionDialog, setShowProfessionDialog] = useState(false)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProfession, setEditingProfession] = useState<Profession | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'profession', id: string, name: string } | null>(null)
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name_en: "",
    name_zh: "",
    description: ""
  })
  
  const [professionForm, setProfessionForm] = useState({
    category_id: "",
    name_en: "",
    name_zh: "",
    description: "",
    icon: ""
  })

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [categoriesResult, professionsResult] = await Promise.all([
        adminGet('/api/admin/categories'),
        adminGet('/api/admin/professions')
      ])

      if (categoriesResult?.success) {
        setCategories(categoriesResult.data)
      }
      
      if (professionsResult?.success) {
        setProfessions(professionsResult.data)
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = editingCategory
        ? await adminPatch(`/api/admin/categories/${editingCategory.id}`, categoryForm)
        : await adminPost('/api/admin/categories', categoryForm)

      if (result?.success) {
        loadData() // Reload data
        setShowCategoryDialog(false)
        resetCategoryForm()
      } else {
        alert(result?.error || '操作失败')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('保存分类时发生错误')
    }
  }

  const handleProfessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert "none" to null for category_id
      const submitData = {
        ...professionForm,
        category_id: professionForm.category_id === "none" ? null : professionForm.category_id || null
      }

      const result = editingProfession
        ? await adminPatch(`/api/admin/professions/${editingProfession.id}`, submitData)
        : await adminPost('/api/admin/professions', submitData)

      if (result?.success) {
        loadData() // Reload data
        setShowProfessionDialog(false)
        resetProfessionForm()
      } else {
        alert(result?.error || '操作失败')
      }
    } catch (error) {
      console.error('Error saving profession:', error)
      alert('保存职业时发生错误')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      const endpoint = deleteConfirm.type === 'category' 
        ? `/api/admin/categories/${deleteConfirm.id}`
        : `/api/admin/professions/${deleteConfirm.id}`
        
      const result = await adminDelete(endpoint)

      if (result?.success) {
        loadData() // Reload data
        setDeleteConfirm(null)
      } else {
        alert(result?.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('删除时发生错误')
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name_en: "", name_zh: "", description: "" })
    setEditingCategory(null)
  }

  const resetProfessionForm = () => {
    setProfessionForm({ category_id: "none", name_en: "", name_zh: "", description: "", icon: "" })
    setEditingProfession(null)
  }

  const openCategoryEdit = (category: Category) => {
    setCategoryForm({
      name_en: category.name_en,
      name_zh: category.name_zh,
      description: category.description || ""
    })
    setEditingCategory(category)
    setShowCategoryDialog(true)
  }

  const openProfessionEdit = (profession: Profession) => {
    setProfessionForm({
      category_id: profession.category_id || "none",
      name_en: profession.name_en,
      name_zh: profession.name_zh,
      description: profession.description || "",
      icon: profession.icon || ""
    })
    setEditingProfession(profession)
    setShowProfessionDialog(true)
  }

  const filteredCategories = categories.filter(category =>
    category.name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_en.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProfessions = professions.filter(profession =>
    profession.name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profession.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profession.category?.name_zh?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <AdminLayout title="行业管理">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">行业管理</h1>
              <p className="text-gray-600">管理平台的行业分类和职业类型</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowCategoryDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加分类
              </Button>
              <Button onClick={() => setShowProfessionDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加职业
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索分类或职业..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>分类管理</span>
              </TabsTrigger>
              <TabsTrigger value="professions" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>职业管理</span>
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>分类管理</CardTitle>
                  <CardDescription>管理行业分类，每个分类可以包含多个职业</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>中文名称</TableHead>
                          <TableHead>英文名称</TableHead>
                          <TableHead>职业数量</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name_zh}</TableCell>
                            <TableCell>{category.name_en}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {professions.filter(p => p.category_id === category.id).length} 个职业
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(category.created_at).toLocaleDateString('zh-CN')}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openCategoryEdit(category)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setDeleteConfirm({
                                      type: 'category',
                                      id: category.id,
                                      name: category.name_zh
                                    })}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professions Tab */}
            <TabsContent value="professions">
              <Card>
                <CardHeader>
                  <CardTitle>职业管理</CardTitle>
                  <CardDescription>管理各个职业类型，可以关联到对应的分类</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>中文名称</TableHead>
                          <TableHead>英文名称</TableHead>
                          <TableHead>所属分类</TableHead>
                          <TableHead>图标</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfessions.map((profession) => (
                          <TableRow key={profession.id}>
                            <TableCell className="font-medium">{profession.name_zh}</TableCell>
                            <TableCell>{profession.name_en}</TableCell>
                            <TableCell>
                              {profession.category ? (
                                <Badge>{profession.category.name_zh}</Badge>
                              ) : (
                                <Badge variant="secondary">未分类</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {profession.icon ? (
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const IconComponent = getIconComponent(profession.icon)
                                    return <IconComponent className="w-5 h-5 text-gray-600" />
                                  })()}
                                  <span className="text-sm text-gray-500">{profession.icon}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{new Date(profession.created_at).toLocaleDateString('zh-CN')}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openProfessionEdit(profession)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setDeleteConfirm({
                                      type: 'profession',
                                      id: profession.id,
                                      name: profession.name_zh
                                    })}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={(open) => {
        setShowCategoryDialog(open)
        if (!open) resetCategoryForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? '修改分类信息' : '创建新的行业分类'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="name_zh">中文名称</Label>
              <Input
                id="name_zh"
                value={categoryForm.name_zh}
                onChange={(e) => setCategoryForm({...categoryForm, name_zh: e.target.value})}
                placeholder="例如：建筑装修"
                required
              />
            </div>
            <div>
              <Label htmlFor="name_en">英文名称</Label>
              <Input
                id="name_en"
                value={categoryForm.name_en}
                onChange={(e) => setCategoryForm({...categoryForm, name_en: e.target.value})}
                placeholder="例如：Construction"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="分类描述（可选）"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingCategory ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profession Dialog */}
      <Dialog open={showProfessionDialog} onOpenChange={(open) => {
        setShowProfessionDialog(open)
        if (!open) resetProfessionForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProfession ? '编辑职业' : '添加职业'}</DialogTitle>
            <DialogDescription>
              {editingProfession ? '修改职业信息' : '创建新的职业类型'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfessionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">所属分类</Label>
              <Select 
                value={professionForm.category_id} 
                onValueChange={(value) => setProfessionForm({...professionForm, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_zh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prof_name_zh">中文名称</Label>
              <Input
                id="prof_name_zh"
                value={professionForm.name_zh}
                onChange={(e) => setProfessionForm({...professionForm, name_zh: e.target.value})}
                placeholder="例如：水电工"
                required
              />
            </div>
            <div>
              <Label htmlFor="prof_name_en">英文名称</Label>
              <Input
                id="prof_name_en"
                value={professionForm.name_en}
                onChange={(e) => setProfessionForm({...professionForm, name_en: e.target.value})}
                placeholder="例如：Electrician"
                required
              />
            </div>
            <div>
              <Label htmlFor="icon">图标</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIconSelector(true)}
                  className="flex items-center space-x-2"
                >
                  {professionForm.icon ? (
                    <>
                      {(() => {
                        const IconComponent = getIconComponent(professionForm.icon)
                        return <IconComponent className="w-4 h-4" />
                      })()}
                      <span>{professionForm.icon}</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>选择图标</span>
                    </>
                  )}
                </Button>
                {professionForm.icon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfessionForm({...professionForm, icon: ""})}
                  >
                    清除
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="prof_description">描述</Label>
              <Textarea
                id="prof_description"
                value={professionForm.description}
                onChange={(e) => setProfessionForm({...professionForm, description: e.target.value})}
                placeholder="职业描述（可选）"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProfessionDialog(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingProfession ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Icon Selector Dialog */}
      <Dialog open={showIconSelector} onOpenChange={setShowIconSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择图标</DialogTitle>
            <DialogDescription>
              为职业选择一个合适的图标
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(iconCategories).map(([categoryName, icons]) => (
              <div key={categoryName}>
                <h3 className="text-lg font-medium mb-3">{categoryName}</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                  {icons.map((iconName) => {
                    const IconComponent = iconMap[iconName]
                    const isSelected = professionForm.icon === iconName
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          setProfessionForm({...professionForm, icon: iconName})
                          setShowIconSelector(false)
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors hover:bg-gray-50 ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={iconName}
                      >
                        <IconComponent className={`w-6 h-6 mb-1 ${
                          isSelected ? 'text-green-600' : 'text-gray-600'
                        }`} />
                        <span className={`text-xs ${
                          isSelected ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {iconName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowIconSelector(false)}
            >
              取消
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setProfessionForm({...professionForm, icon: ""})
                setShowIconSelector(false)
              }}
            >
              清除图标
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 "{deleteConfirm?.name}" 吗？此操作不可撤销。
              {deleteConfirm?.type === 'category' && "注意：删除分类可能会影响关联的职业。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
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
  Building,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  Truck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  UserPlus,
  Calendar,
  DollarSign
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
              <li><a href="/htgl" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>仪表板</span></a></li>
              <li><a href="/htgl/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>用户管理</span></a></li>
              <li><a href="/htgl/tradies" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>技师管理</span></a></li>
              <li><a href="/htgl/suppliers" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700"><Building className="w-5 h-5" /><span>供应商管理</span></a></li>
              <li><a href="/htgl/support" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>客服管理</span></a></li>
              <li><a href="/htgl/complaints" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>投诉管理</span></a></li>
              <li><a href="/htgl/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Building className="w-5 h-5" /><span>评价管理</span></a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function SuppliersManagePage() {
  const [suppliers, setSuppliers] = useState([
    {
      id: "S001",
      companyName: "奥克兰建材供应中心",
      contactPerson: "张经理",
      email: "zhang@materials.co.nz",
      phone: "+64 9 123 4567",
      address: "123 Queen Street, Auckland Central",
      category: "建筑材料",
      products: ["水泥", "钢筋", "砖块", "瓷砖"],
      rating: 4.2,
      reviewCount: 45,
      totalOrders: 156,
      totalRevenue: "$125,000",
      status: "verified",
      joinDate: "2023-05-20",
      businessLicense: "有效至 2025-05-20",
      deliveryAreas: ["奥克兰中心", "奥克兰北岸", "奥克兰西区"]
    },
    {
      id: "S002",
      companyName: "优质五金工具店",
      contactPerson: "李老板",
      email: "li@hardware.co.nz",
      phone: "+64 9 234 5678",
      address: "456 Dominion Road, Auckland",
      category: "五金工具",
      products: ["电动工具", "手工工具", "紧固件", "测量工具"],
      rating: 4.6,
      reviewCount: 78,
      totalOrders: 203,
      totalRevenue: "$89,500",
      status: "verified",
      joinDate: "2023-03-15",
      businessLicense: "有效至 2024-12-31",
      deliveryAreas: ["奥克兰中心", "奥克兰南区"]
    },
    {
      id: "S003",
      companyName: "绿色家装材料",
      contactPerson: "王女士",
      email: "wang@green-materials.co.nz",
      phone: "+64 9 345 6789",
      address: "789 Great North Road, Auckland",
      category: "环保材料",
      products: ["环保涂料", "竹地板", "回收木材", "天然石材"],
      rating: 4.8,
      reviewCount: 32,
      totalOrders: 67,
      totalRevenue: "$45,200",
      status: "pending",
      joinDate: "2024-01-08",
      businessLicense: "审核中",
      deliveryAreas: ["奥克兰西区", "奥克兰中心"]
    },
    {
      id: "S004",
      companyName: "快速送货建材",
      contactPerson: "刘先生",
      email: "liu@fastdelivery.co.nz",
      phone: "+64 9 456 7890",
      address: "321 Manukau Road, Auckland",
      category: "建筑材料",
      products: ["混凝土", "石膏板", "保温材料", "防水材料"],
      rating: 3.8,
      reviewCount: 23,
      totalOrders: 89,
      totalRevenue: "$67,800",
      status: "suspended",
      joinDate: "2023-11-12",
      businessLicense: "有效至 2025-11-12",
      deliveryAreas: ["奥克兰南区", "奥克兰东区"]
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [showSupplierDialog, setShowSupplierDialog] = useState(false)

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
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

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier)
    setShowSupplierDialog(true)
  }

  const handleApproveSupplier = (supplierId: string) => {
    setSuppliers(suppliers.map(s =>
      s.id === supplierId ? { ...s, status: "verified" } : s
    ))
  }

  const handleSuspendSupplier = (supplierId: string) => {
    if (confirm("确定要暂停这个供应商吗？")) {
      setSuppliers(suppliers.map(s =>
        s.id === supplierId ? { ...s, status: "suspended" } : s
      ))
    }
  }

  const categories = ["建筑材料", "五金工具", "环保材料", "装饰材料", "电器设备"]

  return (
    <AdminLayout title="供应商管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">供应商管理</h1>
            <p className="text-gray-600">管理平台合作的建材和工具供应商</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              添加供应商
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总供应商</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">已认证</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {suppliers.filter(s => s.status === "verified").length}
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
                    {suppliers.filter(s => s.status === "pending").length}
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
                  <p className="text-2xl font-bold text-gray-900">4.4</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总营收</p>
                  <p className="text-2xl font-bold text-gray-900">$327K</p>
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
                  placeholder="搜索供应商名称、联系人或产品..."
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类别</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Suppliers Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">供应商信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">联系方式</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">产品类别</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">评价</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">业绩</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{supplier.companyName}</p>
                            <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              加入 {supplier.joinDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            {supplier.address.substring(0, 20)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <Badge variant="outline" className="mb-2">{supplier.category}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {supplier.products.slice(0, 2).map((product, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {product}
                              </span>
                            ))}
                            {supplier.products.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{supplier.products.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{supplier.rating}</span>
                          <span className="text-sm text-gray-500">({supplier.reviewCount})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{supplier.totalOrders} 订单</p>
                          <p className="text-gray-600">{supplier.totalRevenue}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(supplier.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {supplier.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600"
                              onClick={() => handleApproveSupplier(supplier.id)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendSupplier(supplier.id)}
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

        {/* Supplier Detail Dialog */}
        <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>供应商详情：{selectedSupplier?.companyName}</span>
              </DialogTitle>
              <DialogDescription>
                查看和管理供应商的详细信息
              </DialogDescription>
            </DialogHeader>

            {selectedSupplier && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">公司名称</Label>
                        <p className="text-gray-900">{selectedSupplier.companyName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">联系人</Label>
                        <p className="text-gray-900">{selectedSupplier.contactPerson}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">邮箱</Label>
                        <p className="text-gray-900">{selectedSupplier.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">电话</Label>
                        <p className="text-gray-900">{selectedSupplier.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">地址</Label>
                        <p className="text-gray-900">{selectedSupplier.address}</p>
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
                          <span className="font-medium">{selectedSupplier.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">评价数量</span>
                        <span className="font-medium">{selectedSupplier.reviewCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总订单数</span>
                        <span className="font-medium">{selectedSupplier.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总营收</span>
                        <span className="font-medium">{selectedSupplier.totalRevenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">加入时间</span>
                        <span className="font-medium">{selectedSupplier.joinDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Products & Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">产品信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">产品类别</Label>
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        {selectedSupplier.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">主要产品</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSupplier.products.map((product: string, index: number) => (
                          <Badge key={index} variant="outline">
                            <Package className="w-3 h-3 mr-1" />
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery & License */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">配送区域</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.deliveryAreas.map((area: string, index: number) => (
                          <Badge key={index} variant="outline">
                            <Truck className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">资质认证</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">营业执照</Label>
                        <p className="text-gray-900">{selectedSupplier.businessLicense}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">认证状态</Label>
                        <div className="mt-1">{getStatusBadge(selectedSupplier.status)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  {selectedSupplier.status === "pending" && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApproveSupplier(selectedSupplier.id)
                        setShowSupplierDialog(false)
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
                      handleSuspendSupplier(selectedSupplier.id)
                      setShowSupplierDialog(false)
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    暂停合作
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

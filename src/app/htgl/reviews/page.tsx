"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  Search,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  ThumbsUp,
  MessageCircle,
  AlertTriangle
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
              <li><a href="/htgl/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>仪表板</span></a></li>
              <li><a href="/htgl/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>用户管理</span></a></li>
              <li><a href="/htgl/tradies" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>技师管理</span></a></li>
              <li><a href="/htgl/suppliers" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>供应商管理</span></a></li>
              <li><a href="/htgl/support" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>客服管理</span></a></li>
              <li><a href="/htgl/complaints" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"><Star className="w-5 h-5" /><span>投诉管理</span></a></li>
              <li><a href="/htgl/reviews" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700"><Star className="w-5 h-5" /><span>评价管理</span></a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function ReviewsManagePage() {
  const [reviews, setReviews] = useState([
    {
      id: "R001",
      projectTitle: "厨房翻新项目",
      reviewer: "张女士",
      reviewerEmail: "zhang@email.com",
      reviewee: "李师傅专业装修",
      revieweeType: "tradie",
      rating: 5,
      comment: "李师傅的工作非常专业，厨房翻新效果超出预期。施工过程中非常细致，清理工作也做得很好。强烈推荐！",
      photos: ["kitchen1.jpg", "kitchen2.jpg"],
      createdDate: "2024-12-08",
      status: "published",
      helpful: 15,
      reported: false,
      adminNotes: ""
    },
    {
      id: "R002",
      projectTitle: "电路维修",
      reviewer: "李先生",
      reviewerEmail: "li@email.com",
      reviewee: "王师傅电工服务",
      revieweeType: "tradie",
      rating: 4,
      comment: "王师傅技术很好，解决了我家的电路问题。就是来得稍微晚了一点，不过工作质量没问题。",
      photos: [],
      createdDate: "2024-12-06",
      status: "published",
      helpful: 8,
      reported: false,
      adminNotes: ""
    },
    {
      id: "R003",
      projectTitle: "建材采购",
      reviewer: "刘女士",
      reviewerEmail: "liu@email.com",
      reviewee: "奥克兰建材供应",
      revieweeType: "supplier",
      rating: 2,
      comment: "材料质量一般，而且送货时间不准时。客服态度也不是很好，以后不会再选择这家了。",
      photos: [],
      createdDate: "2024-12-05",
      status: "flagged",
      helpful: 3,
      reported: true,
      adminNotes: "供应商已联系，承诺改进服务质量"
    },
    {
      id: "R004",
      projectTitle: "水管维修",
      reviewer: "王先生",
      reviewerEmail: "wang@email.com",
      reviewee: "刘师傅水管维修",
      revieweeType: "tradie",
      rating: 5,
      comment: "非常满意的服务！刘师傅不仅技术过硬，人也很好。修好了困扰我们很久的漏水问题，价格也很合理。会推荐给朋友的。",
      photos: ["pipe1.jpg"],
      createdDate: "2024-12-04",
      status: "published",
      helpful: 12,
      reported: false,
      adminNotes: ""
    },
    {
      id: "R005",
      projectTitle: "装修材料",
      reviewer: "陈女士",
      reviewerEmail: "chen@email.com",
      reviewee: "优质建材中心",
      revieweeType: "supplier",
      rating: 1,
      comment: "这是什么垃圾材料？完全不值这个价钱！骗子公司，大家千万别上当！！！",
      photos: [],
      createdDate: "2024-12-03",
      status: "pending",
      helpful: 0,
      reported: true,
      adminNotes: "内容涉嫌恶意攻击，需要进一步调查"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesType = typeFilter === "all" || review.revieweeType === typeFilter
    return matchesSearch && matchesRating && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已发布</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><MessageCircle className="w-3 h-3 mr-1" />待审核</Badge>
      case "flagged":
        return <Badge className="bg-red-100 text-red-800"><Flag className="w-3 h-3 mr-1" />已标记</Badge>
      case "hidden":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />已隐藏</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const handleViewReview = (review: any) => {
    setSelectedReview(review)
    setShowReviewDialog(true)
  }

  const handleUpdateStatus = (reviewId: string, newStatus: string) => {
    setReviews(reviews.map(r =>
      r.id === reviewId ? { ...r, status: newStatus } : r
    ))
    if (selectedReview?.id === reviewId) {
      setSelectedReview({ ...selectedReview, status: newStatus })
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0"

  return (
    <AdminLayout title="评价管理">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">评价管理</h1>
            <p className="text-gray-600">管理和审核用户评价与反馈</p>
          </div>
          <Button>
            <Flag className="w-4 h-4 mr-2" />
            批量操作
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总评价数</p>
                  <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均评分</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900 mr-1">{averageRating}</p>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待审核</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">被举报</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews.filter(r => r.reported).length}
                  </p>
                </div>
                <Flag className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">获赞总数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews.reduce((sum, r) => sum + r.helpful, 0)}
                  </p>
                </div>
                <ThumbsUp className="w-8 h-8 text-green-600" />
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
                  placeholder="搜索评价内容、评价人或被评价方..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有评分</SelectItem>
                  <SelectItem value="5">5星</SelectItem>
                  <SelectItem value="4">4星</SelectItem>
                  <SelectItem value="3">3星</SelectItem>
                  <SelectItem value="2">2星</SelectItem>
                  <SelectItem value="1">1星</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="flagged">已标记</SelectItem>
                  <SelectItem value="hidden">已隐藏</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="tradie">技师评价</SelectItem>
                  <SelectItem value="supplier">供应商评价</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">评价信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">评价人</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">被评价方</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">评分</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">互动</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{review.projectTitle}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{review.comment}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {review.createdDate}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewer}</p>
                          <p className="text-sm text-gray-500">{review.reviewerEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewee}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {review.revieweeType === "tradie" ? "技师" : "供应商"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          {getRatingStars(review.rating)}
                          <span className="ml-2 font-medium">{review.rating}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(review.status)}
                          {review.reported && (
                            <div className="flex items-center text-xs text-red-600">
                              <Flag className="w-3 h-3 mr-1" />
                              被举报
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <ThumbsUp className="w-3 h-3 text-green-600 mr-1" />
                            <span>{review.helpful}</span>
                          </div>
                          {review.photos.length > 0 && (
                            <div className="flex items-center text-xs text-blue-600">
                              <span>{review.photos.length} 张照片</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReview(review)}
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

        {/* Review Detail Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>评价详情：{selectedReview?.projectTitle}</span>
              </DialogTitle>
              <DialogDescription>
                评价编号：{selectedReview?.id} | 发表时间：{selectedReview?.createdDate}
              </DialogDescription>
            </DialogHeader>

            {selectedReview && (
              <div className="space-y-6">
                {/* Rating & Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">评价信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getRatingStars(selectedReview.rating)}
                          <span className="font-bold text-lg">{selectedReview.rating}/5</span>
                        </div>
                        <p className="text-gray-900">{selectedReview.comment}</p>
                      </div>
                      {selectedReview.photos.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">评价照片</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedReview.photos.map((photo: string, index: number) => (
                              <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-500">{photo}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">当前状态</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">发布状态</p>
                        <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">获赞数量</p>
                        <div className="flex items-center mt-1">
                          <ThumbsUp className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-medium">{selectedReview.helpful}</span>
                        </div>
                      </div>
                      {selectedReview.reported && (
                        <div>
                          <p className="text-sm text-gray-600">举报状态</p>
                          <div className="flex items-center mt-1 text-red-600">
                            <Flag className="w-4 h-4 mr-1" />
                            <span>已被举报</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">评价人</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedReview.reviewer}</p>
                        <p className="text-sm text-gray-600">{selectedReview.reviewerEmail}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">被评价方</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedReview.reviewee}</p>
                        <Badge variant="outline">
                          {selectedReview.revieweeType === "tradie" ? "技师" : "供应商"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">管理员备注</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="添加管理员备注..."
                      value={selectedReview.adminNotes}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Select
                      value={selectedReview.status}
                      onValueChange={(value) => handleUpdateStatus(selectedReview.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">发布</SelectItem>
                        <SelectItem value="pending">待审核</SelectItem>
                        <SelectItem value="flagged">标记</SelectItem>
                        <SelectItem value="hidden">隐藏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline">
                      保存备注
                    </Button>
                    {selectedReview.reported && (
                      <Button variant="outline" className="text-red-600 border-red-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        处理举报
                      </Button>
                    )}
                    <Button>
                      联系评价人
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

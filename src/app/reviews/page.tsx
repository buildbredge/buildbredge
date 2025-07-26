"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  Star,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Upload,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
  Filter,
  Search,
  Flag,
  Heart,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Review {
  id: string
  projectId: string
  projectTitle: string
  reviewer: {
    id: string
    name: string
    avatar: string
    type: "homeowner" | "tradie"
  }
  reviewee: {
    id: string
    name: string
    avatar: string
    company?: string
    type: "homeowner" | "tradie"
  }
  rating: {
    overall: number
    quality: number
    communication: number
    timeliness: number
    value: number
  }
  title: string
  content: string
  images?: string[]
  date: string
  verified: boolean
  helpful: number
  notHelpful: number
  replies: Reply[]
  tags: string[]
}

interface Reply {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    type: "homeowner" | "tradie" | "admin"
  }
  content: string
  date: string
}

interface ReviewForm {
  projectId: string
  projectTitle: string
  tradieId: string
  tradieName: string
  rating: {
    overall: number
    quality: number
    communication: number
    timeliness: number
    value: number
  }
  title: string
  content: string
  images: File[]
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRating, setFilterRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // 模拟评价数据
  const reviews: Review[] = [
    {
      id: "1",
      projectId: "proj-001",
      projectTitle: "厨房翻新改造",
      reviewer: {
        id: "user1",
        name: "张三",
        avatar: "ZS",
        type: "homeowner"
      },
      reviewee: {
        id: "tradie1",
        name: "张建国",
        avatar: "ZJG",
        company: "精工建筑有限公司",
        type: "tradie"
      },
      rating: {
        overall: 5,
        quality: 5,
        communication: 5,
        timeliness: 4,
        value: 5
      },
      title: "超棒的厨房翻新体验！",
      content: "张师傅的工作非常专业，从设计到施工都很满意。厨房从老式变成了现代化的开放式设计，效果超出预期。工期也很准时，材料质量很好，价格合理。强烈推荐！",
      images: ["🏠", "✨", "👍"],
      date: "2025-01-03",
      verified: true,
      helpful: 8,
      notHelpful: 0,
      replies: [
        {
          id: "reply1",
          author: {
            id: "tradie1",
            name: "张建国",
            avatar: "ZJG",
            type: "tradie"
          },
          content: "谢谢张先生的好评！很高兴您满意我们的工作。如果后续有任何问题，随时联系我。",
          date: "2025-01-04"
        }
      ],
      tags: ["专业", "准时", "质量优秀", "推荐"]
    },
    {
      id: "2",
      projectId: "proj-002",
      projectTitle: "卫生间漏水维修",
      reviewer: {
        id: "user2",
        name: "李女士",
        avatar: "LS",
        type: "homeowner"
      },
      reviewee: {
        id: "tradie2",
        name: "王师傅",
        avatar: "WS",
        company: "水管快修",
        type: "tradie"
      },
      rating: {
        overall: 4,
        quality: 4,
        communication: 5,
        timeliness: 4,
        value: 4
      },
      title: "快速解决了漏水问题",
      content: "王师傅响应很快，当天就来修理了。问题解决得很彻底，而且给了很多维护建议。价格也合理。",
      date: "2025-01-01",
      verified: true,
      helpful: 5,
      notHelpful: 0,
      replies: [],
      tags: ["快速响应", "解决彻底", "价格合理"]
    },
    {
      id: "3",
      projectId: "proj-003",
      projectTitle: "花园景观设计",
      reviewer: {
        id: "user3",
        name: "陈先生",
        avatar: "CS",
        type: "homeowner"
      },
      reviewee: {
        id: "tradie3",
        name: "绿色园艺团队",
        avatar: "绿",
        company: "绿色园艺",
        type: "tradie"
      },
      rating: {
        overall: 5,
        quality: 5,
        communication: 4,
        timeliness: 5,
        value: 4
      },
      title: "美丽的花园改造",
      content: "团队很专业，设计师的方案很棒，施工质量也很好。现在的花园比之前漂亮太多了！",
      images: ["🌺", "🌿", "🌸"],
      date: "2024-12-28",
      verified: true,
      helpful: 12,
      notHelpful: 1,
      replies: [],
      tags: ["设计专业", "效果显著", "团队合作"]
    }
  ]

  // 模拟待评价项目
  const pendingReviews = [
    {
      projectId: "proj-004",
      projectTitle: "客厅电路升级",
      tradieId: "tradie4",
      tradieName: "李电工",
      completedDate: "2025-01-05",
      amount: "$1,500"
    }
  ]

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    projectId: "",
    projectTitle: "",
    tradieId: "",
    tradieName: "",
    rating: {
      overall: 0,
      quality: 0,
      communication: 0,
      timeliness: 0,
      value: 0
    },
    title: "",
    content: "",
    images: []
  })

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.reviewee.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = filterRating === 0 || review.rating.overall >= filterRating
    return matchesSearch && matchesRating
  })

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating.overall === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(review => review.rating.overall === rating).length / reviews.length) * 100
      : 0
  }))

  const StarRating = ({
    rating,
    interactive = false,
    size = "w-5 h-5",
    onRatingChange
  }: {
    rating: number
    interactive?: boolean
    size?: string
    onRatingChange?: (rating: number) => void
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= (interactive ? hoverRating || selectedRating : rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => {
              if (interactive && onRatingChange) {
                setSelectedRating(star)
                onRatingChange(star)
              }
            }}
          />
        ))}
      </div>
    )
  }

  const markHelpful = (reviewId: string, helpful: boolean) => {
    // 实际应用中这里会调用API
    console.log(`标记评价 ${reviewId} 为 ${helpful ? '有用' : '无用'}`)
  }

  const submitReview = () => {
    // 实际应用中这里会提交到后端
    console.log("提交评价:", reviewForm)
    setShowReviewForm(false)
    // 重置表单
    setReviewForm({
      projectId: "",
      projectTitle: "",
      tradieId: "",
      tradieName: "",
      rating: {
        overall: 0,
        quality: 0,
        communication: 0,
        timeliness: 0,
        value: 0
      },
      title: "",
      content: "",
      images: []
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">BuildBridge</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <Star className="w-3 h-3 mr-1" />
              评价中心
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">返回控制台</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">评价与评论</h1>
            <p className="text-gray-600">分享您的服务体验，帮助其他用户做出更好的选择</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="browse">浏览评价</TabsTrigger>
              <TabsTrigger value="pending">
                待评价 {pendingReviews.length > 0 && `(${pendingReviews.length})`}
              </TabsTrigger>
              <TabsTrigger value="my-reviews">我的评价</TabsTrigger>
            </TabsList>

            {/* 浏览评价 */}
            <TabsContent value="browse">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 筛选侧边栏 */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>筛选评价</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索评价..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">按评分筛选</Label>
                        <div className="space-y-2 mt-2">
                          {[0, 5, 4, 3, 2, 1].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setFilterRating(rating)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                filterRating === rating
                                  ? 'bg-green-100 text-green-800'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {rating === 0 ? '全部评分' : (
                                <div className="flex items-center space-x-2">
                                  <StarRating rating={rating} size="w-3 h-3" />
                                  <span>及以上</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 评分统计 */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">评分分布</h4>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-green-600">
                            {averageRating.toFixed(1)}
                          </div>
                          <StarRating rating={Math.round(averageRating)} />
                          <p className="text-sm text-gray-600">{reviews.length} 条评价</p>
                        </div>
                        <div className="space-y-2">
                          {ratingDistribution.map(({ rating, count, percentage }) => (
                            <div key={rating} className="flex items-center space-x-2 text-sm">
                              <span className="w-4">{rating}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className="w-8 text-gray-600">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 评价列表 */}
                <div className="lg:col-span-3">
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* 评价头部 */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar>
                                  <AvatarFallback className="bg-green-100 text-green-600">
                                    {review.reviewer.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{review.reviewer.name}</h3>
                                    {review.verified && (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        已验证
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    评价 {review.reviewee.name} · {review.date}
                                  </p>
                                  <p className="text-sm text-gray-500">项目: {review.projectTitle}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <StarRating rating={review.rating.overall} />
                                <p className="text-sm text-gray-600 mt-1">
                                  总体评分 {review.rating.overall}/5
                                </p>
                              </div>
                            </div>

                            {/* 详细评分 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <p className="text-xs text-gray-600">工作质量</p>
                                <StarRating rating={review.rating.quality} size="w-3 h-3" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600">沟通交流</p>
                                <StarRating rating={review.rating.communication} size="w-3 h-3" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600">时间管理</p>
                                <StarRating rating={review.rating.timeliness} size="w-3 h-3" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600">性价比</p>
                                <StarRating rating={review.rating.value} size="w-3 h-3" />
                              </div>
                            </div>

                            {/* 评价内容 */}
                            <div>
                              <h4 className="font-medium mb-2">{review.title}</h4>
                              <p className="text-gray-700">{review.content}</p>
                            </div>

                            {/* 评价图片 */}
                            {review.images && review.images.length > 0 && (
                              <div className="flex space-x-2">
                                {review.images.map((image, index) => (
                                  <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                    {image}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 标签 */}
                            {review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {review.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => markHelpful(review.id, true)}
                                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>有用 ({review.helpful})</span>
                                </button>
                                <button
                                  onClick={() => markHelpful(review.id, false)}
                                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  <span>无用 ({review.notHelpful})</span>
                                </button>
                                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>回复</span>
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  分享
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Flag className="w-3 h-3 mr-1" />
                                  举报
                                </Button>
                              </div>
                            </div>

                            {/* 回复 */}
                            {review.replies.length > 0 && (
                              <div className="space-y-3 pt-4 border-t">
                                {review.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start space-x-3 ml-8">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                        {reply.author.avatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">{reply.author.name}</p>
                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                          {reply.author.type === 'tradie' ? '技师' : '用户'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{reply.date}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 待评价 */}
            <TabsContent value="pending">
              <div className="max-w-4xl mx-auto">
                {pendingReviews.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待评价项目</h3>
                      <p className="text-gray-600">完成的项目将会显示在这里等待您的评价</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((project) => (
                      <Card key={project.projectId}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-lg">{project.projectTitle}</h3>
                              <p className="text-gray-600">技师: {project.tradieName}</p>
                              <p className="text-sm text-gray-500">
                                完成时间: {project.completedDate} · 项目金额: {project.amount}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                setReviewForm({
                                  ...reviewForm,
                                  projectId: project.projectId,
                                  projectTitle: project.projectTitle,
                                  tradieId: project.tradieId,
                                  tradieName: project.tradieName
                                })
                                setShowReviewForm(true)
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              立即评价
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 我的评价 */}
            <TabsContent value="my-reviews">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价记录</h3>
                    <p className="text-gray-600">您发布的评价将会显示在这里</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 评价表单弹窗 */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>为项目评分</CardTitle>
              <CardDescription>
                项目: {reviewForm.projectTitle} · 技师: {reviewForm.tradieName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 评分部分 */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">总体评分 *</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <StarRating
                      rating={reviewForm.rating.overall}
                      interactive={true}
                      size="w-8 h-8"
                      onRatingChange={(rating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          rating: { ...prev.rating, overall: rating }
                        }))
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {reviewForm.rating.overall === 0 ? '请选择评分' :
                       reviewForm.rating.overall === 1 ? '很差' :
                       reviewForm.rating.overall === 2 ? '较差' :
                       reviewForm.rating.overall === 3 ? '一般' :
                       reviewForm.rating.overall === 4 ? '良好' : '优秀'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">工作质量</Label>
                    <StarRating
                      rating={reviewForm.rating.quality}
                      interactive={true}
                      onRatingChange={(rating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          rating: { ...prev.rating, quality: rating }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">沟通交流</Label>
                    <StarRating
                      rating={reviewForm.rating.communication}
                      interactive={true}
                      onRatingChange={(rating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          rating: { ...prev.rating, communication: rating }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">时间管理</Label>
                    <StarRating
                      rating={reviewForm.rating.timeliness}
                      interactive={true}
                      onRatingChange={(rating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          rating: { ...prev.rating, timeliness: rating }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">性价比</Label>
                    <StarRating
                      rating={reviewForm.rating.value}
                      interactive={true}
                      onRatingChange={(rating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          rating: { ...prev.rating, value: rating }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 评价标题 */}
              <div>
                <Label htmlFor="title">评价标题 *</Label>
                <Input
                  id="title"
                  placeholder="为您的评价写一个标题..."
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-2"
                />
              </div>

              {/* 评价内容 */}
              <div>
                <Label htmlFor="content">详细评价 *</Label>
                <Textarea
                  id="content"
                  placeholder="分享您的详细体验，帮助其他用户了解这位技师的服务..."
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* 上传图片 */}
              <div>
                <Label>上传项目照片 (可选)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">上传项目前后对比照片</p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    选择图片
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={!reviewForm.rating.overall || !reviewForm.title || !reviewForm.content}
                  className="bg-green-600 hover:bg-green-700"
                >
                  提交评价
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

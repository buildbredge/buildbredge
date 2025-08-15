"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Loader2,
  AlertCircle,
  User,
  DollarSign
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
type ProjectStatus = 'draft' | 'published' | 'negotiating' | 'in_progress' | 'completed' | 'reviewed' | 'cancelled'

interface ProjectStatusActionsProps {
  projectId: string
  projectStatus: ProjectStatus
  projectUserId?: string | null
  acceptedQuote?: {
    id: string
    tradie_id: string
    price: number
    tradie?: {
      name: string
      company?: string
    }
  } | null
  onStatusChange?: () => void
}

interface ReviewFormData {
  rating: number
  comment: string
}

export function ProjectStatusActions({
  projectId,
  projectStatus,
  projectUserId,
  acceptedQuote,
  onStatusChange
}: ProjectStatusActionsProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewFormData>({
    rating: 5,
    comment: ""
  })

  const isOwner = projectUserId === user?.id
  const isAssignedTradie = acceptedQuote?.tradie_id === user?.id

  const getStatusDisplay = (status: ProjectStatus) => {
    const statusConfig = {
      draft: { label: "草稿", color: "bg-gray-100 text-gray-700", icon: Clock },
      published: { label: "已发布", color: "bg-blue-100 text-blue-700", icon: Clock },
      negotiating: { label: "协商中", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
      in_progress: { label: "进行中", color: "bg-green-100 text-green-700", icon: Clock },
      completed: { label: "已完成", color: "bg-purple-100 text-purple-700", icon: CheckCircle },
      reviewed: { label: "已评价", color: "bg-indigo-100 text-indigo-700", icon: Star },
      cancelled: { label: "已取消", color: "bg-red-100 text-red-700", icon: AlertCircle }
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleCompleteProject = async () => {
    if (!user?.id || !isAssignedTradie) {
      setError("只有被指定的技师才能标记项目完成")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradie_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '标记完成失败')
      }

      onStatusChange?.()

    } catch (err: any) {
      console.error('Error completing project:', err)
      setError(err.message || '标记完成失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user?.id || !isOwner) {
      setError("只有项目拥有者才能提交评价")
      return
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      setError("请选择评分（1-5星）")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${projectId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '提交评价失败')
      }

      setShowReviewForm(false)
      onStatusChange?.()

    } catch (err: any) {
      console.error('Error submitting review:', err)
      setError(err.message || '提交评价失败')
    } finally {
      setIsLoading(false)
    }
  }

  const renderActions = () => {
    // 技师可以标记项目完成
    if (projectStatus === 'in_progress' && isAssignedTradie) {
      return (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              项目进行中，完成后请点击下方按钮通知客户。
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleCompleteProject}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                标记完成中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                标记项目完成
              </>
            )}
          </Button>
        </div>
      )
    }

    // 项目拥有者可以提交评价
    if (projectStatus === 'completed' && isOwner && !showReviewForm) {
      return (
        <div className="space-y-4">
          <Alert>
            <Star className="h-4 w-4" />
            <AlertDescription>
              项目已完成，请对技师的服务进行评价。
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <Star className="w-4 h-4 mr-2" />
            提交评价
          </Button>
        </div>
      )
    }

    // 评价表单
    if (showReviewForm && isOwner) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">评分 *</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                  className={`text-2xl ${
                    star <= reviewData.rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">评价内容</label>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="请分享您对技师服务的体验..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSubmitReview}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  提交评价
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewForm(false)
                setReviewData({ rating: 5, comment: "" })
                setError("")
              }}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>项目状态</span>
          {getStatusDisplay(projectStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 显示接受的报价信息 */}
        {acceptedQuote && projectStatus !== 'published' && projectStatus !== 'negotiating' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">已选技师：{acceptedQuote.tradie?.name}</span>
                {acceptedQuote.tradie?.company && (
                  <span className="ml-1 text-sm text-gray-600">
                    ({acceptedQuote.tradie.company})
                  </span>
                )}
              </div>
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                NZD ${acceptedQuote.price}
              </div>
            </div>
          </div>
        )}

        {renderActions()}

        {/* 状态说明 */}
        <div className="mt-4 text-sm text-gray-600">
          {projectStatus === 'published' && "项目已发布，等待技师报价"}
          {projectStatus === 'negotiating' && "已收到报价，您可以选择合适的技师"}
          {projectStatus === 'in_progress' && "项目进行中，请耐心等待完成"}
          {projectStatus === 'completed' && "项目已完成，等待评价"}
          {projectStatus === 'reviewed' && "项目已完成并评价，感谢使用我们的平台"}
        </div>
      </CardContent>
    </Card>
  )
}
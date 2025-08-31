"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  MessageSquare
} from "lucide-react"

interface Quote {
  id: string
  project_id: string
  tradie_id: string
  price: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

interface TradieQuoteManagementProps {
  projectId: string
  tradieId: string
  projectStatus: string
  onQuoteUpdated?: () => void
}

export function TradieQuoteManagement({ 
  projectId, 
  tradieId, 
  projectStatus,
  onQuoteUpdated 
}: TradieQuoteManagementProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // 编辑表单状态
  const [editPrice, setEditPrice] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    fetchQuote()
  }, [projectId, tradieId])

  const fetchQuote = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/projects/${projectId}/quotes`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取报价失败')
      }

      // 筛选出当前技师的报价
      const tradieQuote = data.quotes?.find((q: any) => q.tradie_id === tradieId)
      setQuote(tradieQuote || null)
      
      if (tradieQuote) {
        setEditPrice(tradieQuote.price.toString())
        setEditDescription(tradieQuote.description)
      }
    } catch (err: any) {
      console.error('Error fetching quote:', err)
      setError(err.message || '获取报价失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditPrice(quote?.price.toString() || "")
    setEditDescription(quote?.description || "")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditPrice(quote?.price.toString() || "")
    setEditDescription(quote?.description || "")
  }

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true)
      setError("")

      if (!editPrice.trim() || !editDescription.trim()) {
        setError("请填写完整的报价信息")
        return
      }

      const priceNum = parseFloat(editPrice)
      if (isNaN(priceNum) || priceNum <= 0) {
        setError("请输入有效的报价金额")
        return
      }

      const response = await fetch(`/api/quotes/${quote?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: priceNum,
          description: editDescription.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '更新报价失败')
      }

      // 更新本地状态
      if (quote) {
        setQuote({
          ...quote,
          price: priceNum,
          description: editDescription.trim(),
          updated_at: new Date().toISOString()
        })
      }

      setIsEditing(false)
      onQuoteUpdated?.()

    } catch (err: any) {
      console.error('Error updating quote:', err)
      setError(err.message || '更新报价失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个报价吗？此操作无法撤销。')) {
      return
    }

    try {
      setIsDeleting(true)
      setError("")

      const response = await fetch(`/api/quotes/${quote?.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '删除报价失败')
      }

      setQuote(null)
      onQuoteUpdated?.()

    } catch (err: any) {
      console.error('Error deleting quote:', err)
      setError(err.message || '删除报价失败')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "待处理", variant: "secondary" as const, icon: Clock },
      accepted: { label: "已接受", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "已拒绝", variant: "destructive" as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEditQuote = quote?.status === 'pending' && 
    (projectStatus === 'published' || projectStatus === 'quoted' || projectStatus === 'negotiating')
    
  // 只有前三个状态显示报价管理
  const shouldShowQuoteManagement = ['published', 'quoted', 'negotiating'].includes(projectStatus)

  // 如果项目已进入托管状态，不显示报价管理
  if (!shouldShowQuoteManagement) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            我的报价
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span>加载报价中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              我的报价
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {!quote ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">您还没有提交报价</p>
              <p className="text-sm text-gray-400">
                {['published', 'quoted', 'negotiating'].includes(projectStatus)
                  ? '您可以通过上方的"提交报价"按钮来提交您的报价' 
                  : '此项目当前不接受新报价'}
              </p>
            </div>
          ) : (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-price">报价金额 (NZD)</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">报价说明</Label>
                          <Textarea
                            id="edit-description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={4}
                            placeholder="请详细说明您的服务内容..."
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                保存中...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                保存修改
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                          >
                            <X className="w-4 h-4 mr-1" />
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          NZD ${quote.price}
                        </div>
                        {getStatusBadge(quote.status)}
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <>
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        报价说明
                      </h5>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {quote.description.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <div>提交时间: {formatDate(quote.created_at)}</div>
                        {quote.updated_at !== quote.created_at && (
                          <div>最后修改: {formatDate(quote.updated_at)}</div>
                        )}
                      </div>

                      {canEditQuote && (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            修改报价
                          </Button>
                          <Button
                            onClick={handleDelete}
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                删除中...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                删除报价
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {quote.status !== 'pending' && (
                        <div className="text-xs text-gray-500">
                          报价已{quote.status === 'accepted' ? '被接受' : '被拒绝'}，无法修改
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </>
  )
}
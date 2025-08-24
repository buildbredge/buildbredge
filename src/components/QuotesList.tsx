"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DollarSign,
  User,
  Star,
  Phone,
  Building,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react"
import { AttachmentViewer } from "@/components/AttachmentViewer"
import { FileAttachment } from "@/components/FileUploadComponent"
import { ProjectStatus } from "@/types/project-status"
interface Quote {
  id: string
  project_id: string
  tradie_id: string
  price: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  attachments?: FileAttachment[]
  created_at: string
  updated_at: string
}

interface QuotesListProps {
  projectId: string
  isOwner: boolean // 是否是项目拥有者
  projectStatus: string
  onQuoteAccepted?: () => void
}

interface QuoteWithTradie extends Quote {
  tradie?: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    rating: number
    review_count: number
    experience_years?: number
    bio?: string
  }
}

export function QuotesList({ 
  projectId, 
  isOwner, 
  projectStatus,
  onQuoteAccepted 
}: QuotesListProps) {
  const [quotes, setQuotes] = useState<QuoteWithTradie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [projectId])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/projects/${projectId}/quotes`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取报价失败')
      }

      setQuotes(data.quotes || [])
    } catch (err: any) {
      console.error('Error fetching quotes:', err)
      setError(err.message || '获取报价失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      setAcceptingQuoteId(quoteId)
      setError("")

      const response = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '接受报价失败')
      }

      // 刷新报价列表
      await fetchQuotes()
      onQuoteAccepted?.()

    } catch (err: any) {
      console.error('Error accepting quote:', err)
      setError(err.message || '接受报价失败')
    } finally {
      setAcceptingQuoteId(null)
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

  const canAcceptQuotes = isOwner && (
    projectStatus === ProjectStatus.DRAFT ||
    projectStatus === ProjectStatus.QUOTED || 
    projectStatus === ProjectStatus.NEGOTIATING
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            项目报价
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            项目报价 ({quotes.length})
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

        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">暂无报价</p>
            <p className="text-sm text-gray-400">
              {(projectStatus === ProjectStatus.DRAFT || 
                projectStatus === ProjectStatus.QUOTED || 
                projectStatus === ProjectStatus.NEGOTIATING)
                ? '技师们可以对此项目提交报价' 
                : '此项目当前不接受新报价'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {quote.tradie?.name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold flex items-center">
                          {quote.tradie?.name || '未知技师'}
                          {quote.tradie?.company && (
                            <span className="ml-2 text-sm text-gray-500">
                              @ {quote.tradie.company}
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {quote.tradie?.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              {quote.tradie.rating.toFixed(1)} ({quote.tradie.review_count} 评价)
                            </div>
                          )}
                          {quote.tradie?.experience_years && (
                            <span>{quote.tradie.experience_years} 年经验</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        NZD ${quote.price}
                      </div>
                      {getStatusBadge(quote.status)}
                    </div>
                  </div>

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

                  {/* 显示附件 */}
                  {quote.attachments && quote.attachments.length > 0 && (
                    <div className="mb-4">
                      <AttachmentViewer 
                        attachments={quote.attachments}
                        title="报价附件"
                        allowDownload={isOwner} // 只有项目拥有者可以下载附件
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      提交时间: {formatDate(quote.created_at)}
                    </div>

                    <div className="flex items-center space-x-2">
                      {quote.tradie?.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${quote.tradie?.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          联系
                        </Button>
                      )}

                      {canAcceptQuotes && quote.status === 'pending' && (
                        <Button
                          onClick={() => handleAcceptQuote(quote.id)}
                          disabled={acceptingQuoteId === quote.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {acceptingQuoteId === quote.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              接受中...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              接受报价
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
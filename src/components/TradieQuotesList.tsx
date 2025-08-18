"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  MapPin
} from "lucide-react"

interface Quote {
  id: string
  project_id: string
  tradie_id: string
  price: number
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'auto_rejected'
  created_at: string
  updated_at: string
  project: {
    id: string
    description: string
    location: string
    status: string
    created_at: string
    accepted_quote_id?: string
  }
}

interface TradieQuotesListProps {
  tradieId: string
  onCountChange?: (count: number) => void
}

export function TradieQuotesList({ tradieId, onCountChange }: TradieQuotesListProps) {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchQuotes()
  }, [tradieId])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/tradies/${tradieId}/quotes`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取报价失败')
      }

      // 只显示未被接受的报价（排除已接受的）
      const pendingQuotes = (data.quotes || []).filter((quote: Quote) => 
        quote.status !== 'accepted' && 
        !quote.project.accepted_quote_id
      )
      
      setQuotes(pendingQuotes)
      onCountChange?.(pendingQuotes.length)
    } catch (err: any) {
      console.error('Error fetching quotes:', err)
      setError(err.message || '获取报价失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (quote: Quote) => {
    const { status, project } = quote
    
    // 如果项目有接受的报价但不是这个报价，显示为自动拒绝
    if (project.accepted_quote_id && project.accepted_quote_id !== quote.id) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          其他报价被接受
        </Badge>
      )
    }
    
    const statusConfig = {
      pending: { label: "待处理", variant: "secondary" as const, icon: Clock },
      accepted: { label: "已接受", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "已拒绝", variant: "destructive" as const, icon: XCircle },
      auto_rejected: { label: "自动拒绝", variant: "secondary" as const, icon: AlertTriangle }
    }

    const config = statusConfig[status]
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

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            我的报价
          </div>
          <Badge variant="outline">
            {quotes.length} 个报价
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-4">
            <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">您还没有提交任何报价</p>
            <p className="text-sm text-gray-400">
              最新任务并提交报价来开始您的业务
            </p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/browse-jobs')}
            >
              最新任务
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewProject(quote.project_id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate mb-1">
                        {quote.project.description}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{quote.project.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(quote.created_at)}
                        </div>
                        {getStatusBadge(quote)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-600">
                        NZD ${quote.price}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProject(quote.project_id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs mt-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        查看
                      </Button>
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
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
  MapPin,
  User,
  Building2,
  ThumbsUp
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface Quote {
  id: string
  project_id: string
  tradie_id: string
  price: number
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  project: {
    id: string
    description: string
    location: string
    status: string
    created_at: string
  }
  tradie: {
    id: string
    name: string
    email: string
    company?: string
  }
}

interface OwnerQuotesManagementProps {
  userId: string
}

export function OwnerQuotesManagement({ userId }: OwnerQuotesManagementProps) {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    fetchQuotes()
  }, [userId])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError("")

      // 这里需要创建一个新的API端点来获取业主收到的所有报价
      const response = await fetch(`/api/owners/${userId}/quotes`)
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

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleAcceptQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsAcceptDialogOpen(true)
  }

  const confirmAcceptQuote = async () => {
    if (!selectedQuote) return

    try {
      setIsAccepting(true)
      setError("")

      const response = await fetch(`/api/quotes/${selectedQuote.id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '接受报价失败')
      }

      // 更新本地状态
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => 
          quote.id === selectedQuote.id 
            ? { ...quote, status: 'accepted' as const }
            : quote.project_id === selectedQuote.project_id && quote.status === 'pending'
            ? { ...quote, status: 'rejected' as const }
            : quote
        )
      )

      setIsAcceptDialogOpen(false)
      setSelectedQuote(null)
    } catch (err: any) {
      console.error('Error accepting quote:', err)
      setError(err.message || '接受报价失败')
    } finally {
      setIsAccepting(false)
    }
  }

  const canAcceptQuote = (quote: Quote) => {
    return quote.status === 'pending' && 
           (quote.project.status === 'published' || quote.project.status === 'negotiating')
  }

  const groupedQuotes = quotes.reduce((acc, quote) => {
    const projectId = quote.project_id
    if (!acc[projectId]) {
      acc[projectId] = {
        project: quote.project,
        quotes: []
      }
    }
    acc[projectId].quotes.push(quote)
    return acc
  }, {} as Record<string, { project: Quote['project'], quotes: Quote[] }>)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            收到的报价
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
            收到的报价
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

        {Object.keys(groupedQuotes).length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">暂无收到的报价</p>
            <p className="text-sm text-gray-400">
              当技师对您的项目报价时，报价会显示在这里
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedQuotes).map(([projectId, { project, quotes: projectQuotes }]) => (
              <div key={projectId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {project.description}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {project.location}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewProject(projectId)}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    查看项目
                  </Button>
                </div>

                <div className="space-y-3">
                  {projectQuotes.map((quote) => (
                    <Card key={quote.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center text-sm">
                                <User className="w-3 h-3 mr-1" />
                                <span className="font-medium">{quote.tradie.name}</span>
                              </div>
                              {quote.tradie.company && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  <span>{quote.tradie.company}</span>
                                </div>
                              )}
                              {getStatusBadge(quote.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {quote.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1 inline" />
                                {formatDate(quote.created_at)}
                              </div>
                              {canAcceptQuote(quote) && (
                                <Button
                                  onClick={() => handleAcceptQuote(quote)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  接受报价
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-600">
                              NZD ${quote.price}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Accept Quote Confirmation Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认接受报价</DialogTitle>
            <DialogDescription>
              您确定要接受来自 <strong>{selectedQuote?.tradie.name}</strong> 的报价吗？
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">技师:</span>
                  <span className="font-medium">{selectedQuote.tradie.name}</span>
                </div>
                {selectedQuote.tradie.company && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">公司:</span>
                    <span className="font-medium">{selectedQuote.tradie.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">报价金额:</span>
                  <span className="font-bold text-green-600">NZD ${selectedQuote.price}</span>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-600">服务描述:</span>
                  <p className="text-sm mt-1">{selectedQuote.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
            <strong>注意:</strong> 接受此报价后，该项目的其他所有待处理报价将自动被拒绝，项目状态将变为"进行中"。
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAcceptDialogOpen(false)}
              disabled={isAccepting}
            >
              取消
            </Button>
            <Button 
              onClick={confirmAcceptQuote}
              disabled={isAccepting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  确认接受
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  Loader2,
  DollarSign,
  User,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Info,
  Coins,
  Banknote
} from "lucide-react"

interface AcceptedProject {
  id: string
  description: string
  location: string
  status: string
  created_at: string
  agreed_price?: number
  escrow_amount?: number
  accepted_quote: {
    id: string
    price: number
    description: string
    created_at: string
  }
  owner: {
    name?: string
    email: string
  }
  payment_info?: {
    id: string
    amount: number
    platform_fee: number
    affiliate_fee: number
    tax_amount: number
    net_amount: number
    status: string
    confirmed_at: string
    payment_method: string
  }
  escrow_info?: {
    id: string
    gross_amount: number
    platform_fee: number
    affiliate_fee: number
    tax_withheld: number
    net_amount: number
    status: string
    protection_end_date: string
    released_at?: string
  }
}

interface TradieProjectsListProps {
  tradieId: string
  onCountChange?: (count: number) => void
}

export function TradieProjectsList({ tradieId, onCountChange }: TradieProjectsListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<AcceptedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [tradieId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/tradies/${tradieId}/projects`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取项目失败')
      }

      const projectsList = data.projects || []
      setProjects(projectsList)
      onCountChange?.(projectsList.length)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError(err.message || '获取项目失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agreed: { label: "已确认", variant: "secondary" as const, color: "bg-blue-100 text-blue-700" },
      escrowed: { label: "资金托管", variant: "secondary" as const, color: "bg-green-100 text-green-700" },
      in_progress: { label: "进行中", variant: "default" as const, color: "bg-yellow-100 text-yellow-700" },
      completed: { label: "已完工", variant: "outline" as const, color: "bg-purple-100 text-purple-700" },
      protection: { label: "保护期", variant: "outline" as const, color: "bg-orange-100 text-orange-700" },
      released: { label: "资金释放", variant: "outline" as const, color: "bg-green-100 text-green-800" },
      reviewed: { label: "已评价", variant: "outline" as const, color: "bg-gray-100 text-gray-700" }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <Badge className={`text-xs ${config.color}`}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('NZ', 'NZD ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'held': return 'text-blue-600'
      case 'released': return 'text-green-600'
      case 'disputed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        <span>加载项目中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProjects} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">暂无进行中的项目</p>
          <p className="text-sm text-gray-400">
            当您的报价被接受后，项目会显示在这里
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => handleViewProject(project.id)}>
              <CardContent className="p-4">
                {/* Main Project Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate mb-2">
                      {project.description}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate mr-3">{project.location}</span>
                      <User className="w-3 h-3 mr-1" />
                      <span className="truncate">{project.owner.name || project.owner.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        开始于 {formatDate(project.accepted_quote.created_at)}
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      {formatCurrency(project.accepted_quote.price)}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProject(project.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看
                    </Button>
                  </div>
                </div>

                {/* Payment & Fund Allocation Info */}
                {project.payment_info && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center mb-2">
                      <Shield className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-medium text-sm text-gray-700">支付状态</span>
                      <Badge className="ml-2 text-xs bg-green-100 text-green-700">
                        已付款
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Left Column - Payment Breakdown */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">支付总额:</span>
                          <span className="font-medium">{formatCurrency(project.payment_info.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">平台费用:</span>
                          <span className="text-red-600">-{formatCurrency(project.payment_info.platform_fee)}</span>
                        </div>
                        {project.payment_info.affiliate_fee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">挂靠费用:</span>
                            <span className="text-red-600">-{formatCurrency(project.payment_info.affiliate_fee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">税收预扣:</span>
                          <span className="text-red-600">-{formatCurrency(project.payment_info.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-medium">
                          <span className="text-green-700">您将收到:</span>
                          <span className="text-green-600">{formatCurrency(project.payment_info.net_amount)}</span>
                        </div>
                      </div>

                      {/* Right Column - Escrow Status */}
                      <div className="space-y-1">
                        {project.escrow_info ? (
                          <>
                            <div className="flex items-center mb-2">
                              <Coins className="w-3 h-3 mr-1 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">托管状态</span>
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">资金状态:</span>
                                <span className={`font-medium ${getPaymentStatusColor(project.escrow_info.status)}`}>
                                  {project.escrow_info.status === 'held' ? '安全托管中' : 
                                   project.escrow_info.status === 'released' ? '已释放' : 
                                   project.escrow_info.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">托管金额:</span>
                                <span className="font-medium">{formatCurrency(project.escrow_info.gross_amount)}</span>
                              </div>
                              {project.escrow_info.status === 'held' && project.status === 'protection' && (
                                <div className="flex items-center text-xs text-orange-600 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>保护期至: {formatDate(project.escrow_info.protection_end_date)}</span>
                                </div>
                              )}
                              {project.escrow_info.status === 'held' && project.status === 'escrowed' && (
                                <div className="flex items-center text-xs text-blue-600 mt-1">
                                  <Shield className="w-3 h-3 mr-1" />
                                  <span>资金安全托管，可以开始工作</span>
                                </div>
                              )}
                              {project.escrow_info.status === 'held' && project.status === 'in_progress' && (
                                <div className="flex items-center text-xs text-green-600 mt-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  <span>工作进行中，资金安全托管</span>
                                </div>
                              )}
                              {project.escrow_info.status === 'held' && project.status === 'completed' && (
                                <div className="flex items-center text-xs text-orange-600 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>等待进入保护期...</span>
                                </div>
                              )}
                              {project.escrow_info.released_at && (
                                <div className="flex items-center text-xs text-green-600 mt-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  <span>释放时间: {formatDate(project.escrow_info.released_at)}</span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center text-xs text-gray-500">
                            <Info className="w-3 h-3 mr-1" />
                            <span>等待客户付款</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Banknote className="w-3 h-3 mr-1" />
                      <span>支付方式: {project.payment_info.payment_method === 'stripe_checkout' ? '信用卡' : 'POLi银行转账'}</span>
                      {project.payment_info.confirmed_at && (
                        <span className="ml-2">• 确认时间: {formatDate(project.payment_info.confirmed_at)}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* No Payment Info */}
                {!project.payment_info && project.status === 'agreed' && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center text-sm text-orange-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>等待客户付款 - 付款完成后您可以开始工作</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
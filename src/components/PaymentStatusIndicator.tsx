"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Wallet,
  CreditCard,
  Banknote
} from "lucide-react"
import { ProjectStatus, getStatusLabel } from "@/types/project-status"

interface PaymentStatusIndicatorProps {
  projectStatus: string
  agreedPrice?: number
  escrowAmount?: number
  protectionEndDate?: string
  completionDate?: string
  releaseDate?: string
  currency?: string
}

export function PaymentStatusIndicator({
  projectStatus,
  agreedPrice,
  escrowAmount,
  protectionEndDate,
  completionDate,
  releaseDate,
  currency = 'NZD'
}: PaymentStatusIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [protectionProgress, setProtectionProgress] = useState<number>(0)

  useEffect(() => {
    if (projectStatus === ProjectStatus.PROTECTION && protectionEndDate && completionDate) {
      const updateCountdown = () => {
        const now = new Date()
        const endDate = new Date(protectionEndDate)
        const startDate = new Date(completionDate)
        const totalDuration = endDate.getTime() - startDate.getTime()
        const remaining = endDate.getTime() - now.getTime()

        if (remaining <= 0) {
          setTimeRemaining("保护期已结束")
          setProtectionProgress(100)
        } else {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeRemaining(`${days}天 ${hours}小时`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}小时 ${minutes}分钟`)
          } else {
            setTimeRemaining(`${minutes}分钟`)
          }

          const progress = Math.max(0, Math.min(100, ((totalDuration - remaining) / totalDuration) * 100))
          setProtectionProgress(progress)
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // 每分钟更新一次

      return () => clearInterval(interval)
    }
  }, [projectStatus, protectionEndDate, completionDate])

  const getPaymentStatusConfig = () => {
    switch (projectStatus) {
      case ProjectStatus.AGREED:
        return {
          title: "等待全额付款",
          icon: CreditCard,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          description: `需要支付 ${currency} $${agreedPrice?.toFixed(2)} 才能开始工作`,
          showProgress: false
        }
      case ProjectStatus.ESCROWED:
        return {
          title: "资金已托管",
          icon: Shield,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          description: `${currency} $${escrowAmount?.toFixed(2)} 已安全托管，等待工作开始`,
          showProgress: false
        }
      case ProjectStatus.IN_PROGRESS:
        return {
          title: "工作进行中",
          icon: Clock,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          description: "技师正在进行工作，资金安全托管中",
          showProgress: false
        }
      case ProjectStatus.PROTECTION:
        return {
          title: "保护期倒计时",
          icon: Shield,
          iconColor: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          description: `工作已完成，${timeRemaining}后自动放款`,
          showProgress: true
        }
      case ProjectStatus.RELEASED:
        return {
          title: "资金已放款",
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          description: `${currency} $${escrowAmount?.toFixed(2)} 已成功放款给技师`,
          showProgress: false
        }
      case ProjectStatus.WITHDRAWN:
        return {
          title: "资金已提现",
          icon: Wallet,
          iconColor: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          description: "技师已成功提现资金",
          showProgress: false
        }
      case ProjectStatus.DISPUTED:
        return {
          title: "争议处理中",
          icon: AlertTriangle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          description: "资金冻结，正在处理争议",
          showProgress: false
        }
      default:
        return {
          title: "待付款",
          icon: DollarSign,
          iconColor: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          description: "等待确认价格和付款",
          showProgress: false
        }
    }
  }

  const config = getPaymentStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-2 ${config.iconColor}`} />
            付款状态
          </div>
          <Badge variant="outline" className={config.iconColor}>
            {getStatusLabel(projectStatus as ProjectStatus)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">{config.title}</h4>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>

          {config.showProgress && projectStatus === ProjectStatus.PROTECTION && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>保护期进度</span>
                <span>{protectionProgress.toFixed(0)}%</span>
              </div>
              <Progress value={protectionProgress} className="w-full" />
              {protectionEndDate && (
                <p className="text-xs text-gray-500">
                  保护期结束时间: {new Date(protectionEndDate).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
          )}

          {agreedPrice && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium text-gray-700">确认金额</span>
              <span className="text-lg font-bold text-green-600">
                {currency} ${agreedPrice.toFixed(2)}
              </span>
            </div>
          )}

          {projectStatus === ProjectStatus.ESCROWED || projectStatus === ProjectStatus.RELEASED && (
            <div className="space-y-2 p-3 bg-white rounded-lg border">
              <h5 className="font-medium text-sm text-gray-700">费用明细</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">总金额</span>
                  <span>{currency} ${agreedPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平台费用 (10%)</span>
                  <span>-{currency} ${(agreedPrice ? agreedPrice * 0.1 : 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">挂靠费用 (2%)</span>
                  <span>-{currency} ${(agreedPrice ? agreedPrice * 0.02 : 0).toFixed(2)}</span>
                </div>
                <hr className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>技师净收入</span>
                  <span className="text-green-600">
                    {currency} ${(agreedPrice ? agreedPrice * 0.88 : 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {releaseDate && (
            <div className="text-xs text-gray-500">
              放款时间: {new Date(releaseDate).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
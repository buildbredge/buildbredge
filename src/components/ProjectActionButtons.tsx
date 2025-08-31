"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  CreditCard,
  Play,
  CheckCircle,
  HandCoins,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { ProjectStatus } from "@/types/project-status"
import { useRouter } from "next/navigation"

interface ProjectActionButtonsProps {
  projectId: string
  projectStatus: string
  isOwner: boolean
  isTradie: boolean
  agreedPrice?: number
  currency?: string
  agreedQuoteId?: string
  tradieId?: string
  onStatusChange?: () => void
}

export function ProjectActionButtons({
  projectId,
  projectStatus,
  isOwner,
  isTradie,
  agreedPrice,
  currency = 'NZD',
  agreedQuoteId,
  tradieId,
  onStatusChange
}: ProjectActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAction = async (action: string, endpoint: string, method: string = 'PUT', body?: any) => {
    try {
      setLoading(action)
      setError("")

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `${action}失败`)
      }

      // 刷新页面数据
      onStatusChange?.()
      
      // 显示成功消息（可以添加toast通知）
      console.log(`✅ ${action}成功:`, result)

    } catch (err: any) {
      console.error(`❌ ${action}失败:`, err)
      setError(err.message || `${action}失败`)
    } finally {
      setLoading(null)
    }
  }

  const handlePayment = () => {
    // 跳转到付款页面
    if (!agreedQuoteId || !tradieId) {
      setError('缺少必要的付款信息，请刷新页面重试')
      return
    }
    router.push(`/payment?projectId=${projectId}&quoteId=${agreedQuoteId}&tradieId=${tradieId}&amount=${agreedPrice}`)
  }

  const handleStartWork = () => {
    handleAction(
      '开始工作',
      `/api/projects/${projectId}/start-work`
    )
  }

  const handleMarkCompleted = () => {
    const completionNotes = prompt('请输入完工说明（可选）:')
    handleAction(
      '标记完工',
      `/api/projects/${projectId}/mark-completed`,
      'PUT',
      { completionNotes }
    )
  }

  const handleOwnerConfirmComplete = () => {
    const confirmed = confirm(
      `确认工作已完成并立即放款 ${currency} $${agreedPrice?.toFixed(2)} 给技师？\n\n注意：此操作不可撤销。`
    )
    
    if (confirmed) {
      const confirmationNotes = prompt('请输入确认说明（可选）:')
      handleAction(
        '确认完成',
        `/api/projects/${projectId}/owner-confirm-complete`,
        'PUT',
        { confirmationNotes }
      )
    }
  }

  const renderOwnerButtons = () => {
    switch (projectStatus) {
      case ProjectStatus.AGREED:
        return (
          <Button
            onClick={handlePayment}
            disabled={loading === '付款'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading === '付款' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                全额付款 ({currency} ${agreedPrice?.toFixed(2)})
              </>
            )}
          </Button>
        )

      case ProjectStatus.PROTECTION:
        return (
          <div className="space-y-2">
            <Button
              onClick={handleOwnerConfirmComplete}
              disabled={loading === '确认完成'}
              className="bg-green-600 hover:bg-green-700 text-white w-full"
            >
              {loading === '确认完成' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <HandCoins className="w-4 h-4 mr-2" />
                  确认完成并立即放款
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              或等待保护期结束后自动放款
            </p>
          </div>
        )

      default:
        return null
    }
  }

  const renderTradieButtons = () => {
    switch (projectStatus) {
      case ProjectStatus.ESCROWED:
        return (
          <div className="w-full">
            <Button
              onClick={handleStartWork}
              disabled={loading === '开始工作'}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {loading === '开始工作' ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-3" />
                  🚀 开始工作
                </>
              )}
            </Button>
            <p className="text-center text-sm text-blue-600 mt-2 font-medium">
              💰 资金已安全托管，可以放心开始工作
            </p>
          </div>
        )

      case ProjectStatus.IN_PROGRESS:
        return (
          <div className="w-full">
            <Button
              onClick={handleMarkCompleted}
              disabled={loading === '标记完工'}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {loading === '标记完工' ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-3" />
                  ✅ 标记完工
                </>
              )}
            </Button>
            <p className="text-center text-sm text-green-600 mt-2 font-medium">
              ⏰ 完成工作后将进入15天保护期
            </p>
          </div>
        )

      default:
        return null
    }
  }

  // 如果没有可执行的操作，返回null
  const ownerButtons = isOwner ? renderOwnerButtons() : null
  const tradieButtons = isTradie ? renderTradieButtons() : null

  if (!ownerButtons && !tradieButtons) {
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {ownerButtons}
        {tradieButtons}
      </div>

      {/* 状态说明 */}
      <div className="text-xs text-gray-500">
        {projectStatus === ProjectStatus.AGREED && isOwner && (
          <p>请完成全额付款以便技师开始工作</p>
        )}
        {projectStatus === ProjectStatus.ESCROWED && isTradie && (
          <p>资金已托管，您可以安全开始工作</p>
        )}
        {projectStatus === ProjectStatus.IN_PROGRESS && isTradie && (
          <p>完成工作后请标记完工，将进入15天保护期</p>
        )}
        {projectStatus === ProjectStatus.PROTECTION && isOwner && (
          <p>您可以立即确认完成，或等待保护期结束后自动放款</p>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { ProjectStatus, getValidTransitions, getStatusLabel, canTransitionTo } from "@/types/project-status"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProjectStatusBadge from "./ProjectStatusBadge"
import { AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react"

interface ProjectStatusManagerProps {
  currentStatus: ProjectStatus
  onStatusChange: (newStatus: ProjectStatus, metadata?: Record<string, any>) => Promise<void>
  isOwner?: boolean
  isTradesperson?: boolean
  projectId: string
  className?: string
}

export default function ProjectStatusManager({
  currentStatus,
  onStatusChange,
  isOwner = false,
  isTradesperson = false,
  projectId,
  className = ""
}: ProjectStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "">("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validTransitions = getValidTransitions(currentStatus)
  
  // Filter transitions based on user role
  const getAvailableTransitions = () => {
    if (isOwner) {
      // Owners can accept quotes, make payments, confirm completion, etc.
      return validTransitions.filter(status => {
        switch (status) {
          case ProjectStatus.AGREED:
          case ProjectStatus.ESCROWED:
          case ProjectStatus.RELEASED:
          case ProjectStatus.DISPUTED:
          case ProjectStatus.CANCELLED:
            return true
          default:
            return false
        }
      })
    }
    
    if (isTradesperson) {
      // Tradespeople can submit quotes, start work, mark completion, etc.
      return validTransitions.filter(status => {
        switch (status) {
          case ProjectStatus.QUOTED:
          case ProjectStatus.IN_PROGRESS:
          case ProjectStatus.COMPLETED:
          case ProjectStatus.WITHDRAWN:
          case ProjectStatus.DISPUTED:
            return true
          default:
            return false
        }
      })
    }
    
    return validTransitions
  }

  const availableTransitions = getAvailableTransitions()

  const handleStatusUpdate = async () => {
    if (!selectedStatus || isUpdating) return
    
    setIsUpdating(true)
    try {
      // Prepare metadata based on status change
      const metadata: Record<string, any> = {}
      
      switch (selectedStatus) {
        case ProjectStatus.ESCROWED:
          metadata.escrow_date = new Date().toISOString()
          break
        case ProjectStatus.COMPLETED:
          metadata.completion_date = new Date().toISOString()
          break
        case ProjectStatus.RELEASED:
          metadata.release_date = new Date().toISOString()
          break
        case ProjectStatus.WITHDRAWN:
          metadata.withdrawal_date = new Date().toISOString()
          break
      }
      
      await onStatusChange(selectedStatus, metadata)
      setSelectedStatus("")
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ESCROWED:
        return <DollarSign className="w-4 h-4" />
      case ProjectStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />
      case ProjectStatus.PROTECTION:
        return <Clock className="w-4 h-4" />
      case ProjectStatus.DISPUTED:
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getActionButtonText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.QUOTED:
        return "提交报价"
      case ProjectStatus.AGREED:
        return "确认价格"
      case ProjectStatus.ESCROWED:
        return "托管资金"
      case ProjectStatus.IN_PROGRESS:
        return "开始工作"
      case ProjectStatus.COMPLETED:
        return "标记完成"
      case ProjectStatus.RELEASED:
        return "放款"
      case ProjectStatus.WITHDRAWN:
        return "提现"
      case ProjectStatus.DISPUTED:
        return "申请仲裁"
      case ProjectStatus.CANCELLED:
        return "取消项目"
      default:
        return getStatusLabel(status, 'zh')
    }
  }

  if (availableTransitions.length === 0) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <span className="text-sm text-gray-600">当前状态：</span>
        <ProjectStatusBadge 
          status={currentStatus} 
          showDescription={true}
          size="md"
        />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">当前状态：</span>
        <ProjectStatusBadge 
          status={currentStatus} 
          showDescription={true}
          size="md"
        />
      </div>

      <div className="flex items-center space-x-3">
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as ProjectStatus)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择新状态" />
          </SelectTrigger>
          <SelectContent>
            {availableTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span>{getActionButtonText(status)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleStatusUpdate}
          disabled={!selectedStatus || isUpdating}
          className="flex items-center space-x-2"
        >
          {isUpdating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isUpdating ? "更新中..." : "更新状态"}</span>
        </Button>
      </div>

      {selectedStatus && (
        <div className="text-sm text-gray-600">
          <span>将状态从 </span>
          <ProjectStatusBadge status={currentStatus} size="sm" />
          <span> 更新为 </span>
          <ProjectStatusBadge status={selectedStatus} size="sm" />
        </div>
      )}
    </div>
  )
}
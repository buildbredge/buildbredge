import { ProjectStatus, canTransitionTo } from "@/types/project-status"

export interface StatusUpdateMetadata {
  agreed_price?: number
  agreed_quote_id?: string
  escrow_amount?: number
  escrow_date?: string
  completion_date?: string
  protection_end_date?: string
  release_date?: string
  withdrawal_date?: string
  dispute_reason?: string
  dispute_date?: string
}

export class ProjectStatusError extends Error {
  constructor(
    message: string,
    public fromStatus: ProjectStatus,
    public toStatus: ProjectStatus
  ) {
    super(message)
    this.name = 'ProjectStatusError'
  }
}

/**
 * Validates if a status transition is allowed
 */
export function validateStatusTransition(
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus
): void {
  if (!canTransitionTo(fromStatus, toStatus)) {
    throw new ProjectStatusError(
      `Invalid status transition from ${fromStatus} to ${toStatus}`,
      fromStatus,
      toStatus
    )
  }
}

/**
 * Prepares database update data for status change
 */
export function prepareStatusUpdate(
  newStatus: ProjectStatus,
  metadata?: StatusUpdateMetadata
) {
  const updateData: any = {
    status: newStatus,
    status_updated_at: new Date().toISOString()
  }

  // Add status-specific fields based on the new status
  switch (newStatus) {
    case ProjectStatus.AGREED:
      if (metadata?.agreed_price) updateData.agreed_price = metadata.agreed_price
      if (metadata?.agreed_quote_id) updateData.agreed_quote_id = metadata.agreed_quote_id
      break
      
    case ProjectStatus.ESCROWED:
      if (metadata?.escrow_amount) updateData.escrow_amount = metadata.escrow_amount
      updateData.escrow_date = metadata?.escrow_date || new Date().toISOString()
      break
      
    case ProjectStatus.COMPLETED:
      updateData.completion_date = metadata?.completion_date || new Date().toISOString()
      break
      
    case ProjectStatus.PROTECTION:
      // Set protection end date (e.g., 7 days from now)
      const protectionEndDate = new Date()
      protectionEndDate.setDate(protectionEndDate.getDate() + 7)
      updateData.protection_end_date = metadata?.protection_end_date || protectionEndDate.toISOString()
      break
      
    case ProjectStatus.RELEASED:
      updateData.release_date = metadata?.release_date || new Date().toISOString()
      break
      
    case ProjectStatus.WITHDRAWN:
      updateData.withdrawal_date = metadata?.withdrawal_date || new Date().toISOString()
      break
      
    case ProjectStatus.DISPUTED:
      updateData.dispute_date = metadata?.dispute_date || new Date().toISOString()
      if (metadata?.dispute_reason) updateData.dispute_reason = metadata.dispute_reason
      break
  }

  return updateData
}

/**
 * Helper function to get default protection period in days
 */
export function getProtectionPeriodDays(): number {
  return 7 // Default 7 days protection period
}

/**
 * Check if a project is in an active state (can be worked on)
 */
export function isProjectActive(status: ProjectStatus): boolean {
  return [
    ProjectStatus.DRAFT,
    ProjectStatus.QUOTED,
    ProjectStatus.NEGOTIATING,
    ProjectStatus.AGREED,
    ProjectStatus.ESCROWED,
    ProjectStatus.IN_PROGRESS
  ].includes(status)
}

/**
 * Check if a project is completed (work finished)
 */
export function isProjectCompleted(status: ProjectStatus): boolean {
  return [
    ProjectStatus.COMPLETED,
    ProjectStatus.PROTECTION,
    ProjectStatus.RELEASED,
    ProjectStatus.WITHDRAWN
  ].includes(status)
}

/**
 * Check if a project has payment-related actions
 */
export function requiresPayment(status: ProjectStatus): boolean {
  return [
    ProjectStatus.AGREED,
    ProjectStatus.ESCROWED,
    ProjectStatus.RELEASED,
    ProjectStatus.WITHDRAWN
  ].includes(status)
}

/**
 * Get next logical status suggestions based on current status
 */
export function getNextStatusSuggestions(currentStatus: ProjectStatus): {
  status: ProjectStatus
  priority: 'high' | 'medium' | 'low'
  description: string
}[] {
  switch (currentStatus) {
    case ProjectStatus.DRAFT:
      return [
        {
          status: ProjectStatus.QUOTED,
          priority: 'high',
          description: '技师已提交报价'
        }
      ]
      
    case ProjectStatus.QUOTED:
      return [
        {
          status: ProjectStatus.NEGOTIATING,
          priority: 'high',
          description: '开始价格协商'
        },
        {
          status: ProjectStatus.AGREED,
          priority: 'medium',
          description: '直接确认报价'
        }
      ]
      
    case ProjectStatus.NEGOTIATING:
      return [
        {
          status: ProjectStatus.AGREED,
          priority: 'high',
          description: '达成最终协议'
        }
      ]
      
    case ProjectStatus.AGREED:
      return [
        {
          status: ProjectStatus.ESCROWED,
          priority: 'high',
          description: '业主支付并托管资金'
        }
      ]
      
    case ProjectStatus.ESCROWED:
      return [
        {
          status: ProjectStatus.IN_PROGRESS,
          priority: 'high',
          description: '技师开始工作'
        }
      ]
      
    case ProjectStatus.IN_PROGRESS:
      return [
        {
          status: ProjectStatus.COMPLETED,
          priority: 'high',
          description: '技师完成工作'
        }
      ]
      
    case ProjectStatus.COMPLETED:
      return [
        {
          status: ProjectStatus.PROTECTION,
          priority: 'high',
          description: '进入保护期'
        }
      ]
      
    case ProjectStatus.PROTECTION:
      return [
        {
          status: ProjectStatus.RELEASED,
          priority: 'medium',
          description: '保护期结束，放款给技师'
        }
      ]
      
    case ProjectStatus.RELEASED:
      return [
        {
          status: ProjectStatus.WITHDRAWN,
          priority: 'low',
          description: '技师提现'
        }
      ]
      
    default:
      return []
  }
}
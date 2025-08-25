// Project Status State Machine
// 订单状态机 - Comprehensive order lifecycle management

export enum ProjectStatus {
  // 初始状态
  PUBLISHED = 'published',            // 发单已创建，未有报价
  
  // 报价阶段
  QUOTED = 'quoted',                  // 收到一个或多个报价
  
  // 沟通协商阶段  
  NEGOTIATING = 'negotiating',        // 站内沟通中
  
  // 确认阶段
  AGREED = 'agreed',                  // 有最终商议价
  
  // 支付和托管阶段
  ESCROWED = 'escrowed',             // 业主支付完成，资金托管
  
  // 执行阶段
  IN_PROGRESS = 'in_progress',        // 进行中
  
  // 完成阶段
  COMPLETED = 'completed',            // 技师标记已完工
  
  // 保护期阶段
  PROTECTION = 'protection',          // 进入保护期倒计时
  
  // 发放阶段
  RELEASED = 'released',              // 放款完成，进入可提现余额
  
  // 提现阶段
  WITHDRAWN = 'withdrawn',            // 提现成功
  
  // 纠纷阶段
  DISPUTED = 'disputed',              // 纠纷中，仲裁流程
  
  // 取消状态
  CANCELLED = 'cancelled'             // 项目取消
}

// Status display labels in Chinese and English
export const PROJECT_STATUS_LABELS = {
  [ProjectStatus.PUBLISHED]: {
    zh: '已发布',
    en: 'Published',
    description: '项目已发布，等待报价'
  },
  [ProjectStatus.QUOTED]: {
    zh: '已报价',
    en: 'Quoted',
    description: '已收到报价，等待选择'
  },
  [ProjectStatus.NEGOTIATING]: {
    zh: '协商中',
    en: 'Negotiating',
    description: '正在与技师沟通细节'
  },
  [ProjectStatus.AGREED]: {
    zh: '已确认',
    en: 'Agreed',
    description: '价格已确认，等待支付'
  },
  [ProjectStatus.ESCROWED]: {
    zh: '已托管',
    en: 'Escrowed',
    description: '资金已托管，等待开工'
  },
  [ProjectStatus.IN_PROGRESS]: {
    zh: '进行中',
    en: 'In Progress',
    description: '项目正在执行中'
  },
  [ProjectStatus.COMPLETED]: {
    zh: '已完工',
    en: 'Completed',
    description: '工作已完成，等待验收'
  },
  [ProjectStatus.PROTECTION]: {
    zh: '保护期',
    en: 'Protection Period',
    description: '保护期倒计时中'
  },
  [ProjectStatus.RELEASED]: {
    zh: '已放款',
    en: 'Released',
    description: '款项已放款，可提现'
  },
  [ProjectStatus.WITHDRAWN]: {
    zh: '已提现',
    en: 'Withdrawn',
    description: '款项已成功提现'
  },
  [ProjectStatus.DISPUTED]: {
    zh: '争议中',
    en: 'Disputed',
    description: '存在争议，进入仲裁流程'
  },
  [ProjectStatus.CANCELLED]: {
    zh: '已取消',
    en: 'Cancelled',
    description: '项目已被取消'
  }
}

// Status colors for UI display
export const PROJECT_STATUS_COLORS = {
  [ProjectStatus.PUBLISHED]: 'blue',
  [ProjectStatus.QUOTED]: 'blue',
  [ProjectStatus.NEGOTIATING]: 'yellow',
  [ProjectStatus.AGREED]: 'purple',
  [ProjectStatus.ESCROWED]: 'indigo',
  [ProjectStatus.IN_PROGRESS]: 'orange',
  [ProjectStatus.COMPLETED]: 'green',
  [ProjectStatus.PROTECTION]: 'teal',
  [ProjectStatus.RELEASED]: 'emerald',
  [ProjectStatus.WITHDRAWN]: 'lime',
  [ProjectStatus.DISPUTED]: 'red',
  [ProjectStatus.CANCELLED]: 'slate'
}

// Define valid status transitions
export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.PUBLISHED]: [
    ProjectStatus.QUOTED,
    ProjectStatus.CANCELLED
  ],
  [ProjectStatus.QUOTED]: [
    ProjectStatus.NEGOTIATING,
    ProjectStatus.AGREED,
    ProjectStatus.CANCELLED
  ],
  [ProjectStatus.NEGOTIATING]: [
    ProjectStatus.AGREED,
    ProjectStatus.QUOTED,
    ProjectStatus.CANCELLED,
    ProjectStatus.DISPUTED
  ],
  [ProjectStatus.AGREED]: [
    ProjectStatus.ESCROWED,
    ProjectStatus.NEGOTIATING,
    ProjectStatus.CANCELLED
  ],
  [ProjectStatus.ESCROWED]: [
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.DISPUTED,
    ProjectStatus.CANCELLED
  ],
  [ProjectStatus.IN_PROGRESS]: [
    ProjectStatus.COMPLETED,
    ProjectStatus.DISPUTED
  ],
  [ProjectStatus.COMPLETED]: [
    ProjectStatus.PROTECTION,
    ProjectStatus.DISPUTED
  ],
  [ProjectStatus.PROTECTION]: [
    ProjectStatus.RELEASED,
    ProjectStatus.DISPUTED
  ],
  [ProjectStatus.RELEASED]: [
    ProjectStatus.WITHDRAWN
  ],
  [ProjectStatus.WITHDRAWN]: [],
  [ProjectStatus.DISPUTED]: [
    ProjectStatus.NEGOTIATING,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.COMPLETED,
    ProjectStatus.CANCELLED
  ],
  [ProjectStatus.CANCELLED]: []
}

// Helper functions
export function canTransitionTo(fromStatus: ProjectStatus, toStatus: ProjectStatus): boolean {
  return STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false
}

export function getValidTransitions(currentStatus: ProjectStatus): ProjectStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

export function getStatusLabel(status: ProjectStatus, language: 'zh' | 'en' = 'zh'): string {
  return PROJECT_STATUS_LABELS[status]?.[language] || status
}

export function getStatusDescription(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status]?.description || ''
}

export function getStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLORS[status] || 'gray'
}

// Status groups for filtering and categorization
export const STATUS_GROUPS = {
  ACTIVE: [
    ProjectStatus.PUBLISHED,
    ProjectStatus.QUOTED,
    ProjectStatus.NEGOTIATING,
    ProjectStatus.AGREED,
    ProjectStatus.ESCROWED,
    ProjectStatus.IN_PROGRESS
  ],
  COMPLETED: [
    ProjectStatus.COMPLETED,
    ProjectStatus.PROTECTION,
    ProjectStatus.RELEASED,
    ProjectStatus.WITHDRAWN
  ],
  PROBLEMATIC: [
    ProjectStatus.DISPUTED,
    ProjectStatus.CANCELLED
  ]
}

export function isActiveStatus(status: ProjectStatus): boolean {
  return STATUS_GROUPS.ACTIVE.includes(status)
}

export function isCompletedStatus(status: ProjectStatus): boolean {
  return STATUS_GROUPS.COMPLETED.includes(status)
}

export function isProblematicStatus(status: ProjectStatus): boolean {
  return STATUS_GROUPS.PROBLEMATIC.includes(status)
}
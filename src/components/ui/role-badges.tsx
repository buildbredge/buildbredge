"use client"

import { Badge } from "@/components/ui/badge"
import { Home, Wrench, Crown } from "lucide-react"
import type { UserRole } from "@/lib/services/apiClient"

interface RoleBadgesProps {
  roles: UserRole[]
  activeRole: 'owner' | 'tradie'
  className?: string
}

export function RoleBadges({ roles, activeRole, className = "" }: RoleBadgesProps) {
  const hasOwnerRole = roles.some(r => r.role_type === 'owner')
  const hasTradieRole = roles.some(r => r.role_type === 'tradie')
  const isMultiRole = roles.length > 1

  if (isMultiRole) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          多重身份用户
        </Badge>
        <div className="flex space-x-1">
          {hasOwnerRole && (
            <Badge 
              variant={activeRole === 'owner' ? "default" : "outline"}
              className={`text-xs ${activeRole === 'owner' ? 'bg-blue-600' : 'border-blue-300 text-blue-600'}`}
            >
              <Home className="w-3 h-3 mr-1" />
              业主
            </Badge>
          )}
          {hasTradieRole && (
            <Badge 
              variant={activeRole === 'tradie' ? "default" : "outline"}
              className={`text-xs ${activeRole === 'tradie' ? 'bg-green-600' : 'border-green-300 text-green-600'}`}
            >
              <Wrench className="w-3 h-3 mr-1" />
              技师
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // 单一角色用户
  if (hasOwnerRole) {
    return (
      <div className={className}>
        <Badge className="bg-blue-600 text-white">
          <Home className="w-3 h-3 mr-1" />
          业主账户
        </Badge>
      </div>
    )
  }

  if (hasTradieRole) {
    return (
      <div className={className}>
        <Badge className="bg-green-600 text-white">
          <Wrench className="w-3 h-3 mr-1" />
          技师账户
        </Badge>
      </div>
    )
  }

  return null
}

interface RoleStatsProps {
  ownerData?: {
    status: string
    balance: number
    projectCount?: number
  }
  tradieData?: {
    company: string
    specialty: string
    serviceRadius: number
    rating: number
    reviewCount: number
    status: string
    balance: number
  }
  className?: string
}

export function RoleStats({ ownerData, tradieData, className = "" }: RoleStatsProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {/* 业主统计 */}
      {ownerData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-800 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              业主账户
            </h3>
            <Badge 
              variant={ownerData.status === 'approved' ? 'default' : 'secondary'}
              className={ownerData.status === 'approved' ? 'bg-blue-600' : ''}
            >
              {ownerData.status === 'approved' ? '已认证' : '待认证'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-600">账户余额</p>
              <p className="font-semibold text-blue-800">¥{ownerData.balance.toFixed(2)}</p>
            </div>
            {ownerData.projectCount !== undefined && (
              <div>
                <p className="text-blue-600">发布项目</p>
                <p className="font-semibold text-blue-800">{ownerData.projectCount}个</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 技师统计 */}
      {tradieData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-green-800 flex items-center">
              <Wrench className="w-4 h-4 mr-2" />
              技师账户
            </h3>
            <Badge 
              variant={tradieData.status === 'approved' ? 'default' : 'secondary'}
              className={tradieData.status === 'approved' ? 'bg-green-600' : ''}
            >
              {tradieData.status === 'approved' ? '已认证' : '待认证'}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">服务类型:</span>
              <span className="font-medium text-green-800">{tradieData.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">公司名称:</span>
              <span className="font-medium text-green-800">{tradieData.company}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-green-200">
              <div>
                <p className="text-green-600">评分</p>
                <p className="font-semibold text-green-800">{tradieData.rating}⭐</p>
              </div>
              <div>
                <p className="text-green-600">评价</p>
                <p className="font-semibold text-green-800">{tradieData.reviewCount}条</p>
              </div>
              <div>
                <p className="text-green-600">余额</p>
                <p className="font-semibold text-green-800">¥{tradieData.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
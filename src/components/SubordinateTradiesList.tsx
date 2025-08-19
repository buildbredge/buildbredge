"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { SubordinateTradie } from "@/lib/supabase"
import { Users, Plus, Star, Calendar, Phone, Mail, User } from "lucide-react"
import AddTradieModal from "./AddTradieModal"

interface SubordinateTradiesListProps {
  parentTradieId: string
  parentCompany?: string
  onRefresh?: () => void
}

export default function SubordinateTradiesList({ 
  parentTradieId, 
  parentCompany, 
  onRefresh 
}: SubordinateTradiesListProps) {
  const [subordinates, setSubordinates] = useState<SubordinateTradie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSubordinates()
  }, [parentTradieId])

  const fetchSubordinates = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `/api/tradie-hierarchy?action=subordinates&tradieId=${parentTradieId}`
      )
      const result = await response.json()

      if (result.success) {
        setSubordinates(result.data || [])
      } else {
        // 空列表不算错误
        setSubordinates([])
      }
    } catch (error) {
      console.error('Error fetching subordinates:', error)
      // 网络错误或其他异常情况下不显示错误，静默处理
      setSubordinates([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTradieAdded = () => {
    fetchSubordinates()
    if (onRefresh) {
      onRefresh()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: '待审核', variant: 'secondary' as const },
      'approved': { label: '已激活', variant: 'default' as const },
      'active': { label: '活跃', variant: 'default' as const },
      'suspended': { label: '已暂停', variant: 'destructive' as const },
      'closed': { label: '已关闭', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'secondary' as const }
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            团队成员
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <AddTradieModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        parentTradieId={parentTradieId}
        parentCompany={parentCompany}
        onTradieAdded={handleTradieAdded}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              团队成员 ({subordinates.length})
            </CardTitle>
            <Button 
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加技师
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          {subordinates.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">暂无团队成员</p>
              <p className="text-sm text-gray-400 mb-4">
                点击上方"添加技师"按钮为您的团队添加新成员
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subordinates.map((subordinate) => (
                <div
                  key={subordinate.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {subordinate.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {subordinate.name}
                          </h4>
                          {getStatusBadge(subordinate.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          {subordinate.company && (
                            <p className="truncate">{subordinate.company}</p>
                          )}
                          {subordinate.specialty && (
                            <p className="truncate">专长: {subordinate.specialty}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {subordinate.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {subordinate.phone}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                加入: {formatDate(subordinate.created_at)}
                              </span>
                              {subordinate.rating > 0 && (
                                <span className="flex items-center">
                                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {subordinate.rating.toFixed(1)} ({subordinate.review_count}评价)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ParentTradie } from "@/lib/supabase"
import { Building2, Mail, User, Crown } from "lucide-react"

interface ParentTradieDisplayProps {
  childTradieId: string
}

export default function ParentTradieDisplay({ childTradieId }: ParentTradieDisplayProps) {
  const [parentTradie, setParentTradie] = useState<ParentTradie | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchParentTradie()
  }, [childTradieId])

  const fetchParentTradie = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `/api/tradie-hierarchy?action=parent&tradieId=${childTradieId}`
      )
      const result = await response.json()

      if (result.success) {
        setParentTradie(result.data)
      } else {
        // 没有父技师不算错误
        setParentTradie(null)
      }
    } catch (error) {
      console.error('Error fetching parent tradie:', error)
      // 静默处理错误，不显示错误信息
      setParentTradie(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 如果没有父技师，不显示组件
  if (!isLoading && !parentTradie) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2 text-amber-600" />
            所属团队
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }


  if (!parentTradie) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Crown className="w-5 h-5 mr-2 text-amber-600" />
          所属团队
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 border-2 border-amber-200">
            <AvatarFallback className="bg-amber-100 text-amber-800 font-medium">
              {parentTradie.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-amber-900 truncate">
                {parentTradie.name}
              </h4>
            </div>
            
            <div className="space-y-1">
              {parentTradie.company && (
                <div className="flex items-center text-sm text-amber-700">
                  <Building2 className="w-3 h-3 mr-1" />
                  <span className="truncate">{parentTradie.company}</span>
                </div>
              )}
              
              {parentTradie.specialty && (
                <div className="text-sm text-amber-600">
                  专长: {parentTradie.specialty}
                </div>
              )}
              
              <div className="flex items-center text-xs text-amber-600">
                <Mail className="w-3 h-3 mr-1" />
                <span className="truncate">{parentTradie.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-600 flex items-center">
            <User className="w-3 h-3 mr-1" />
            您是该团队的成员技师
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
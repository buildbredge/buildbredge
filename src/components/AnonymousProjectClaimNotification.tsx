"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell,
  Check, 
  X,
  FileText,
  Clock,
  User,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AnonymousProjectClaimNotificationProps {
  onClaim?: () => void
}

export function AnonymousProjectClaimNotification({ 
  onClaim 
}: AnonymousProjectClaimNotificationProps) {
  const { user } = useAuth()
  const [anonymousProjectCount, setAnonymousProjectCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.email) {
      checkAnonymousProjects()
    }
  }, [user])

  const checkAnonymousProjects = async () => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/users/claim-anonymous-projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        const count = result.count || 0
        setAnonymousProjectCount(count)
        setIsVisible(count > 0)
      }
    } catch (error) {
      console.error('Failed to check anonymous projects:', error)
    }
  }

  const handleClaimProjects = async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/users/claim-anonymous-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email
        })
      })

      const result = await response.json()

      if (response.ok) {
        setIsVisible(false)
        setAnonymousProjectCount(0)
        onClaim?.()
        
        // 显示成功消息（可选）
        console.log(`✅ Successfully claimed ${result.claimed || 0} anonymous projects`)
      } else {
        throw new Error(result.error || 'Failed to claim projects')
      }
    } catch (error: any) {
      console.error('Error claiming projects:', error)
      setError(error.message || '认领项目失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // 可以在这里添加本地存储以记住用户的选择
  }

  if (!isVisible || !user || anonymousProjectCount === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-blue-900">
                发现匿名发布的项目
              </h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {anonymousProjectCount} 个项目
              </Badge>
            </div>
            
            <p className="text-sm text-blue-800 mb-4">
              我们发现您的邮箱 <strong>{user.email}</strong> 之前发布过 {anonymousProjectCount} 个匿名项目。
              您现在可以认领这些项目，将它们关联到您的账户中，这样您就可以：
            </p>

            <ul className="text-xs text-blue-700 mb-4 space-y-1">
              <li className="flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>在仪表盘中查看和管理项目</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>跟踪项目状态和报价</span>
              </li>
              <li className="flex items-center space-x-2">
                <User className="w-3 h-3" />
                <span>直接与技师沟通</span>
              </li>
            </ul>

            {error && (
              <div className="text-sm text-red-600 mb-3">
                {error}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleClaimProjects}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    认领中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    认领项目
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <X className="w-4 h-4 mr-2" />
                暂时不需要
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
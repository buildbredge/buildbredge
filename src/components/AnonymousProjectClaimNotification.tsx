"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Bell,
  Check, 
  X,
  FileText,
  Clock,
  User,
  Loader2,
  CheckSquare,
  Square,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AnonymousProject {
  id: string
  title: string
  description: string
  status: string
  category: string
  profession: string
  location: string
  createdAt: string
}

interface AnonymousProjectClaimNotificationProps {
  onClaim?: () => void
}

export function AnonymousProjectClaimNotification({ 
  onClaim 
}: AnonymousProjectClaimNotificationProps) {
  const { user, authUser } = useAuth()
  const [anonymousProjects, setAnonymousProjects] = useState<AnonymousProject[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authUser?.email) {
      checkAnonymousProjects()
    }
  }, [authUser])

  const checkAnonymousProjects = async () => {
    if (!authUser?.email) return

    try {
      const response = await fetch(`/api/users/claim-anonymous-projects?email=${encodeURIComponent(authUser.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        const projects = result.projects || []
        setAnonymousProjects(projects)
        setIsVisible(projects.length > 0)
        // 默认选中所有项目
        setSelectedProjects(projects.map((p: AnonymousProject) => p.id))
      }
    } catch (error) {
      console.error('Failed to check anonymous projects:', error)
    }
  }

  const handleClaimProjects = async (claimAll = false) => {
    if (!authUser?.id || !user?.id) {
      setError("用户信息不完整，请重新登录")
      return
    }

    if (!claimAll && selectedProjects.length === 0) {
      setError("请至少选择一个项目进行认领")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const requestBody = {
        user_id: user.id,
        ...(claimAll 
          ? { project_ids: anonymousProjects.map(p => p.id) } 
          : { project_ids: selectedProjects }
        )
      }

      console.log(`🚀 Sending claim request:`, {
        claimAll,
        userId: user.id,
        userEmail: authUser?.email,
        totalAnonymousProjects: anonymousProjects.length,
        selectedProjectsCount: selectedProjects.length,
        requestBody
      })

      const response = await fetch('/api/users/claim-anonymous-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log(`📡 API Response status: ${response.status}`)
      console.log(`📡 API Response headers:`, Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log(`📡 API Response body:`, result)

      if (response.ok) {
        setIsVisible(false)
        setAnonymousProjects([])
        setSelectedProjects([])
        onClaim?.()
        
        // 显示成功消息（可选）
        console.log(`✅ Successfully claimed ${result.claimedCount || 0} anonymous projects`)
        
        // 如果有部分项目无法认领，也要显示信息
        if (result.claimedCount < (claimAll ? anonymousProjects.length : selectedProjects.length)) {
          const skipped = (claimAll ? anonymousProjects.length : selectedProjects.length) - result.claimedCount
          console.log(`ℹ️ ${skipped} projects were already claimed or unavailable`)
        }
      } else {
        // 更好的错误处理
        const errorMessage = result.error || 'Failed to claim projects'
        console.error('API Error:', errorMessage)
        
        // 如果是项目已被认领的错误，刷新列表
        if (errorMessage.includes('already claimed')) {
          console.log('🔄 Projects already claimed, refreshing list...')
          await checkAnonymousProjects()
        }
        
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('Error claiming projects:', error)
      
      // 提供更友好的错误信息
      let userFriendlyError = '认领项目失败'
      if (error.message.includes('already claimed')) {
        userFriendlyError = '这些项目已经被认领，列表已刷新'
      } else if (error.message.includes('not found')) {
        userFriendlyError = '项目不存在或无法认领'
      } else if (error.message.includes('belong to different email')) {
        userFriendlyError = '项目不属于当前账户邮箱'
      }
      
      setError(userFriendlyError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId])
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId))
    }
  }

  const handleSelectAll = () => {
    if (selectedProjects.length === anonymousProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(anonymousProjects.map(p => p.id))
    }
  }

  const handleClaimSingleProject = async (projectId: string) => {
    if (!authUser?.id || !user?.id) {
      setError("用户信息不完整，请重新登录")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const requestBody = {
        user_id: user.id,
        project_id: projectId
      }

      const response = await fetch('/api/users/claim-anonymous-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (response.ok) {
        // 从列表中移除已认领的项目
        setAnonymousProjects(prev => prev.filter(p => p.id !== projectId))
        setSelectedProjects(prev => prev.filter(id => id !== projectId))
        onClaim?.()
        
        console.log(`✅ Successfully claimed project ${projectId}`)
      } else {
        throw new Error(result.error || 'Failed to claim project')
      }
    } catch (error: any) {
      console.error('Error claiming project:', error)
      setError(error.message || '认领项目失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // 可以在这里添加本地存储以记住用户的选择
  }

  if (!isVisible || !authUser || anonymousProjects.length === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-blue-900">发现匿名发布的项目</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {anonymousProjects.length} 个项目
              </Badge>
            </div>
            <p className="text-sm text-blue-800 mt-1">
              您的邮箱 <strong>{authUser.email}</strong> 之前发布过以下匿名项目
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 项目列表 */}
        <div className="space-y-3">
          {/* 全选/反选按钮 */}
          <div className="flex items-center space-x-2 pb-2 border-b border-blue-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-blue-700 hover:bg-blue-100"
            >
              {selectedProjects.length === anonymousProjects.length ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  取消全选
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  全选
                </>
              )}
            </Button>
            <span className="text-sm text-blue-600">
              已选择 {selectedProjects.length} / {anonymousProjects.length} 个项目
            </span>
          </div>

          {/* 项目列表 */}
          {anonymousProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100"
            >
              <Checkbox
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={(checked) => 
                  handleProjectSelect(project.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{project.category}</span>
                  <Badge variant="outline" className="text-xs">
                    {project.status === 'published' ? '已发布' : project.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{project.profession}</span>
                    <span>•</span>
                    <span>{project.location}</span>
                    <span>•</span>
                    <span>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClaimSingleProject(project.id)}
                    disabled={isLoading}
                    className="text-xs h-6 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    认领
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 好处说明 */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 mb-2">认领项目后您可以：</p>
          <ul className="text-xs text-blue-700 space-y-1">
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
        </div>

        {error && (
          <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => handleClaimProjects(true)}
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
                认领全部
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleClaimProjects(false)}
            disabled={isLoading || selectedProjects.length === 0}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            认领选中 ({selectedProjects.length})
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={checkAnonymousProjects}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isLoading}
            className="text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4 mr-2" />
            稍后处理
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
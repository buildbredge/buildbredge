"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "../lib/services/apiClient"
import type { ProjectData } from "../lib/services/apiClient"

interface OwnerProjectsListProps {
  userId: string
  statusFilter?: string | null
}

export function OwnerProjectsList({ userId, statusFilter }: OwnerProjectsListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [userId, statusFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await apiClient.getProjects({ 
        limit: 20,
        status: statusFilter || undefined
      })
      
      if (response.success && response.data) {
        let filteredProjects = response.data.projects || []
        
        // If statusFilter is provided but API doesn't support it, filter client-side
        if (statusFilter && filteredProjects.length > 0) {
          filteredProjects = filteredProjects.filter(project => project.status === statusFilter)
        }
        
        setProjects(filteredProjects)
      } else {
        throw new Error(response.error || '获取项目失败')
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError(err.message || '获取项目失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "已发布", variant: "default" as const },
      quoted: { label: "已报价", variant: "secondary" as const },
      negotiating: { label: "协商中", variant: "default" as const },
      agreed: { label: "已确认", variant: "default" as const },
      escrowed: { label: "已托管", variant: "default" as const },
      in_progress: { label: "进行中", variant: "default" as const },
      completed: { label: "已完成", variant: "outline" as const },
      protection: { label: "保护期", variant: "outline" as const },
      released: { label: "已放款", variant: "outline" as const },
      withdrawn: { label: "已提现", variant: "outline" as const },
      disputed: { label: "争议中", variant: "destructive" as const },
      cancelled: { label: "已取消", variant: "destructive" as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) {
      // Fallback for unknown status
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      )
    }

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        <span>加载项目中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProjects} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  const getEmptyStateMessage = () => {
    if (statusFilter) {
      const statusLabels: Record<string, string> = {
        published: '已发布',
        quoted: '已报价',
        negotiating: '协商中',
        agreed: '已确认',
        escrowed: '已托管',
        in_progress: '进行中',
        completed: '已完成',
        protection: '保护期',
        released: '已放款',
        withdrawn: '已提现',
        disputed: '争议中',
        cancelled: '已取消'
      }
      const statusLabel = statusLabels[statusFilter] || statusFilter
      return {
        title: `暂无${statusLabel}状态的项目`,
        subtitle: '您可以点击上方的"项目总数"查看所有项目'
      }
    }
    return {
      title: '您还没有发布任何项目',
      subtitle: '发布您的第一个项目来寻找合适的技师'
    }
  }

  const emptyState = getEmptyStateMessage()

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{emptyState.title}</p>
          <p className="text-sm text-gray-400 mb-4">{emptyState.subtitle}</p>
          {!statusFilter && (
            <Button asChild>
              <Link href="/post-job">
                <Plus className="w-4 h-4 mr-2" />
                发布项目
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewProject(project.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate mb-1">
                      {project.description}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(project.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <span>{project.category || '未分类'}</span>
                        {project.profession && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{project.profession}</span>
                          </>
                        )}
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProject(project.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
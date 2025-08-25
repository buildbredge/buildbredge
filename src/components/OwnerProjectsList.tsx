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
}

export function OwnerProjectsList({ userId }: OwnerProjectsListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [userId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await apiClient.getProjects({ limit: 20 })
      
      if (response.success && response.data) {
        setProjects(response.data.projects || [])
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
      negotiating: { label: "协商中", variant: "default" as const },
      in_progress: { label: "进行中", variant: "default" as const },
      completed: { label: "已完成", variant: "outline" as const },
      reviewed: { label: "已评价", variant: "outline" as const },
      cancelled: { label: "已取消", variant: "destructive" as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

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

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">您还没有发布任何项目</p>
          <p className="text-sm text-gray-400 mb-4">
            发布您的第一个项目来寻找合适的技师
          </p>
          <Button asChild>
            <Link href="/post-job">
              <Plus className="w-4 h-4 mr-2" />
              发布项目
            </Link>
          </Button>
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
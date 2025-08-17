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
  Loader2,
  DollarSign,
  User,
  Building2
} from "lucide-react"

interface AcceptedProject {
  id: string
  description: string
  location: string
  status: string
  created_at: string
  accepted_quote: {
    id: string
    price: number
    description: string
    created_at: string
  }
  owner: {
    name?: string
    email: string
  }
}

interface TradieProjectsListProps {
  tradieId: string
  onCountChange?: (count: number) => void
}

export function TradieProjectsList({ tradieId, onCountChange }: TradieProjectsListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<AcceptedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [tradieId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/tradies/${tradieId}/projects`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取项目失败')
      }

      const projectsList = data.projects || []
      setProjects(projectsList)
      onCountChange?.(projectsList.length)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError(err.message || '获取项目失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { label: "进行中", variant: "default" as const },
      completed: { label: "已完成", variant: "outline" as const },
      reviewed: { label: "已评价", variant: "outline" as const }
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
          <p className="text-gray-500 mb-2">暂无进行中的项目</p>
          <p className="text-sm text-gray-400">
            当您的报价被接受后，项目会显示在这里
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => handleViewProject(project.id)}>
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
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        开始于 {formatDate(project.accepted_quote.created_at)}
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      <span>{project.owner.name || project.owner.email}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      NZD ${project.accepted_quote.price}
                    </div>
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
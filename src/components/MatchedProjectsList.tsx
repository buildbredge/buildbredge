"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  MapPin, 
  Calendar,
  Clock,
  Star,
  Eye,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ProjectData {
  id: string
  description: string
  detailed_description?: string
  location: string
  status: string
  email: string
  phone?: string
  time_option?: string
  priority_need?: string
  created_at: string
  updated_at: string
  category?: {
    id: string
    name_en: string
    name_zh: string
  }
  profession?: {
    id: string
    name_en: string
    name_zh: string
    category_id: string
  }
  distance?: number
  within_service_radius: boolean
}

interface MatchedProjectsResponse {
  projects: ProjectData[]
  total: number
  page: number
  limit: number
  totalPages: number
  matchType: 'exact' | 'category' | 'fallback'
}

interface MatchedProjectsListProps {
  tradieId: string
  className?: string
  onCountChange?: (count: number) => void
}

export function MatchedProjectsList({ tradieId, className = "", onCountChange }: MatchedProjectsListProps) {
  const router = useRouter()
  const [data, setData] = useState<MatchedProjectsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchMatchedProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/tradies/${tradieId}/matched-projects?page=${currentPage}&limit=${itemsPerPage}`
        )
        
        if (!response.ok) {
          throw new Error("Failed to fetch matched projects")
        }
        
        const responseData = await response.json()
        setData(responseData)
        onCountChange?.(responseData.total || 0)
      } catch (err) {
        console.error("Error fetching matched projects:", err)
        setError("无法获取匹配项目，请稍后再试")
      } finally {
        setLoading(false)
      }
    }

    if (tradieId) {
      fetchMatchedProjects()
    }
  }, [tradieId, currentPage, itemsPerPage])

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1) {
      return `${Math.round(distance * 1000)}米`
    }
    return `${distance.toFixed(1)}公里`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeOptionLabel = (option?: string) => {
    switch (option) {
      case 'urgent': return '紧急'
      case 'recent': return '最近几天'
      case 'flexible': return '时间灵活'
      default: return null
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'cost': return '成本优先'
      case 'quality': return '质量优先'
      default: return null
    }
  }

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact': return '精准匹配'
      case 'category': return '类别匹配'
      case 'fallback': return '推荐项目'
      default: return '匹配项目'
    }
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleQuickContact = (project: ProjectData, method: 'phone' | 'email', e: React.MouseEvent) => {
    e.stopPropagation()
    if (method === 'phone' && project.phone) {
      window.open(`tel:${project.phone}`)
    } else if (method === 'email' && project.email) {
      window.open(`mailto:${project.email}`)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            匹配项目
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">正在匹配合适的项目...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            匹配项目
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mr-3" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.projects.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            匹配项目
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 mb-2">暂时没有匹配的项目</p>
            <p className="text-sm text-gray-400">
              当有符合您专业技能的新项目时，我们会第一时间通知您
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            匹配项目
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">
              {getMatchTypeLabel(data.matchType)}
            </Badge>
            <Badge variant="outline">
              共 {data.total} 个项目
            </Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          根据您的专业技能匹配的项目，点击查看详细信息并联系业主
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:border-green-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {project.category && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {project.category.name_zh || project.category.name_en}
                      </Badge>
                    )}
                    {project.profession && (
                      <Badge variant="outline" className="text-xs">
                        {project.profession.name_zh || project.profession.name_en}
                      </Badge>
                    )}
                    {project.time_option && (
                      <Badge 
                        variant={project.time_option === 'urgent' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {getTimeOptionLabel(project.time_option)}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {project.description}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}</span>
                      {project.distance && (
                        <span className="text-green-600 font-medium">
                          ({formatDistance(project.distance)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  {project.detailed_description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.detailed_description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4">
                  {project.priority_need && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Star className="w-3 h-3" />
                      <span>{getPriorityLabel(project.priority_need)}</span>
                    </div>
                  )}
                  {!project.within_service_radius && (
                    <Badge variant="secondary" className="text-xs">
                      超出服务范围
                    </Badge>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleQuickContact(project, 'email', e)}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    邮件
                  </Button>
                  {project.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleQuickContact(project, 'phone', e)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      电话
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              第 {data.page} 页，共 {data.totalPages} 页 | 显示 {data.projects.length} 条，共 {data.total} 条
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
                disabled={currentPage >= data.totalPages}
              >
                下一页
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
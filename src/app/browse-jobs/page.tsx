"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MapPin, 
  Calendar, 
  Search, 
  Filter,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  Briefcase,
  Star,
  Users
} from "lucide-react"

interface Project {
  id: string
  description: string
  detailed_description: string
  location: string
  email: string
  phone: string | null
  status: 'published' | 'negotiating' | 'in_progress' | 'completed' | 'reviewed'
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
  }
  other_description?: string
  time_option?: string
  priority_need?: string
  quote_count?: number
  images?: string[]
}

interface Category {
  id: string
  name_en: string
  name_zh: string
}

export default function BrowseJobsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("latest")

  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetchCategories()
    ])
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // 构建查询参数
      const params = new URLSearchParams({
        limit: '50',
        sort: 'created_at:desc',
        status: 'published,negotiating'
      })

      const response = await fetch(`/api/projects/public?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getStatusBadge = (status: Project['status'], quoteCount: number = 0) => {
    const statusConfig = {
      published: { 
        label: "已发布", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "bg-green-100 text-green-800"
      },
      negotiating: { 
        label: `协商中 (${quoteCount}个报价)`, 
        variant: "secondary" as const, 
        icon: Clock,
        color: "bg-orange-100 text-orange-800"
      },
      in_progress: { 
        label: "进行中", 
        variant: "outline" as const, 
        icon: Clock,
        color: "bg-blue-100 text-blue-800"
      },
      completed: { 
        label: "已完成", 
        variant: "outline" as const, 
        icon: CheckCircle,
        color: "bg-purple-100 text-purple-800"
      },
      reviewed: { 
        label: "已评价", 
        variant: "outline" as const, 
        icon: Star,
        color: "bg-indigo-100 text-indigo-800"
      }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status === 'negotiating' ? `协商中 (${quoteCount}个报价)` : config.label}
      </Badge>
    )
  }

  const getTimeOptionLabel = (timeOption: string) => {
    switch (timeOption) {
      case 'urgent': return '紧急（今天）'
      case 'recent': return '最近几天'
      case 'flexible': return '没有固定时间'
      default: return timeOption
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'cost': return '成本优先'
      case 'quality': return '质量优先'
      default: return priority
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return '刚刚发布'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else if (diffInHours < 48) {
      return '1天前'
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = !searchTerm || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.detailed_description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || 
        project.category?.id === selectedCategory
      
      const matchesStatus = selectedStatus === "all" || 
        project.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'quotes':
          return (b.quote_count || 0) - (a.quote_count || 0)
        default:
          return 0
      }
    })

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">浏览项目</h1>
          </div>
          <p className="text-gray-600 text-lg">
            发现最新的项目机会，提交您的报价并开始合作
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">搜索项目</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索项目描述或位置..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">服务类别</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类别</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name_zh || category.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">项目状态</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="negotiating">协商中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">排序方式</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新发布</SelectItem>
                    <SelectItem value="oldest">最早发布</SelectItem>
                    <SelectItem value="quotes">报价最多</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              找到 <strong>{filteredProjects.length}</strong> 个项目
            </p>
            {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedStatus("all")
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载项目中...</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && (
          <div className="grid gap-6">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      没有找到符合条件的项目
                    </h3>
                    <p className="text-gray-600 mb-6">
                      尝试调整筛选条件或稍后再来看看新项目
                    </p>
                    <Button onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                    }}>
                      查看所有项目
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                              {project.description}
                            </h3>
                            <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3">
                              {getStatusBadge(project.status, project.quote_count || 0)}
                              <div className="flex items-center text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{formatDate(project.created_at)}</span>
                              </div>
                              {(project.quote_count || 0) > 0 && project.status !== 'negotiating' && (
                                <div className="flex items-center text-blue-600 text-sm">
                                  <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                                  <span className="whitespace-nowrap">{project.quote_count} 个报价</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0 hidden sm:block" />
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {project.detailed_description}
                        </p>

                        {/* Category & Profession */}
                        <div className="flex items-center flex-wrap gap-3 mb-4">
                          {project.category && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                              {project.category.name_zh || project.category.name_en}
                            </Badge>
                          )}
                          {project.profession && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              {project.profession.name_zh || project.profession.name_en}
                            </Badge>
                          )}
                          {project.other_description && (
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                              其他: {project.other_description}
                            </Badge>
                          )}
                        </div>

                        {/* Requirements */}
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                          {project.time_option && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {getTimeOptionLabel(project.time_option)}
                            </div>
                          )}
                          {project.priority_need && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              {getPriorityLabel(project.priority_need)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredProjects.length > 0 && (
          <Card className="mt-8">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  想要发布您自己的项目？
                </h3>
                <p className="text-gray-600 mb-4">
                  免费发布项目，获得专业技师的报价和服务
                </p>
                <Button asChild size="lg">
                  <a href="/post-job">
                    <DollarSign className="w-5 h-5 mr-2" />
                    发布项目
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
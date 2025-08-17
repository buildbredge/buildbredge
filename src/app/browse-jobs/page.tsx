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
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">项目筛选</h2>
                <p className="text-sm text-gray-500">快速筛选项目</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">项目状态</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>所有项目</span>
                    <Badge variant="secondary" className="text-xs">
                      {projects.length}
                    </Badge>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedStatus("published")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === "published"
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>已发布</span>
                    <Badge variant="secondary" className="text-xs">
                      {projects.filter(p => p.status === 'published').length}
                    </Badge>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedStatus("negotiating")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === "negotiating"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>协商中</span>
                    <Badge variant="secondary" className="text-xs">
                      {projects.filter(p => p.status === 'negotiating').length}
                    </Badge>
                  </div>
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">服务类别</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>所有类别</span>
                  </div>
                </button>
                {categories.map((category) => {
                  const categoryCount = projects.filter(p => p.category?.id === category.id).length
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{category.name_zh || category.name_en}</span>
                        {categoryCount > 0 && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {categoryCount}
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">排序方式</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "latest"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  最新发布
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "oldest"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  最早发布
                </button>
                <button
                  onClick={() => setSortBy("quotes")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "quotes"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  报价最多
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedStatus("all")
                    setSortBy("latest")
                  }}
                >
                  清除所有筛选
                </Button>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
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

            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  找到 <strong>{filteredProjects.length}</strong> 个项目
                </p>
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
        </main>
      </div>
    </div>
  )
}
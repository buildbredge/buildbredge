"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock, MapPin, DollarSign, Calendar, MessageCircle, Star, Eye,
  CheckCircle, AlertCircle, User, Phone, Mail, ChevronRight,
  FileText, Camera, Plus, Filter, Search
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Project {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  location: string
  budget: string
  urgency: string
  images: string[]
  status: 'published' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  userId: string
  quotes: Quote[]
}

interface Quote {
  id: string
  tradieId: string
  tradieName: string
  tradieCompany: string
  tradieAvatar: string
  tradieRating: number
  tradieReviews: number
  amount: number
  description: string
  timeline: string
  warranty: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  materials: string[]
  experience: string
}

function MyProjectsContent() {
  const searchParams = useSearchParams()
  const highlightedProjectId = searchParams?.get('project')

  const [projects, setProjects] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState('active')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
    generateMockQuotes()
  }, [])

  const loadProjects = () => {
    if (typeof window !== 'undefined') {
      const savedProjects = JSON.parse(localStorage.getItem('buildbridge_projects') || '[]')
      setProjects(savedProjects)

      if (highlightedProjectId) {
        const highlighted = savedProjects.find((p: Project) => p.id === highlightedProjectId)
        if (highlighted) {
          setSelectedProject(highlighted)
        }
      }
    }
  }

  // 生成模拟报价数据
  const generateMockQuotes = () => {
    if (typeof window === 'undefined') return

    const savedProjects = JSON.parse(localStorage.getItem('buildbridge_projects') || '[]')

    const mockTradies = [
      {
        id: 'tradie1',
        name: '张建国',
        company: '精工建筑有限公司',
        avatar: '👨‍🔧',
        rating: 4.9,
        reviews: 127,
        experience: '15年专业经验'
      },
      {
        id: 'tradie2',
        name: '李师傅',
        company: '快速维修中心',
        avatar: '🔨',
        rating: 4.7,
        reviews: 89,
        experience: '10年本地经验'
      },
      {
        id: 'tradie3',
        name: '王电工',
        company: '专业电气服务',
        avatar: '⚡',
        rating: 4.8,
        reviews: 156,
        experience: '12年认证经验'
      }
    ]

    const updatedProjects = savedProjects.map((project: Project) => {
      if (project.quotes && project.quotes.length > 0) {
        return project // 已有报价，不重复生成
      }

      const quotes: Quote[] = mockTradies.map((tradie, index) => ({
        id: `quote-${project.id}-${tradie.id}`,
        tradieId: tradie.id,
        tradieName: tradie.name,
        tradieCompany: tradie.company,
        tradieAvatar: tradie.avatar,
        tradieRating: tradie.rating,
        tradieReviews: tradie.reviews,
        amount: 1500 + (index * 500) + Math.floor(Math.random() * 1000),
        description: `专业${project.subcategory}服务，包含所有必要材料和人工费用。我有${tradie.experience}，保证高质量完工。`,
        timeline: ['3-5天', '1周内', '5-7天'][index],
        warranty: ['2年保修', '1年保修', '18个月保修'][index],
        status: 'pending',
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        materials: ['优质材料', '专业工具', '安全设备'],
        experience: tradie.experience
      }))

      return { ...project, quotes }
    })

    if (typeof window !== 'undefined') {
      localStorage.setItem('buildbridge_projects', JSON.stringify(updatedProjects))
    }
    setProjects(updatedProjects)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: '已发布', className: 'bg-green-100 text-green-800' },
      in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-800' },
      completed: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      flexible: { label: '时间灵活', className: 'bg-gray-100 text-gray-800' },
      soon: { label: '尽快开始', className: 'bg-yellow-100 text-yellow-800' },
      urgent: { label: '紧急', className: 'bg-red-100 text-red-800' }
    }
    const config = urgencyConfig[urgency as keyof typeof urgencyConfig]
    return config ? <Badge className={config.className}>{config.label}</Badge> : null
  }

  const acceptQuote = (projectId: string, quoteId: string) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedQuotes = project.quotes.map(quote => ({
          ...quote,
          status: (quote.id === quoteId ? 'accepted' : 'rejected') as 'pending' | 'accepted' | 'rejected'
        }))
        return { ...project, quotes: updatedQuotes, status: 'in_progress' as const }
      }
      return project
    })

    setProjects(updatedProjects)
    if (typeof window !== 'undefined') {
      localStorage.setItem('buildbridge_projects', JSON.stringify(updatedProjects))
    }
    alert('报价已接受！技师将很快联系您确认详细信息。')
  }

  const filterProjects = (status: string) => {
    switch (status) {
      case 'active':
        return projects.filter(p => ['published', 'in_progress'].includes(p.status))
      case 'completed':
        return projects.filter(p => p.status === 'completed')
      case 'all':
      default:
        return projects
    }
  }

  const filteredProjects = filterProjects(activeTab)

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的项目</h1>
            <p className="text-gray-600">管理您发布的项目和查看技师报价</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0" asChild>
            <Link href="/post-job">
              <Plus className="w-4 h-4 mr-2" />
              发布新项目
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总项目</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">进行中</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => ['published', 'in_progress'].includes(p.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已完成</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">收到报价</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + p.quotes.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">进行中项目</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="all">全部项目</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
                  <p className="text-gray-600 mb-6">您还没有发布任何项目，开始发布您的第一个项目吧！</p>
                  <Button asChild>
                    <Link href="/post-job">发布新项目</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className={`transition-shadow hover:shadow-lg ${
                    highlightedProjectId === project.id ? 'ring-2 ring-green-500' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            {getStatusBadge(project.status)}
                            {getUrgencyBadge(project.urgency)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {project.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${project.budget}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">收到报价</p>
                          <p className="text-2xl font-bold text-green-600">{project.quotes.length}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-700 mb-3">{project.description}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <Badge variant="outline">{project.category}</Badge>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                            <Badge variant="outline">{project.subcategory}</Badge>
                          </div>
                        </div>

                        {/* Project Images */}
                        {project.images.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">项目图片</p>
                            <div className="flex space-x-2">
                              {project.images.slice(0, 4).map((image, index) => (
                                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={image}
                                    alt={`项目图片 ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {project.images.length > 4 && (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">+{project.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quotes Section */}
                        {project.quotes.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-medium text-gray-900">技师报价 ({project.quotes.length})</p>
                              <Button variant="ghost" size="sm">
                                查看全部
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {project.quotes.slice(0, 2).map((quote) => (
                                <div key={quote.id} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <Avatar>
                                        <AvatarFallback>{quote.tradieAvatar}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{quote.tradieName}</p>
                                        <p className="text-sm text-gray-600">{quote.tradieCompany}</p>
                                        <div className="flex items-center space-x-1 mt-1">
                                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                          <span className="text-xs">{quote.tradieRating}</span>
                                          <span className="text-xs text-gray-500">({quote.tradieReviews} 评价)</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-green-600">${quote.amount}</p>
                                      <p className="text-sm text-gray-500">{quote.timeline}</p>
                                    </div>
                                  </div>

                                  <p className="text-sm text-gray-700 mb-3">{quote.description}</p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>保修：{quote.warranty}</span>
                                      <span>{quote.experience}</span>
                                    </div>

                                    {quote.status === 'pending' && project.status === 'published' && (
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {/* 查看详情 */}}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          查看
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => acceptQuote(project.id, quote.id)}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          接受报价
                                        </Button>
                                      </div>
                                    )}

                                    {quote.status === 'accepted' && (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        已接受
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {project.quotes.length > 2 && (
                                <Button variant="ghost" className="w-full">
                                  查看更多报价 ({project.quotes.length - 2} 个)
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">等待技师报价中...</p>
                            <p className="text-sm text-gray-500">我们会在24小时内为您匹配合适的技师</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function MyProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>}>
      <MyProjectsContent />
    </Suspense>
  )
}

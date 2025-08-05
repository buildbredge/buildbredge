"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Heart,
  Star,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Tag
} from "lucide-react"
import { type Project, type Category, type Profession } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useSignedImageUrls } from "@/hooks/useSignedImageUrl"
import { ImageGalleryModal } from "@/components/ImageGalleryModal"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<(Project & { category?: Category, profession?: Profession }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  
  // 图片画廊状态
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // 稳定化图片URL数组，避免无限重新渲染
  const stableImageUrls = useMemo(() => {
    return project?.images || []
  }, [project?.images?.join(',')]) // 使用内容比较而不是引用比较

  // 使用签名URL Hook
  const { signedUrls: signedImageUrls, loading: urlsLoading } = useSignedImageUrls(
    stableImageUrls, 
    3600 // 1小时有效期
  )

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const projectId = params.id as string
        
        // 使用API路由而不是直接的Supabase查询
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) {
          throw new Error('项目不存在或已被删除')
        }
        
        const projectData = await response.json()
        setProject(projectData)
      } catch (err) {
        console.error("Failed to fetch project:", err)
        setError("项目不存在或已被删除")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const openImageGallery = (index: number) => {
    setSelectedImageIndex(index)
    setIsGalleryOpen(true)
  }

  const closeImageGallery = () => {
    setIsGalleryOpen(false)
  }

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      published: { label: "已发布", variant: "default" as const, icon: CheckCircle },
      draft: { label: "草稿", variant: "secondary" as const, icon: AlertCircle },
      in_progress: { label: "进行中", variant: "default" as const, icon: Clock },
      completed: { label: "已完成", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "已取消", variant: "destructive" as const, icon: XCircle }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载项目信息中...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">项目未找到</h1>
          <p className="text-gray-600 mb-6">{error || "该项目不存在或已被删除"}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gray-800">BuildBridge</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Project Hero Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 mb-6 sm:mb-8">
            {/* Project Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex-1">
                {/* Project Subject/Description as title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {project.description}
                </h1>
                
                <div className="flex items-center gap-3 mb-4">
                  {getStatusBadge(project.status)}
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    发布于 {formatDate(project.created_at)}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700 font-medium">{project.location}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Project Requirements */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">项目要求</h3>
              
              {/* Time Option and Priority Need */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {(project as any).time_option && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">时间要求</p>
                      <p className="font-semibold text-gray-900">
                        {(project as any).time_option === 'urgent' && '紧急（今天）'}
                        {(project as any).time_option === 'recent' && '最近几天'}
                        {(project as any).time_option === 'flexible' && '没有固定时间'}
                      </p>
                    </div>
                  </div>
                )}
                
                {(project as any).priority_need && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">优先考虑</p>
                      <p className="font-semibold text-gray-900">
                        {(project as any).priority_need === 'cost' && '成本'}
                        {(project as any).priority_need === 'quality' && '质量'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Service Categories */}
              <h4 className="text-md font-semibold text-gray-900 mb-3">服务需求</h4>
              {project.category_id && project.profession_id ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Tag className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">服务类别</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {project.category?.name_zh || project.category?.name_en || '未知类别'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">具体职业</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {project.profession?.name_zh || project.profession?.name_en || '未知职业'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : project.other_description ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">其他服务需求</p>
                    <p className="text-lg font-semibold text-gray-900">{project.other_description}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 text-gray-500">
                  <AlertCircle className="w-6 h-6" />
                  <p className="text-lg">未指定服务类别</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">联系方式</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">邮箱地址</p>
                    <p className="font-medium text-gray-900">{project.email}</p>
                  </div>
                </div>
                {project.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">联系电话</p>
                      <p className="font-medium text-gray-900">{project.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">项目详情</h2>
            </div>
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-green-500">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium text-lg">
                  {project.detailed_description}
                </p>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          {(project.images?.length > 0 || project.video) && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">项目图片和视频</h2>
              </div>
              
              {/* Images */}
              {project.images && project.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">项目图片</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.images.map((originalUrl, index) => {
                      const imageUrl = signedImageUrls[index] || originalUrl
                      const isLoading = urlsLoading && !signedImageUrls[index]
                      
                      return (
                        <div key={index} className="group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-lg">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                                <p className="text-sm mt-3 font-medium">加载图片中...</p>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={imageUrl}
                              alt={`项目图片 ${index + 1}`}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageGallery(index)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-gray-500 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors" onclick="window.open('${originalUrl}', '_blank')">
                                    <div class="text-center p-4">
                                      <p class="text-sm font-medium">图片加载失败</p>
                                      <p class="text-xs mt-1 text-gray-400">点击查看原图</p>
                                    </div>
                                  </div>
                                `
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Video */}
              {project.video && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">项目视频</h3>
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-sm">
                    <video
                      src={project.video}
                      controls
                      className="w-full h-full"
                      poster="/video-placeholder.jpg"
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">联系并开始合作</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex-1 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-3" />
                立即联系业主
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 py-4 text-lg font-semibold border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-3" />
                电话沟通
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition-all duration-300"
              >
                <Star className="w-5 h-5 mr-2" />
                收藏
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">身份已验证</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">信息真实有效</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">平台保障</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Meta Information */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>项目ID: {project.id}</p>
            <p>最后更新: {formatDate((project as any).updated_at || project.created_at)}</p>
          </div>
        </div>
      </div>

      {/* 图片画廊模态框 */}
      <ImageGalleryModal
        images={signedImageUrls.filter(Boolean) as string[]}
        isOpen={isGalleryOpen}
        initialIndex={selectedImageIndex}
        onClose={closeImageGallery}
      />
    </div>
  )
}
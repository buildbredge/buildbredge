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
import { projectsApi, type Project, type Category, type Profession } from "@/lib/api"
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
        const projectData = await projectsApi.getByIdWithCategory(projectId)
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.description}
                  </h1>
                  {getStatusBadge(project.status)}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>发布于 {formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">联系信息</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{project.email}</span>
                </div>
                {project.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{project.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Category */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">服务类别</h2>
            <div className="space-y-4">
              {project.category_id && project.profession_id ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">服务类别</p>
                      <p className="font-medium text-gray-900">
                        {project.category?.name_zh || project.category?.name_en || '未知类别'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">具体职业</p>
                      <p className="font-medium text-gray-900">
                        {project.profession?.name_zh || project.profession?.name_en || '未知职业'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : project.other_description ? (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">其他服务需求</p>
                    <p className="font-medium text-gray-900">{project.other_description}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-gray-500">
                  <AlertCircle className="w-5 h-5" />
                  <p>未指定服务类别</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">项目详情</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {project.detailed_description}
              </p>
            </div>
          </div>

          {/* Media Gallery */}
          {(project.images?.length > 0 || project.video) && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">项目图片和视频</h2>
              
              {/* Images */}
              {project.images && project.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">项目图片</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.images.map((originalUrl, index) => {
                      // 使用签名URL，如果还在加载则显示加载状态
                      const imageUrl = signedImageUrls[index] || originalUrl
                      const isLoading = urlsLoading && !signedImageUrls[index]
                      
                      return (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                <p className="text-sm mt-2">加载图片中...</p>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={imageUrl}
                              alt={`项目图片 ${index + 1}`}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => openImageGallery(index)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-gray-500 cursor-pointer" onclick="window.open('${originalUrl}', '_blank')">
                                    <div class="text-center">
                                      <p class="text-sm">图片加载失败</p>
                                      <p class="text-xs mt-1">点击查看原图</p>
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
                  <h3 className="font-medium text-gray-900 mb-3">项目视频</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
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
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-green-600 hover:bg-green-700 flex-1">
                <Mail className="w-4 h-4 mr-2" />
                联系业主
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                电话咨询
              </Button>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                收藏项目
              </Button>
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
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, FileImage, Video } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { projectsApi } from "@/lib/api"
import { uploadProjectImages, uploadProjectVideo, validateFile, formatFileSize } from "@/lib/storage"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"

interface JobForm {
  detailedDescription: string
  email: string
  phone: string
  images: File[]
  video: File | null
  // Google Places相关字段
  googlePlace?: PlaceResult
}


export default function PostJobPage() {
  console.log("=== POST JOB PAGE LOADED ===", new Date().toISOString())

  const [jobForm, setJobForm] = useState<JobForm>({
    detailedDescription: "",
    email: "",
    phone: "",
    images: [],
    video: null,
    googlePlace: undefined
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)



  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert("请填写所有必需信息")
      return
    }

    setIsUploading(true)

    try {
      console.log('🚀 开始提交项目到数据库...')

      // 获取地理位置信息
      const locationString = jobForm.googlePlace?.address || ''
      const latitude = jobForm.googlePlace?.coordinates?.lat || null
      const longitude = jobForm.googlePlace?.coordinates?.lng || null

      console.log('📍 位置信息:', {
        location: locationString,
        coordinates: { latitude, longitude }
      })

      // 构建项目数据
      const projectData = {
        description: jobForm.detailedDescription.substring(0, 100), // 简短描述
        location: locationString,
        latitude,
        longitude,
        detailed_description: jobForm.detailedDescription,
        email: jobForm.email,
        phone: jobForm.phone || null,
        images: imagePreviews, // 暂时使用预览URL
        video: videoPreview || null,
        status: 'published' as const,
        user_id: `user_${Date.now()}` // 临时用户ID
      }

      console.log('📋 项目数据:', projectData)

      // 使用API创建项目
      const createdProject = await projectsApi.create(projectData)
      console.log('✅ 项目创建成功:', createdProject)

      setIsSubmitted(true)

    } catch (error) {
      console.error('❌ 发布项目时出错:', error)
      alert(`发布项目时出错: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const updateJobForm = (field: keyof JobForm, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }))
  }

  // 处理Google Places地址选择
  const handlePlaceSelect = (place: PlaceResult) => {
    setJobForm(prev => ({
      ...prev,
      googlePlace: place
    }))
  }


  const handleImageUpload = async (files: FileList | null) => {
    if (!files || isUploading) return

    const newFiles = Array.from(files).slice(0, 5 - jobForm.images.length)
    
    // 验证文件
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of newFiles) {
      const validation = validateFile(file, 'image')
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }

    if (errors.length > 0) {
      alert(`以下文件无法上传:\n${errors.join('\n')}`)
    }

    if (validFiles.length === 0) {
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      return
    }

    // 创建预览
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
    setJobForm(prev => ({ ...prev, images: [...prev.images, ...validFiles] }))

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return

    const file = files[0]
    
    // 验证文件
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      alert(validation.error)
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      return
    }

    // 创建预览
    const videoUrl = URL.createObjectURL(file)
    setVideoPreview(videoUrl)
    setJobForm(prev => ({ ...prev, video: file }))

    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newImages = jobForm.images.filter((_, i) => i !== index)

    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(newPreviews)
    setJobForm(prev => ({ ...prev, images: newImages }))
  }

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoPreview('')
    setJobForm(prev => ({ ...prev, video: null }))
  }

  // 表单验证函数
  const isFormValid = () => {
    // 位置信息必须完整
    if (!jobForm.googlePlace) return false
    
    // 详细描述和邮箱必须填写
    if (!jobForm.detailedDescription.trim() || !jobForm.email.trim()) return false
    
    return true
  }


  // 如果已提交，显示成功页面
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gray-800">BuildBridge</span>
                <span className="text-sm text-gray-500">需求提交成功</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">提交成功！</h1>
            <p className="text-xl text-gray-600 mb-8">
              您已成功提交需求，您会收到我们的确认邮件。我们会根据您的信息快速匹配相应技师。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700" size="lg" asChild>
                <Link href="/browse-tradies">寻找技师</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/suppliers">折扣商家</Link>
              </Button>
            </div>
          </div>
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-800">BuildBridge</span>
              <span className="text-sm text-gray-500">发布需求</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>


      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-normal text-green-600 mb-6">
              专属客服为您服务
            </h1>
            <p className="text-xl text-gray-600">
              填写您的需求信息，我们为您匹配当地的专业人士。
            </p>
          </div>

          <form className="space-y-8">
            {/* 单一表单卡片 */}
            <div className="bg-white rounded-lg border p-8 shadow-sm">
              <div className="space-y-8">
                {/* 联系信息 */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">联系信息</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="email" className="text-lg font-medium">邮箱地址 *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={jobForm.email}
                        onChange={(e) => updateJobForm('email', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-lg font-medium">联系方式（电话）</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+64 21 123 4567"
                        value={jobForm.phone}
                        onChange={(e) => updateJobForm('phone', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* 位置信息 */}
                <div>
               
                  <div className="space-y-4">
                    {!jobForm.googlePlace ? (
                      <GooglePlacesAutocomplete
                        onPlaceSelect={handlePlaceSelect}
                        placeholder="输入您的详细地址..."
                        label="项目位置 *"
                        className="h-12 text-lg"
                      />
                    ) : (
                      <SelectedAddressDisplay
                        place={jobForm.googlePlace}
                        onEdit={() => setJobForm(prev => ({ ...prev, googlePlace: undefined }))}
                      />
                    )}
                  </div>
                </div>

                {/* 项目详情 */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">项目详情</h2>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="detailed-description" className="text-lg font-medium">描述您的项目需求 *</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        请详细描述您的需求，比如：我想更换5个水龙头，已有管道。或者我想装修我的房子，需要更换壁纸，粉刷屋顶，以及更换窗户。再或者我想建一栋房子需要分割土地设计结构探查地基等等
                      </p>
                      <Textarea
                        id="detailed-description"
                        placeholder="比如我想更换水管、装修房子、建造新房等，请详细描述您的项目需求..."
                        value={jobForm.detailedDescription}
                        onChange={(e) => updateJobForm('detailedDescription', e.target.value)}
                        className="min-h-[150px] text-base"
                        rows={6}
                      />
                    </div>

                    {/* 媒体上传 */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* 图片上传 */}
                      <div>
                        <Label className="text-lg font-medium">上传相关图片（最多5张）</Label>

                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mt-3 mb-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                                  <Image
                                    src={preview}
                                    alt={`预览图片 ${index + 1}`}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {imagePreviews.length < 5 && (
                          <Card className="border-dashed border-2 border-gray-300 hover:border-green-400 transition-colors mt-3">
                            <CardContent className="p-6">
                              <div
                                className="text-center cursor-pointer"
                                onClick={() => imageInputRef.current?.click()}
                              >
                                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium mb-2">点击上传图片</p>
                                <p className="text-sm text-gray-500">
                                  支持 JPG、PNG、WebP 格式，单张最大 10MB
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <input
                          ref={imageInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      {/* 视频上传 */}
                      <div>
                        <Label className="text-lg font-medium">上传视频（可选）</Label>

                        {videoPreview && (
                          <div className="mt-3 mb-4">
                            <div className="relative group">
                              <video
                                src={videoPreview}
                                controls
                                className="w-full max-h-64 rounded-lg bg-gray-100"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={removeVideo}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {!videoPreview && (
                          <Card className="border-dashed border-2 border-gray-300 hover:border-green-400 transition-colors mt-3">
                            <CardContent className="p-6">
                              <div
                                className="text-center cursor-pointer"
                                onClick={() => videoInputRef.current?.click()}
                              >
                                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium mb-2">点击上传视频</p>
                                <p className="text-sm text-gray-500">
                                  支持 MP4、MOV、AVI、WMV 格式，最大 100MB
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/mp4,video/mov,video/avi,video/wmv"
                          onChange={(e) => handleVideoUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="flex justify-center pt-6">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 px-12 py-3 text-lg"
                        size="lg"
                        disabled={!isFormValid() || isUploading}
                      >
                        {isUploading ? '发布中...' : '发布需求'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="py-16"></div>
    </div>
  )
}

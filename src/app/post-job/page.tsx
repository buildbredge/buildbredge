"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, FileImage, Video, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { projectsApi, userApi } from "@/lib/api"
import { uploadProjectImages, uploadProjectVideo, validateFile, formatFileSize } from "../../../lib/storage"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { RegisterDialog } from "@/components/RegisterDialog"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface JobForm {
  detailedDescription: string
  email: string
  phone: string
  images: File[]
  video: File | null
  // Google Places相关字段
  googlePlace?: PlaceResult
}

interface UploadProgress {
  images: { [index: number]: number }
  video: number
}


export default function PostJobPage() {
  console.log("=== POST JOB PAGE LOADED ===", new Date().toISOString())

  const { user } = useAuth()
  const router = useRouter()

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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ images: {}, video: 0 })
  const [uploadError, setUploadError] = useState<string>("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // 新增的对话框状态
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [emailCheckResult, setEmailCheckResult] = useState<{ exists: boolean; userType?: 'homeowner' | 'tradie' } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)



  const handleSubmit = async () => {
    // 第一步：表单验证
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setUploadError(`表单验证失败:\n${errors.join('\n')}`)
      return
    }

    setValidationErrors([])
    setUploadError("")

    // 第二步：判断用户是否登录
    if (user) {
      // 已登录用户直接保存项目
      await saveProject(user.id)
    } else {
      // 未登录用户需要检查邮箱
      await checkEmailAndProceed()
    }
  }

  // 检查邮箱并决定后续流程
  const checkEmailAndProceed = async () => {
    setIsProcessing(true)
    
    try {
      const result = await userApi.checkEmailExists(jobForm.email)
      setEmailCheckResult(result)
      
      if (result.exists) {
        // 邮箱已存在，显示登录确认对话框
        setShowEmailDialog(true)
      } else {
        // 邮箱不存在，显示注册确认对话框
        setShowRegisterDialog(true)
      }
    } catch (error) {
      console.error('检查邮箱时出错:', error)
      setUploadError('检查邮箱时出错，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  // 保存项目的核心函数
  const saveProject = async (userId: string | null = null) => {
    setIsUploading(true)
    setUploadError("")

    try {
      console.log('🚀 开始提交项目...')

      // 获取地理位置信息
      const locationString = jobForm.googlePlace?.address || ''
      const latitude = jobForm.googlePlace?.coordinates?.lat || null
      const longitude = jobForm.googlePlace?.coordinates?.lng || null

      console.log('📍 位置信息:', {
        location: locationString,
        coordinates: { latitude, longitude }
      })

      // 如果有文件，先上传文件再创建项目
      let uploadedImageUrls: string[] = []
      let uploadedVideoUrl: string | null = null
      
      // 为了获取项目ID用于文件上传，我们先生成一个临时ID
      const tempProjectId = crypto.randomUUID()

      // 上传图片
      if (jobForm.images.length > 0) {
        console.log('📸 开始上传图片...')
        try {
          uploadedImageUrls = await uploadProjectImages(
            jobForm.images,
            tempProjectId,
            (fileIndex, progress) => {
              setUploadProgress(prev => ({
                ...prev,
                images: { ...prev.images, [fileIndex]: progress }
              }))
            }
          )
          console.log('✅ 图片上传成功:', uploadedImageUrls)
        } catch (error) {
          console.error('❌ 图片上传失败:', error)
          setUploadError(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
          // 继续执行，不阻断流程
        }
      }

      // 上传视频
      if (jobForm.video) {
        console.log('🎬 开始上传视频...')
        try {
          uploadedVideoUrl = await uploadProjectVideo(
            jobForm.video,
            tempProjectId,
            (progress) => {
              setUploadProgress(prev => ({ ...prev, video: progress }))
            }
          )
          console.log('✅ 视频上传成功:', uploadedVideoUrl)
        } catch (error) {
          console.error('❌ 视频上传失败:', error)
          setUploadError(`视频上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
          // 继续执行，不阻断流程
        }
      }

      // 创建项目记录，包含已上传的文件URL
      const projectData: any = {
        description: jobForm.detailedDescription.substring(0, 100),
        location: locationString,
        latitude,
        longitude,
        detailed_description: jobForm.detailedDescription,
        email: jobForm.email,
        phone: jobForm.phone || null,
        images: uploadedImageUrls, // 直接包含上传的图片URL
        video: uploadedVideoUrl,
        status: 'published' as const,
        user_id: userId || null // 如果是匿名用户则为null
      }

      console.log('📋 创建项目记录（包含文件URL）...', projectData)
      const createdProject = await projectsApi.create(projectData)
      
      if (!createdProject || !createdProject.id) {
        throw new Error('项目创建失败：未返回有效的项目ID')
      }
      
      const projectId = createdProject.id
      console.log('✅ 项目创建成功，ID:', projectId)

      // 保存成功，跳转到项目详情页
      router.push(`/projects/${projectId}`)

    } catch (error) {
      console.error('❌ 发布项目时出错:', error)
      setUploadError(`发布项目时出错: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress({ images: {}, video: 0 })
    }
  }

  // 对话框处理函数
  const handleEmailDialogConfirm = () => {
    // 用户选择登录
    setShowEmailDialog(false)
    router.push(`/auth/login?email=${encodeURIComponent(jobForm.email)}`)
  }

  const handleEmailDialogCancel = () => {
    // 用户选择匿名发布
    setShowEmailDialog(false)
    saveProject(null) // null表示匿名用户
  }

  const handleRegisterDialogSuccess = (userId: string) => {
    // 注册成功，保存项目到新用户
    setShowRegisterDialog(false)
    saveProject(userId)
  }

  const handleRegisterDialogError = (error: string) => {
    setUploadError(`注册失败: ${error}`)
  }

  const handleRegisterDialogCancel = () => {
    // 用户选择匿名发布
    setShowRegisterDialog(false)
    saveProject(null) // null表示匿名用户
  }

  const updateJobForm = (field: keyof JobForm, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }))
    // 清除错误信息当用户开始输入时
    if (uploadError) {
      setUploadError("")
    }
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
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
    
    setUploadError("") // 清除之前的错误

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
      setUploadError(`以下图片文件无法上传:\n${errors.join('\n')}`)
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
    
    setUploadError("") // 清除之前的错误

    const file = files[0]
    
    // 验证文件
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      setUploadError(`视频文件上传失败: ${validation.error}`)
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

  // 增强的表单验证函数（用于提交时的完整验证）
  const validateForm = (): string[] => {
    const errors: string[] = []
    
    // 验证邮箱
    if (!jobForm.email.trim()) {
      errors.push("请填写邮箱地址")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email)) {
      errors.push("请填写有效的邮箱地址")
    }
    
    // 验证位置信息
    if (!jobForm.googlePlace) {
      errors.push("请选择项目位置")
    }
    
    // 验证详细描述
    if (!jobForm.detailedDescription.trim()) {
      errors.push("请描述您的项目需求")
    } else if (jobForm.detailedDescription.trim().length < 10) {
      errors.push("项目描述至少需要10个字符")
    }
    
    return errors
  }

  // 简化的表单验证函数（用于按钮disabled状态 - 只检查必填项）
  const isFormValid = () => {
    // 只检查邮箱和项目详情（只要有内容即可）
    const hasEmail = jobForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email)
    const hasDescription = jobForm.detailedDescription.trim().length > 0
    
    // 添加更详细的调试信息
    const isValid = hasEmail && hasDescription
    console.log('=== 表单验证状态 ===', {
      email: jobForm.email,
      emailTrimmed: jobForm.email.trim(),
      emailRegexTest: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email),
      hasEmail,
      description: jobForm.detailedDescription,
      descriptionTrimmed: jobForm.detailedDescription.trim(),
      descriptionLength: jobForm.detailedDescription.trim().length,
      hasDescription,
      isUploading,
      isProcessing,
      finalIsValid: isValid,
      buttonShouldBeDisabled: !isValid || isUploading || isProcessing
    })
    
    return isValid
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
                        label="项目位置"
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
                          accept="video/mp4,video/quicktime,video/avi,video/x-ms-wmv,.mp4,.mov,.avi,.wmv"
                          onChange={(e) => handleVideoUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* 错误信息显示 */}
                    {uploadError && (
                      <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    {/* 上传进度显示 */}
                    {isUploading && (
                      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Upload className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">正在上传文件...</h4>
                        </div>

                        {/* 图片上传进度 */}
                        {jobForm.images.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700">图片上传进度:</p>
                            {jobForm.images.map((file, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-xs text-blue-600">
                                  <span>{file.name}</span>
                                  <span>{uploadProgress.images[index] || 0}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress.images[index] || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 视频上传进度 */}
                        {jobForm.video && (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700">视频上传进度:</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-blue-600">
                                <span>{jobForm.video.name}</span>
                                <span>{uploadProgress.video}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress.video}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 调试信息 - 开发环境显示 */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <h4 className="font-medium text-yellow-800 mb-2">调试信息:</h4>
                        <div className="grid grid-cols-2 gap-2 text-yellow-700">
                          <div>邮箱: {jobForm.email || '(空)'}</div>
                          <div>邮箱验证: {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email) ? '✅' : '❌'}</div>
                          <div>描述长度: {jobForm.detailedDescription.trim().length}</div>
                          <div>描述验证: {jobForm.detailedDescription.trim().length > 0 ? '✅' : '❌'}</div>
                          <div>表单有效: {isFormValid() ? '✅' : '❌'}</div>
                          <div>按钮状态: {(!isFormValid() || isUploading || isProcessing) ? '禁用' : '启用'}</div>
                        </div>
                      </div>
                    )}

                    {/* 提交按钮 */}
                    <div className="flex justify-center pt-6">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 px-12 py-3 text-lg"
                        size="lg"
                        disabled={!isFormValid() || isUploading || isProcessing}
                      >
                        {isUploading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>发布中...</span>
                          </div>
                        ) : isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>检查中...</span>
                          </div>
                        ) : (
                          '发布需求'
                        )}
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

      {/* 对话框组件 */}
      {emailCheckResult && (
        <ConfirmationDialog
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          type="email-exists"
          email={jobForm.email}
          onConfirm={handleEmailDialogConfirm}
          onCancel={handleEmailDialogCancel}
          isLoading={isUploading}
        />
      )}

      <ConfirmationDialog
        open={showRegisterDialog && !emailCheckResult?.exists}
        onClose={() => setShowRegisterDialog(false)}
        type="register-prompt"
        email={jobForm.email}
        onConfirm={() => {
          setShowRegisterDialog(false)
          // 这里应该打开实际的注册对话框，但由于复杂性，暂时跳转到注册页面
          router.push(`/auth/register?email=${encodeURIComponent(jobForm.email)}`)
        }}
        onCancel={handleRegisterDialogCancel}
        isLoading={isUploading}
      />

      <RegisterDialog
        open={false} // 暂时禁用，使用页面跳转代替
        onClose={() => setShowRegisterDialog(false)}
        email={jobForm.email}
        onSuccess={handleRegisterDialogSuccess}
        onError={handleRegisterDialogError}
      />
    </div>
  )
}

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, FileImage, Upload, AlertCircle, Check, FileText, Download, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { projectsApi } from "@/lib/api"
import { uploadProjectImages, uploadProjectDocuments, validateFile } from "../../../lib/storage"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"
import CategoryProfessionSelector from "@/components/CategoryProfessionSelector"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobForm {
  subject: string
  detailedDescription: string
  email: string
  phone: string
  images: File[]
  files: File[]
  // Google Places相关字段
  googlePlace?: PlaceResult
  // 分类和职业相关字段
  categoryId?: string
  professionId?: string
  isOther: boolean
  otherDescription: string
  // 新增字段
  timeOption: string
  priorityNeed: string
  language: string
}

interface UploadProgress {
  images: { [index: number]: number }
  files: { [index: number]: number }
}


export default function PostJobPage() {
  console.log("=== POST JOB PAGE LOADED ===", new Date().toISOString())

  const { user } = useAuth()
  const router = useRouter()

  const [jobForm, setJobForm] = useState<JobForm>({
    subject: "",
    detailedDescription: "",
    email: "",
    phone: "",
    images: [],
    files: [],
    googlePlace: undefined,
    categoryId: undefined,
    professionId: undefined,
    isOther: false,
    otherDescription: "",
    timeOption: "urgent",
    priorityNeed: "quality",
    language: user?.language || "中/EN"
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ images: {}, files: {} })
  const [uploadError, setUploadError] = useState<string>("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)



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

    // 第二步：根据登录状态保存项目
    if (user) {
      // 已登录用户：保存项目并关联用户ID
      await saveProject(user.id)
    } else {
      // 未登录用户：保存匿名项目
      await saveProject(null)
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
      let uploadedFileUrls: string[] = []
      
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

      // 上传文件
      if (jobForm.files.length > 0) {
        console.log('📄 开始上传文档...')
        try {
          uploadedFileUrls = await uploadProjectDocuments(
            jobForm.files,
            tempProjectId,
            (fileIndex, progress) => {
              setUploadProgress(prev => ({
                ...prev,
                files: { ...prev.files, [fileIndex]: progress }
              }))
            }
          )
          console.log('✅ 文档上传成功:', uploadedFileUrls)
        } catch (error) {
          console.error('❌ 文档上传失败:', error)
          setUploadError(`文档上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
          // 继续执行，不阻断流程
        }
      }


      // 创建项目记录，包含已上传的文件URL
      const projectData: any = {
        description: jobForm.subject,
        location: locationString,
        latitude,
        longitude,
        detailed_description: jobForm.detailedDescription,
        email: jobForm.email,
        phone: jobForm.phone || null,
        images: uploadedImageUrls, // 直接包含上传的图片URL
        files: uploadedFileUrls, // 直接包含上传的文件URL
        status: 'published' as const,
        user_id: userId || null, // 如果是匿名用户则为null
        category_id: jobForm.isOther ? null : (jobForm.categoryId || null),
        profession_id: jobForm.isOther ? null : (jobForm.professionId || null),
        other_description: jobForm.isOther ? jobForm.otherDescription : null,
        time_option: jobForm.timeOption || 'urgent',
        priority_need: jobForm.priorityNeed || 'quality',
        language: jobForm.language || '中/EN'
      }

      console.log('📋 创建项目记录（包含文件URL）...', projectData)
      const createdProject = await projectsApi.create(projectData)
      
      if (!createdProject || !createdProject.id) {
        throw new Error('项目创建失败：未返回有效的项目ID')
      }
      
      const projectId = createdProject.id
      console.log('✅ 项目创建成功，ID:', projectId)

      // 发送邮件通知
      try {
        console.log('📧 开始发送邮件通知...')
        const notificationResponse = await fetch('/api/projects/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId })
        })

        if (notificationResponse.ok) {
          const notificationResult = await notificationResponse.json()
          console.log('✅ 邮件通知发送成功:', notificationResult)
        } else {
          console.error('❌ 邮件通知发送失败:', await notificationResponse.text())
          // 不影响主流程，继续跳转
        }
      } catch (error) {
        console.error('❌ 发送邮件通知时出错:', error)
        // 不影响主流程，继续跳转
      }

      // 保存成功，显示成功提示或跳转
      if (!user) {
        // 匿名用户显示特别的成功信息
        setShowSuccessModal(true)
      } else {
        // 注册用户直接跳转到项目详情页
        router.push(`/projects/${projectId}`)
      }

    } catch (error) {
      console.error('❌ 发布项目时出错:', error)
      
      // 为匿名用户提供更友好的错误信息
      let errorMessage = '发布项目时出错'
      
      if (error instanceof Error) {
        // 检查常见错误类型并提供友好信息
        if (error.message.includes('email')) {
          errorMessage = '邮箱地址有误，请检查后重试'
        } else if (error.message.includes('location') || error.message.includes('address')) {
          errorMessage = '位置信息有误，请重新选择地址'
        } else if (error.message.includes('category') || error.message.includes('profession')) {
          errorMessage = '服务类别选择有误，请重新选择'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.message.includes('timeout')) {
          errorMessage = '提交超时，请重试'
        } else {
          errorMessage = `发布项目时出错: ${error.message}`
        }
      }
      
      // 如果是匿名用户，添加额外的帮助信息
      if (!user) {
        errorMessage += '\n\n💡 提示：如果问题持续存在，您可以：\n• 检查邮箱地址是否正确\n• 确保选择了正确的位置\n• 稍后重试\n• 或考虑注册账户以获得更好的支持'
      }
      
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress({ images: {}, files: {} })
    }
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


  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newImages = jobForm.images.filter((_, i) => i !== index)

    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(newPreviews)
    setJobForm(prev => ({ ...prev, images: newImages }))
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || isUploading) return
    
    setUploadError("") // 清除之前的错误

    const newFiles = Array.from(files).slice(0, 3 - jobForm.files.length)
    
    // 验证文件
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of newFiles) {
      const validation = validateFile(file, 'document')
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }

    if (errors.length > 0) {
      setUploadError(`以下文件无法上传:\n${errors.join('\n')}`)
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // 添加到文件列表
    setJobForm(prev => ({ ...prev, files: [...prev.files, ...validFiles] }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = jobForm.files.filter((_, i) => i !== index)
    setJobForm(prev => ({ ...prev, files: newFiles }))
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
    
    // 验证简单描述和详细描述
    if (!jobForm.subject.trim()) {
      errors.push("请填写简单描述")
    } else if (jobForm.subject.trim().length < 5) {
      errors.push("简单描述至少需要5个字符")
    }
    
    if (!jobForm.detailedDescription.trim()) {
      errors.push("请描述您的项目需求")
    } else if (jobForm.detailedDescription.trim().length < 10) {
      errors.push("项目描述至少需要10个字符")
    }
    
    // 验证服务类别和职业
    if (!jobForm.isOther) {
      if (!jobForm.categoryId) {
        errors.push("请选择服务类别")
      }
      if (!jobForm.professionId) {
        errors.push("请选择具体职业")
      }
    } else {
      if (!jobForm.otherDescription.trim()) {
        errors.push("请填写其他服务内容的描述")
      } else if (jobForm.otherDescription.trim().length < 5) {
        errors.push("其他服务描述至少需要5个字符")
      }
    }
    
    return errors
  }

  // 简化的表单验证函数（用于按钮disabled状态 - 只检查必填项）
  const isFormValid = () => {
    // 检查邮箱、简单描述和项目详情
    const hasEmail = jobForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email)
    const hasSubject = jobForm.subject.trim().length > 0
    const hasDescription = jobForm.detailedDescription.trim().length > 0
    
    // 检查分类/职业选择
    const hasValidCategory = jobForm.isOther 
      ? jobForm.otherDescription.trim().length > 0
      : (jobForm.categoryId && jobForm.professionId)
    
    // 添加更详细的调试信息
    const isValid = hasEmail && hasSubject && hasDescription && hasValidCategory
    console.log('=== 表单验证状态 ===', {
      email: jobForm.email,
      emailTrimmed: jobForm.email.trim(),
      emailRegexTest: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobForm.email),
      hasEmail,
      subject: jobForm.subject,
      hasSubject,
      description: jobForm.detailedDescription,
      descriptionTrimmed: jobForm.detailedDescription.trim(),
      descriptionLength: jobForm.detailedDescription.trim().length,
      hasDescription,
      isUploading,
      finalIsValid: isValid,
      buttonShouldBeDisabled: !isValid || isUploading
    })
    
    return isValid
  }



  return (
    <div className="min-h-screen bg-gray-50">
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
                {/* 隐私提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    我们会问您几个问题，以便在几分钟内帮您联系到合适的商家或技工。带照片的介绍可提高 20% 的技工兴趣。为保护您的隐私，请勿在职位名称或描述中包含姓名、电话或地址。
                  </p>
                  {!user && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>匿名发布提醒：</strong>您正在以匿名用户身份发布项目。项目发布后，我们会向您的邮箱发送确认邮件，请保存邮件作为项目凭证。
                      </p>
                    </div>
                  )}
                </div>

                {/* 简单描述 */}
                <div>
                  <Label htmlFor="subject" className="text-lg font-medium">简单描述 *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="简单描述您的需求，例如：更换水龙头、室内装修、房屋匔筑等"
                    value={jobForm.subject}
                    onChange={(e) => updateJobForm('subject', e.target.value)}
                    className="mt-2"
                  />
                </div>

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

                {/* 服务类别选择 */}
                <CategoryProfessionSelector
                  selectedCategoryId={jobForm.categoryId}
                  selectedProfessionId={jobForm.professionId}
                  isOther={jobForm.isOther}
                  otherDescription={jobForm.otherDescription}
                  onCategoryChange={(categoryId) => updateJobForm('categoryId', categoryId)}
                  onProfessionChange={(professionId) => updateJobForm('professionId', professionId)}
                  onOtherToggle={(isOther) => updateJobForm('isOther', isOther)}
                  onOtherDescriptionChange={(description) => updateJobForm('otherDescription', description)}
                />

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

                    {/* 时间选项和优先项 */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* 时间选项 */}
                      <div>
                        <Label className="text-lg font-medium">时间选项</Label>
                        <Select value={jobForm.timeOption} onValueChange={(value) => updateJobForm('timeOption', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="选择时间需求" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">紧急（今天）</SelectItem>
                            <SelectItem value="recent">最近几天</SelectItem>
                            <SelectItem value="flexible">没有固定时间</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 需求优先项 */}
                      <div>
                        <Label className="text-lg font-medium">需求优先项</Label>
                        <Select value={jobForm.priorityNeed} onValueChange={(value) => updateJobForm('priorityNeed', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="选择优先项" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cost">成本</SelectItem>
                            <SelectItem value="quality">质量</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 语言偏好 */}
                      <div>
                        <Label className="text-lg font-medium">
                          <Globe className="w-4 h-4 inline mr-2" />
                          语言偏好
                        </Label>
                        <Select value={jobForm.language} onValueChange={(value) => updateJobForm('language', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="选择语言偏好" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="中文">中文</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="中/EN">中/EN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

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

                    {/* 文件上传 */}
                    <div>
                        <Label className="text-lg font-medium">上传相关文件（最多3个，每个最大10MB）</Label>
                        <p className="text-sm text-gray-500 mb-3">
                          支持 PDF、Word、Excel、PowerPoint、文本、压缩包等格式
                        </p>

                        {jobForm.files.length > 0 && (
                          <div className="space-y-2 mt-3 mb-4">
                            {jobForm.files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {jobForm.files.length < 3 && (
                          <Card className="border-dashed border-2 border-gray-300 hover:border-green-400 transition-colors mt-3">
                            <CardContent className="p-6">
                              <div
                                className="text-center cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium mb-2">点击上传文件</p>
                                <p className="text-sm text-gray-500">
                                  支持各种格式，单个文件最大 10MB
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
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

                        {/* 文件上传进度 */}
                        {jobForm.files.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm text-blue-700">文件上传进度:</p>
                            {jobForm.files.map((file, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-xs text-blue-600">
                                  <span>{file.name}</span>
                                  <span>{uploadProgress.files[index] || 0}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress.files[index] || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
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
                          <div>按钮状态: {(!isFormValid() || isUploading) ? '禁用' : '启用'}</div>
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
                        disabled={!isFormValid() || isUploading}
                      >
                        {isUploading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>发布中...</span>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {user ? '任务发布成功！' : '项目发布成功！'}
              </h3>
              <p className="text-gray-600">
                {user ? (
                  '您的任务已成功发送到所有相关商家和技师，回复信息会发送到您的邮箱或会员区。'
                ) : (
                  <>
                    您的项目已成功发布！我们已向您的邮箱 <strong>{jobForm.email}</strong> 发送确认邮件。
                    <br /><br />
                    <span className="text-sm">
                      • 符合条件的技师会通过邮件联系您<br />
                      • 请查收邮件获取项目详情和管理方式<br />
                      • 如需修改项目，请回复确认邮件<br />
                      • <strong>注册账户后，您可以认领此项目并在仪表盘中管理</strong>
                    </span>
                  </>
                )}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                window.location.href = 'https://buildbridge.nz/'
              }}
              className="bg-green-600 hover:bg-green-700 px-8 py-2"
            >
              OK
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

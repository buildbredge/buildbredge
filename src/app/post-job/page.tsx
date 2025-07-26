"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, MapPin, FileImage, Video } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { projectsApi } from "@/lib/api"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"

interface JobForm {
  description: string
  country: string
  city: string
  district: string
  detailedDescription: string
  email: string
  phone: string
  images: File[]
  video: File | null
  // Google Places相关字段
  googlePlace?: PlaceResult
  useGooglePlace: boolean
}

interface LocationData {
  [country: string]: {
    [city: string]: string[]
  }
}

export default function PostJobPage() {
  console.log("=== POST JOB PAGE LOADED ===", new Date().toISOString())

  const [jobForm, setJobForm] = useState<JobForm>({
    description: "",
    country: "",
    city: "",
    district: "",
    detailedDescription: "",
    email: "",
    phone: "",
    images: [],
    video: null,
    googlePlace: undefined,
    useGooglePlace: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string>("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // 位置数据
  const locationData: LocationData = {
    "美国": {
      "纽约": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
      "洛杉矶": ["Hollywood", "Beverly Hills", "Santa Monica", "Downtown LA", "Pasadena"],
      "芝加哥": ["The Loop", "North Side", "South Side", "West Side", "Lincoln Park"],
      "旧金山": ["Downtown", "Mission District", "Castro", "Pacific Heights", "Chinatown"]
    },
    "加拿大": {
      "多伦多": ["Downtown", "North York", "Scarborough", "Etobicoke", "Markham"],
      "温哥华": ["Downtown", "Richmond", "Burnaby", "Surrey", "Coquitlam"],
      "蒙特利尔": ["Downtown", "Plateau", "Old Montreal", "Westmount", "Outremont"],
      "卡尔加里": ["Downtown", "Beltline", "Kensington", "Hillhurst", "Inglewood"]
    },
    "澳大利亚": {
      "悉尼": ["CBD", "Bondi", "Manly", "Parramatta", "Chatswood"],
      "墨尔本": ["CBD", "South Yarra", "St Kilda", "Richmond", "Brunswick"],
      "布里斯班": ["CBD", "Fortitude Valley", "New Farm", "West End", "Paddington"],
      "珀斯": ["CBD", "Fremantle", "Subiaco", "Cottesloe", "Northbridge"]
    },
    "新西兰": {
      "奥克兰": ["CBD", "Ponsonby", "Parnell", "Milford", "Newmarket"],
      "惠灵顿": ["CBD", "Te Aro", "Mount Victoria", "Kelburn", "Island Bay"],
      "基督城": ["CBD", "Riccarton", "Merivale", "Addington", "Papanui"],
      "汉密尔顿": ["CBD", "Hillcrest", "Fairfield", "Dinsdale", "Te Rapa"]
    }
  }


  const handleSubmit = async () => {
    if (jobForm.detailedDescription && jobForm.email) {
      try {
        console.log('开始提交项目到数据库...')

        // 构建位置信息
        const locationString = jobForm.useGooglePlace && jobForm.googlePlace
          ? jobForm.googlePlace.address
          : `${jobForm.country}-${jobForm.city}-${jobForm.district}`

        const projectData = {
          description: jobForm.description,
          location: locationString,
          detailed_description: jobForm.detailedDescription,
          email: jobForm.email,
          phone: jobForm.phone || null,
          images: imagePreviews,
          video: videoPreview || null,
          status: 'published' as const,
          user_id: 'demo-user'
        }

        // 使用真实API创建项目
        const createdProject = await projectsApi.create(projectData)
        console.log('项目创建成功:', createdProject)

        setIsSubmitted(true)

      } catch (error) {
        console.error('发布项目时出错:', error)
        alert('发布项目时出错，请检查网络连接后重试。')
      }
    } else {
      alert("请填写所有必需信息")
    }
  }

  const updateJobForm = (field: keyof JobForm, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }))

    // 当国家或城市改变时，重置下级选项
    if (field === 'country') {
      setJobForm(prev => ({ ...prev, city: '', district: '' }))
    } else if (field === 'city') {
      setJobForm(prev => ({ ...prev, district: '' }))
    }
  }

  // 处理Google Places地址选择
  const handlePlaceSelect = (place: PlaceResult) => {
    setJobForm(prev => ({
      ...prev,
      googlePlace: place,
      useGooglePlace: true,
      // 同时更新传统字段以保持兼容性
      country: place.country,
      city: place.city || place.state,
      district: place.district || ""
    }))
  }

  // 切换输入模式
  const toggleInputMode = () => {
    setJobForm(prev => ({
      ...prev,
      useGooglePlace: !prev.useGooglePlace,
      // 清空相关字段
      googlePlace: undefined,
      country: "",
      city: "",
      district: ""
    }))
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).slice(0, 5 - jobForm.images.length)
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
    })

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
      setJobForm(prev => ({ ...prev, images: [...prev.images, ...validFiles] }))
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleVideoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv']

    if (validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024) {
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
      setJobForm(prev => ({ ...prev, video: file }))
    } else {
      alert('请上传有效的视频文件（MP4, MOV, AVI, WMV），大小不超过100MB')
    }

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
    // 基本描述必须填写
    if (!jobForm.description.trim()) return false
    
    // 位置信息必须完整
    const isLocationComplete = jobForm.useGooglePlace
      ? jobForm.googlePlace
      : (jobForm.country && jobForm.city && jobForm.district)
    
    if (!isLocationComplete) return false
    
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

          <form className="space-y-12">
            {/* 第一部分：基本需求描述 */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">描述您的需求</h2>
              <div>
                <Textarea
                  placeholder="比如我想更换水管或我想装修房子。"
                  value={jobForm.description}
                  onChange={(e) => updateJobForm('description', e.target.value)}
                  className="min-h-[120px] text-lg p-4 border-2 border-gray-300 focus:border-green-500 rounded-lg resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* 第二部分：位置信息 */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">您的位置在哪里？</h2>
              <p className="text-gray-600 mb-6">
                根据位置信息将您与您所在地区的技工联系起来
              </p>

              <div className="space-y-6">
                {/* 输入模式切换 */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-800">位置输入方式</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        {jobForm.useGooglePlace ? '使用Google地址自动完成' : '手动选择国家/城市/区域'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleInputMode}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      {jobForm.useGooglePlace ? '手动选择' : '地址自动完成'}
                    </Button>
                  </div>
                </div>

                {/* Google Places 自动完成 */}
                {jobForm.useGooglePlace ? (
                  <div className="space-y-4">
                    {!jobForm.googlePlace ? (
                      <GooglePlacesAutocomplete
                        onPlaceSelect={handlePlaceSelect}
                        placeholder="输入您的详细地址..."
                        label="详细地址 *"
                        className="h-12 text-lg"
                        countries={['nz', 'au', 'us', 'ca']}
                      />
                    ) : (
                      <SelectedAddressDisplay
                        place={jobForm.googlePlace}
                        onEdit={() => setJobForm(prev => ({ ...prev, googlePlace: undefined }))}
                      />
                    )}
                  </div>
                ) : (
                  // 手动选择模式
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* 国家选择 */}
                    <div>
                      <Label className="text-lg font-medium mb-3 block">选择国家 *</Label>
                      <Select value={jobForm.country} onValueChange={(value) => updateJobForm('country', value)}>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="请选择国家" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(locationData).map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 城市选择 */}
                    <div>
                      <Label className="text-lg font-medium mb-3 block">选择城市 *</Label>
                      <Select 
                        value={jobForm.city} 
                        onValueChange={(value) => updateJobForm('city', value)}
                        disabled={!jobForm.country}
                      >
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="请选择城市" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(locationData[jobForm.country] || {}).map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 区域选择 */}
                    <div>
                      <Label className="text-lg font-medium mb-3 block">选择区域 *</Label>
                      <Select 
                        value={jobForm.district} 
                        onValueChange={(value) => updateJobForm('district', value)}
                        disabled={!jobForm.country || !jobForm.city}
                      >
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="请选择区域" />
                        </SelectTrigger>
                        <SelectContent>
                          {(locationData[jobForm.country]?.[jobForm.city] || []).map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 手动选择位置预览 */}
                {!jobForm.useGooglePlace && jobForm.country && jobForm.city && jobForm.district && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-medium text-green-800">
                        {jobForm.country} - {jobForm.city} - {jobForm.district}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 第三部分：详细信息 */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">详细项目信息</h2>
              <p className="text-gray-600 mb-6">
                如果方便的话，您可以为我们提供更多信息，让我们更精准更快的为您匹配技师计算报价。
              </p>

              <div className="space-y-6">
                {/* 需求描述 */}
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

                {/* 联系信息 */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 邮箱 */}
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

                  {/* 联系方式 */}
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

                {/* 媒体上传 */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 图片上传 */}
                  <div>
                    <Label className="text-lg font-medium">上传相关图片（最多5张）</Label>

                    {/* 图片预览 */}
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
                    disabled={!isFormValid()}
                  >
                    发布需求
                  </Button>
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

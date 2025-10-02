"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Save, User, Phone, MapPin, Building, CheckCircle, Globe } from "lucide-react"
import { PortfolioManagement } from "@/components/ui/portfolio-management"


export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // 基础信息
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [language, setLanguage] = useState("中/EN")
  const [website, setWebsite] = useState("")
  const [serviceArea, setServiceArea] = useState("")
  
  // Tradie专用信息
  const [companyName, setCompanyName] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [bio, setBio] = useState("")
  const [tradieSpecialties, setTradieSpecialties] = useState<string[]>([])
  const [tradieSpecialtyCategories, setTradieSpecialtyCategories] = useState<string[]>([])
  const [tradieServiceAreas, setTradieServiceAreas] = useState<Array<{ id: string; city: string; area: string }>>([])
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }
    
    if (user) {
      setFullName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
      setLanguage(user.language || "中/EN")
      setWebsite(user.website || "")
      setServiceArea(user.service_area || "")

      const profileServiceAreas = Array.isArray(user.service_areas)
        ? user.service_areas
        : Array.isArray(user.serviceAreas)
          ? user.serviceAreas
          : []
      setTradieServiceAreas(profileServiceAreas)
      
      // Load tradie data if available
      if (user.tradieData) {
        setCompanyName(user.tradieData.company || "")
        setBio(user.tradieData.bio || "")
        setHourlyRate(user.tradieData.hourlyRate?.toString() || "")
        setExperienceYears(user.tradieData.experienceYears?.toString() || "")

        const specialtiesFromProfile = Array.isArray(user.tradieData.specialties)
          ? user.tradieData.specialties
          : user.tradieData.specialty && user.tradieData.specialty !== "未设置专业领域"
            ? [user.tradieData.specialty]
            : []

        setTradieSpecialties(specialtiesFromProfile)
        const categoryLabels = Array.isArray(user.tradieData.specialtyCategories)
          ? user.tradieData.specialtyCategories
          : []
        setTradieSpecialtyCategories(categoryLabels)
      } else {
        if (user.bio) {
          // For non-tradie users, load bio from main user data
          setBio(user.bio || "")
        }
        setTradieSpecialties([])
        setTradieSpecialtyCategories([])
      }
      
      console.log("User data:", user)
      console.log("User tradieData:", user.tradieData)
      console.log("Loaded specialties:", user.tradieData?.specialties || user.tradieData?.specialty)
      console.log("Loaded specialty categories:", user.tradieData?.specialtyCategories)
      console.log("Loaded service areas:", profileServiceAreas)
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const result = await updateUser({
        name: fullName,
        phone,
        address: address,
        language,
        website,
        service_area: serviceArea,
        company: user?.activeRole === "tradie" ? companyName : undefined,
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      })

      if (result.success) {
        setSuccess("个人资料更新成功！")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("更新失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const serviceAreaCityLabel = useMemo(() => {
    const cities = Array.from(new Set(tradieServiceAreas.map(area => area.city).filter(Boolean)))
    return cities.join("、")
  }, [tradieServiceAreas])

  const specialtyCategoryLabel = useMemo(() => {
    const categories = Array.from(new Set(tradieSpecialtyCategories.filter(Boolean)))
    return categories.join("、")
  }, [tradieSpecialtyCategories])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isTradie = user.activeRole === "tradie"

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">编辑个人资料</h1>
            <p className="text-gray-600">更新您的账户信息</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>账户概览</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{user.name || "未设置姓名"}</h3>
                  <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                  {user.language && (
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      🌐 {user.language}
                    </p>
                  )}
                  <Badge variant={isTradie ? "default" : "secondary"}>
                    {isTradie ? "技师账户" : "房主账户"}
                  </Badge>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      账户创建于<br />
                      {new Date().toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {success && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                        {success}
                      </div>
                    )}
                    
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    {/* 基础信息 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">
                          <User className="w-4 h-4 inline mr-2" />
                          姓名 *
                        </Label>
                        <Input 
                          id="fullName" 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                          placeholder="请输入您的姓名" 
                          required 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">
                          <Phone className="w-4 h-4 inline mr-2" />
                          电话号码 *
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            placeholder="请输入电话号码" 
                            required 
                            className="flex-1"
                          />
                          {user.phone_verified ? (
                            <Badge className="bg-green-100 text-green-700 px-2 py-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已验证
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        地址 *
                      </Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        placeholder="请输入您的地址" 
                        required 
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">
                          <Globe className="w-4 h-4 inline mr-2" />
                          网站
                        </Label>
                        <Input 
                          id="website" 
                          type="url"
                          value={website} 
                          onChange={e => setWebsite(e.target.value)} 
                          placeholder="https://example.com" 
                        />
                      </div>
                      {!isTradie && (
                        <div>
                          <Label htmlFor="serviceArea">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            服务区域
                          </Label>
                          <Input 
                            id="serviceArea" 
                            value={serviceArea} 
                            onChange={e => setServiceArea(e.target.value)} 
                            placeholder="请输入您的服务区域" 
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="language">
                        <Globe className="w-4 h-4 inline mr-2" />
                        语言偏好
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言偏好" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="中文">中文</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="中/EN">中/EN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {isTradie && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>服务区域</span>
                            {serviceAreaCityLabel && (
                              <span
                                title={serviceAreaCityLabel}
                                className="ml-1 flex-1 truncate text-sm text-gray-500"
                              >
                                {serviceAreaCityLabel}
                              </span>
                            )}
                          </Label>
                          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            {tradieServiceAreas.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {tradieServiceAreas.map((area) => (
                                  <Badge
                                    key={area.id}
                                    variant="secondary"
                                    className="px-3 py-1 text-sm"
                                  >
                                    {area.area}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                暂未配置服务区域，如需更新请联系管理员
                              </p>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            此信息由平台维护，您无法直接修改
                          </p>
                        </div>

                        <div>
                          <Label className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>专业领域</span>
                            {specialtyCategoryLabel && (
                              <span
                                title={specialtyCategoryLabel}
                                className="ml-1 flex-1 truncate text-sm text-gray-500"
                              >
                                {specialtyCategoryLabel}
                              </span>
                            )}
                          </Label>
                          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            {tradieSpecialties.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {tradieSpecialties.map((specialty, index) => (
                                  <Badge
                                    key={`${specialty}-${index}`}
                                    variant="outline"
                                    className="px-3 py-1 text-sm"
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                暂未配置专业领域，如需更新请联系管理员
                              </p>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            专业领域来源于您的职业分类记录
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tradie专用信息 */}
                    {isTradie && (
                      <>
                        <hr className="my-6" />
                        <h3 className="text-lg font-semibold mb-4">技师信息</h3>
                        
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="companyName">
                              <Building className="w-4 h-4 inline mr-2" />
                              公司名称
                            </Label>
                            <Input 
                              id="companyName" 
                              value={companyName} 
                              onChange={e => setCompanyName(e.target.value)} 
                              placeholder="请输入公司名称（可选）" 
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="experienceYears">工作经验（年）</Label>
                            <Input 
                              id="experienceYears" 
                              type="number" 
                              value={experienceYears} 
                              onChange={e => setExperienceYears(e.target.value)} 
                              placeholder="0" 
                              min="0"
                              max="50"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="hourlyRate">时薪（NZD）</Label>
                            <Input 
                              id="hourlyRate" 
                              type="number" 
                              value={hourlyRate} 
                              onChange={e => setHourlyRate(e.target.value)} 
                              placeholder="0" 
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                    

                        <div>
                          <Label htmlFor="bio">个人简介</Label>
                          <Textarea 
                            id="bio" 
                            value={bio} 
                            onChange={e => setBio(e.target.value)} 
                            placeholder="简单介绍一下您的工作经验和专长..." 
                            rows={4}
                          />
                        </div>
                      </>
                    )}


                    <div className="flex items-center space-x-4 pt-6">
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700" 
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "保存中..." : "保存更改"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Portfolio Management for Tradie users */}
              {isTradie && user?.id && (
                <div className="mt-8">
                  <PortfolioManagement tradieId={user.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, User, Phone, MapPin, Building } from "lucide-react"
import Navigation from "@/components/Navigation"

const tradieSpecialties = [
  "电工", "水管工", "木工", "油漆工", "瓦工", "焊工",
  "空调维修", "屋顶维修", "园艺", "清洁服务", "搬家服务", "其他"
]

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
  
  // Tradie专用信息
  const [companyName, setCompanyName] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }
    
    if (user) {
      setFullName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.location || "")
      setCompanyName(user.company || "")
    }
  }, [user, authLoading, router])

  const handleAddSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setSpecialties([...specialties, specialty])
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const result = await updateUser({
        name: fullName,
        phone,
        location: address,
        company: user?.userType === "tradie" ? companyName : undefined,
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
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

  const isTradie = user.userType === "tradie"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
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
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          placeholder="请输入电话号码" 
                          required 
                        />
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

                    {/* Tradie专用信息 */}
                    {isTradie && (
                      <>
                        <hr className="my-6" />
                        <h3 className="text-lg font-semibold mb-4">技师信息</h3>
                        
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
                          <Label>专业技能</Label>
                          <div className="space-y-3">
                            <Select onValueChange={handleAddSpecialty}>
                              <SelectTrigger>
                                <SelectValue placeholder="选择专业技能" />
                              </SelectTrigger>
                              <SelectContent>
                                {tradieSpecialties.map(specialty => (
                                  <SelectItem key={specialty} value={specialty}>
                                    {specialty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {specialties.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {specialties.map(specialty => (
                                  <Badge 
                                    key={specialty} 
                                    variant="secondary" 
                                    className="cursor-pointer hover:bg-red-100"
                                    onClick={() => handleRemoveSpecialty(specialty)}
                                  >
                                    {specialty} ×
                                  </Badge>
                                ))}
                              </div>
                            )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
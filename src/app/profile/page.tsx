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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Save, User, Phone, MapPin, Building, CheckCircle, AlertCircle, Loader2 } from "lucide-react"


export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // 基础信息
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [address, setAddress] = useState("")
  
  // Tradie专用信息
  const [companyName, setCompanyName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [bio, setBio] = useState("")
  const [tradieCategories, setTradieCategories] = useState<string[]>([])
  
  // OTP verification states
  const [showPhoneVerificationDialog, setShowPhoneVerificationDialog] = useState(false)
  const [otpStep, setOtpStep] = useState<'input' | 'verify' | 'completed'>('input')
  const [verificationCode, setVerificationCode] = useState("")
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpError, setOtpError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }
    
    if (user) {
      setFullName(user.name || "")
      setPhone(user.phone || "")
      setPhoneVerified(user.phone_verified || false)
      setAddress(user.address || "")
      
      // Load tradie data if available
      if (user.tradieData) {
        setCompanyName(user.tradieData.company || "")
        setSpecialty(user.tradieData.specialty || "未设置专业领域")
        
        // If specialty is available, extract it as a category
        if (user.tradieData.specialty && user.tradieData.specialty !== "未设置专业领域") {
          setTradieCategories([user.tradieData.specialty])
        }
      }
      
      console.log("User data:", user)
      console.log("User tradieData:", user.tradieData)
      console.log("Loaded specialty:", user.tradieData?.specialty)
    }
  }, [user, authLoading, router])

  const fetchTradieCategories = async (tradieId: string) => {
    try {
      console.log("Fetching categories for tradie:", tradieId)
      const response = await fetch(`/api/tradies/${tradieId}/professions/`)
      console.log("API response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("API response data:", data)
        
        if (data.professions && Array.isArray(data.professions)) {
          // Get unique category names
          const categoryNames = [...new Set(
            data.professions
              .filter((p: any) => p.categories)
              .map((p: any) => p.categories.name_zh || p.categories.name_en)
          )]
          console.log("Extracted category names:", categoryNames)
          setTradieCategories(categoryNames as string[])
          
          // Update specialty display with categories
          if (categoryNames.length > 0) {
            setSpecialty(categoryNames.join(", "))
            console.log("Updated specialty:", categoryNames.join(", "))
          } else {
            console.log("No categories found, setting default message")
            setSpecialty("未设置专业领域")
          }
        } else {
          console.log("No professions data found")
          setSpecialty("未设置专业领域")
        }
      } else {
        console.error("API request failed with status:", response.status)
        setSpecialty("未设置专业领域")
      }
    } catch (error) {
      console.error("Error fetching tradie categories:", error)
      setSpecialty("未设置专业领域")
    }
  }

  // 倒计时定时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown])

  const handleAddSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setSpecialties([...specialties, specialty])
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty))
  }

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setOtpError("请输入手机号码")
      return
    }
    
    if (!user?.id) {
      setOtpError("用户信息错误")
      return
    }
    
    setIsSendingOtp(true)
    setOtpError("")
    
    // TODO: SMS verification disabled - UI only mode
    // Simulate API call for UI testing
    setTimeout(() => {
      setOtpStep('verify')
      setCountdown(60)
      setSuccess("验证码发送成功！（当前为演示模式）")
      setTimeout(() => setSuccess(""), 3000)
      setIsSendingOtp(false)
    }, 1000)
    
    /* Original SMS verification code - disabled
    try {
      const response = await fetch('/api/phone/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          userId: user.id
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setOtpStep('verify')
        setCountdown(60)
        setSuccess("验证码发送成功！")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setOtpError(result.message || "发送验证码失败")
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      setOtpError("发送验证码失败，请重试")
    } finally {
      setIsSendingOtp(false)
    }
    */
  }

  const handleVerifyOtp = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setOtpError("请输入6位验证码")
      return
    }
    
    if (!user?.id) {
      setOtpError("用户信息错误")
      return
    }
    
    setIsVerifyingOtp(true)
    setOtpError("")
    
    // TODO: SMS verification disabled - UI only mode
    // Simulate verification for UI testing
    setTimeout(() => {
      setPhoneVerified(true)
      setOtpStep('completed')
      setSuccess("手机号码验证成功！（当前为演示模式）")
      setShowPhoneVerificationDialog(false)
      setTimeout(() => setSuccess(""), 3000)
      setIsVerifyingOtp(false)
    }, 1000)
    
    /* Original SMS verification code - disabled
    try {
      const response = await fetch('/api/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          code: verificationCode,
          userId: user.id
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setPhoneVerified(true)
        setOtpStep('completed')
        setSuccess("手机号码验证成功！")
        setShowPhoneVerificationDialog(false)
        
        // Refresh user data
        await updateUser({})
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setOtpError(result.message || "验证失败")
      }
    } catch (error) {
      console.error('验证失败:', error)
      setOtpError("验证失败，请重试")
    } finally {
      setIsVerifyingOtp(false)
    }
    */
  }

  const openPhoneVerificationDialog = () => {
    setOtpStep('input')
    setVerificationCode("")
    setOtpError("")
    setShowPhoneVerificationDialog(true)
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
        address: address,
        company: user?.activeRole === "tradie" ? companyName : undefined,
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
                          {phoneVerified ? (
                            <Badge className="bg-green-100 text-green-700 px-2 py-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已验证
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={openPhoneVerificationDialog}
                              className="whitespace-nowrap"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              验证
                            </Button>
                          )}
                        </div>
                        {!phoneVerified && (
                          <p className="text-xs text-amber-600 mt-1">
                            建议验证手机号码以提高信任度
                          </p>
                        )}
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
                        
                        <div className="grid md:grid-cols-2 gap-4">
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

                          <div>
                            <Label htmlFor="specialty">专业领域</Label>
                            <Input 
                              id="specialty" 
                              value={specialty}
                              readOnly
                              className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {specialty && specialty !== "未设置专业领域"
                                ? "如需修改专业领域请联系管理员"
                                : "未设置专业领域，如需设置请联系管理员"
                              }
                            </p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verification Dialog */}
      <Dialog open={showPhoneVerificationDialog} onOpenChange={setShowPhoneVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {otpStep === 'input' ? '验证手机号码' : 
               otpStep === 'verify' ? '输入验证码' : '验证完成'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: Input Phone Number */}
            {otpStep === 'input' && (
              <>
                <div>
                  <Label htmlFor="verification-phone">手机号码</Label>
                  <Input
                    id="verification-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号码 (如: +8613800138000)"
                    disabled={isSendingOtp}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    我们将发送验证码到此号码进行验证
                  </p>
                </div>
                
                {otpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{otpError}</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSendOtp}
                    disabled={!phone.trim() || isSendingOtp}
                    className="flex-1"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    发送验证码
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPhoneVerificationDialog(false)
                      setOtpError("")
                    }}
                  >
                    取消
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Verify Code */}
            {otpStep === 'verify' && (
              <>
                <div>
                  <Label htmlFor="verification-code">验证码</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 6) {
                        setVerificationCode(value)
                        setOtpError("")
                      }
                    }}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    disabled={isVerifyingOtp}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      验证码已发送到 {phone.replace(/(.*\d{4})\d{4}(\d{4})/, '$1****$2')}
                    </p>
                    {countdown > 0 ? (
                      <p className="text-sm text-gray-500">
                        {countdown}秒后可重新发送
                      </p>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="p-0 h-auto text-sm"
                      >
                        重新发送
                      </Button>
                    )}
                  </div>
                </div>
                
                {otpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{otpError}</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verificationCode.length !== 6 || isVerifyingOtp}
                    className="flex-1"
                  >
                    {isVerifyingOtp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    验证
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOtpStep('input')
                      setVerificationCode("")
                      setOtpError("")
                    }}
                  >
                    返回
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
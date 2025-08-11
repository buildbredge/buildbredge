"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  Loader2,
  User
} from "lucide-react"
import { authService } from "@/lib/services/authService"

interface Category {
  id: string
  name_en: string
  name_zh: string
  description?: string
}

interface TradieProfileCompletionProps {
  userProfile: {
    id?: string
    name?: string
    phone?: string
    phone_verified?: boolean
    address?: string
    tradieData?: {
      company?: string
      specialty?: string
    }
    roles?: Array<{
      role_type: string
    }>
  }
  emailVerified: boolean
  onProfileUpdate?: () => void
}

interface CompletionStep {
  id: string
  title: string
  description: string
  completed: boolean
  critical: boolean
  icon: React.ReactNode
  action?: () => void
}

export function TradieProfileCompletion({ 
  userProfile, 
  emailVerified, 
  onProfileUpdate 
}: TradieProfileCompletionProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phone || "")
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  
  // OTP verification state
  const [otpStep, setOtpStep] = useState<'input' | 'verify' | 'completed'>('input')
  const [verificationCode, setVerificationCode] = useState("")
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpError, setOtpError] = useState("")
  
  // 本地状态跟踪更新
  const [localPhoneVerified, setLocalPhoneVerified] = useState(false)
  const [localCategoryUpdated, setLocalCategoryUpdated] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState("")

  const isTradie = userProfile.roles?.some(role => role.role_type === 'tradie')
  
  // 主要依赖数据库数据，本地状态只在更新过程中临时使用
  const phoneVerified = !!(userProfile.phone_verified) || localPhoneVerified
  const categorySelected = !!(userProfile.tradieData?.specialty) || localCategoryUpdated
  
  // 如果数据库中已有数据，清除本地状态标记（避免重复计算）
  useEffect(() => {
    if (userProfile.phone_verified && localPhoneVerified) {
      setLocalPhoneVerified(false)
    }
    if (userProfile.tradieData?.specialty && localCategoryUpdated) {
      setLocalCategoryUpdated(false)
    }
  }, [userProfile.phone_verified, userProfile.tradieData?.specialty])
  
  const completionSteps: CompletionStep[] = [
    {
      id: "phone",
      title: "验证手机号码",
      description: "添加并验证您的手机号码，方便客户联系",
      completed: phoneVerified,
      critical: true,
      icon: <Phone className="w-4 h-4" />,
      action: () => {
        setOtpStep('input')
        setVerificationCode("")
        setOtpError("")
        setShowPhoneDialog(true)
      }
    },
    {
      id: "category",
      title: "选择工作类别",
      description: "选择您的专业服务类别，让客户更容易找到您",
      completed: categorySelected,
      critical: true,
      icon: <Briefcase className="w-4 h-4" />,
      action: () => setShowCategoryDialog(true)
    }
  ]

  const incompleteSteps = completionSteps.filter(step => !step.completed)
  const completionPercentage = Math.round(((completionSteps.length - incompleteSteps.length) / completionSteps.length) * 100)

  useEffect(() => {
    fetchCategories()
  }, [])

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

  // 注释：已经在上面处理了本地状态的清理

  const getAuthToken = async () => {
    const session = await authService.getCurrentSession()
    return session?.session?.access_token
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setCategories(result.data)
        }
      }
    } catch (error) {
      console.error('获取类别失败:', error)
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setOtpError("请输入手机号码")
      return
    }
    
    if (!userProfile.id) {
      setOtpError("用户信息错误")
      return
    }
    
    setIsSendingOtp(true)
    setOtpError("")
    
    // Show development message and directly verify the phone
    setTimeout(async () => {
      setShowSuccessMessage("短信验证功能正在开发中，系统已自动完成验证！")
      
      // Update phone number in database and mark as verified
      try {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify({
            name: userProfile.name || "",
            phone: phoneNumber,
            phone_verified: true,
            address: userProfile.address || "",
            company: userProfile.tradieData?.company,
            specialty: userProfile.tradieData?.specialty
          })
        })
        
        if (response.ok) {
          setLocalPhoneVerified(true)
          setShowPhoneDialog(false)
          onProfileUpdate?.()
        } else {
          setOtpError("更新手机号码失败，请重试")
        }
      } catch (error) {
        console.error('更新手机号码失败:', error)
        setOtpError("更新手机号码失败，请重试")
      }
      
      setTimeout(() => setShowSuccessMessage(""), 5000)
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
          phone: phoneNumber,
          userId: userProfile.id
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setOtpStep('verify')
        setCountdown(60) // 60秒倒计时
        setShowSuccessMessage("验证码发送成功！")
        setTimeout(() => setShowSuccessMessage(""), 3000)
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
    // This function is no longer needed since we directly verify upon sending
    // Kept for UI compatibility but should not be called
    console.log("handleVerifyOtp called - this should not happen with the new flow")
  }

  const handleCategoryUpdate = async () => {
    if (!selectedCategory) return
    
    console.log('Frontend - Starting category update for category:', selectedCategory)
    
    setIsUpdatingCategory(true)
    try {
      const category = categories.find(c => c.id === selectedCategory)
      if (!category) {
        console.log('Frontend - Category not found')
        return
      }

      console.log('Frontend - Selected category:', category)

      const requestData = {
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
        role: 'tradie',
        company: userProfile.tradieData?.company,
        specialty: category.name_zh
      }
      
      console.log('Frontend - Sending request with data:', requestData)

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('Frontend - API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Frontend - API response:', result)
        
        if (result.success) {
          console.log('Frontend - PUT API debug info:', result.debug)
          setLocalCategoryUpdated(true)
          setShowSuccessMessage("工作类别更新成功！")
          setShowCategoryDialog(false)
          onProfileUpdate?.()
          
          // 3秒后隐藏成功消息
          setTimeout(() => setShowSuccessMessage(""), 3000)
        } else {
          console.log('Frontend - API returned success: false')
        }
      } else {
        const errorResult = await response.json()
        console.log('Frontend - API error response:', errorResult)
      }
    } catch (error) {
      console.error('更新服务类别失败:', error)
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  // 如果不是技师角色，不显示
  if (!isTradie) {
    return null
  }

  // 如果用户资料还在加载中，显示加载状态
  if (!userProfile.id) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            <p className="text-gray-600">正在加载资料完成状态...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 如果所有步骤都完成了，显示一个简洁的完成状态
  if (incompleteSteps.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">资料完善完成！</h3>
              <p className="text-sm text-green-700">
                您的技师资料已经完善，现在可以接收更多项目机会了
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700">
              100% 完成
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            完善您的技师资料
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700">
            {completionPercentage}% 完成
          </Badge>
        </div>
        <p className="text-sm text-orange-700">
          完善资料可以让您获得更多项目机会，提升客户信任度
        </p>
        {showSuccessMessage && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {showSuccessMessage}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {incompleteSteps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-orange-300 flex items-center justify-center">
                    {step.critical ? (
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                    ) : (
                      step.icon
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  {step.critical && (
                    <Badge variant="destructive" className="text-xs">
                      必填
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
            {!step.completed && step.action && (
              <Button
                size="sm"
                className="ml-3 bg-orange-600 hover:bg-orange-700"
                onClick={step.action}
              >
                完成
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      {/* Phone Number OTP Verification Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
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
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    disabled={!phoneNumber.trim() || isSendingOtp}
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
                      setShowPhoneDialog(false)
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
                      验证码已发送到 {phoneNumber.replace(/(.*\d{4})\d{4}(\d{4})/, '$1****$2')}
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

      {/* Category Selection Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择工作类别</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">服务类别</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择您的专业服务类别" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div>
                        <div className="font-medium">{category.name_zh}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCategoryUpdate}
                disabled={!selectedCategory || isUpdatingCategory}
                className="flex-1"
              >
                {isUpdatingCategory ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                保存类别选择
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
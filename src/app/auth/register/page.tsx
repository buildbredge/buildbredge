"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailVerificationDialog } from "@/components/ui/email-verification-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [userType, setUserType] = useState<"homeowner" | "tradie" | "">("")
  const [location, setLocation] = useState("")
  const [googlePlace, setGooglePlace] = useState<PlaceResult | undefined>(undefined)
  const [companyName, setCompanyName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [language, setLanguage] = useState("中/EN")
  const [categories, setCategories] = useState<Array<{id: string, name_en: string, name_zh: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)

  const { register } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Fetch categories when user selects tradie type
    if (userType === 'tradie') {
      fetchCategories()
    }
  }, [userType])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const response = await fetch('/api/categories')
      const result = await response.json()
      console.log('Categories API response:', result)
      
      if (response.ok && result.success && Array.isArray(result.data)) {
        console.log('Setting categories:', result.data)
        setCategories(result.data)
      } else {
        console.error('Failed to fetch categories:', result.error || 'Unknown error')
        setError('无法加载专业领域选项，请刷新页面重试')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('加载专业领域失败，请检查网络连接')
    }
  }

  // 处理Google Places地址选择
  const handlePlaceSelect = (place: PlaceResult) => {
    setGooglePlace(place)
    setLocation(place.address) // 同时更新location字段以保持兼容性
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!userType) {
      setError("请选择用户类型")
      return
    }

    if (userType === 'tradie' && !selectedCategory) {
      setError("请选择您的专业领域")
      return
    }
    
    if (password !== confirmPassword) {
      setError("密码不匹配")
      return
    }
    
    if (password.length < 6) {
      setError("密码至少需要6个字符")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await register({
        name: fullName,
        email,
        password,
        phone,
        userType: userType as "homeowner" | "tradie",
        location,
        language,
        company: userType === "tradie" ? companyName : undefined,
        categoryId: userType === "tradie" ? selectedCategory : undefined
      })
      
      if (result.success) {
        // 检查消息中是否包含"现有用户"来判断是否为新用户
        setIsNewUser(!result.message.includes('现有用户'))
        setShowVerificationDialog(true)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("注册失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <EmailVerificationDialog
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        email={email}
        userType={userType as 'homeowner' | 'tradie'}
        isNewUser={isNewUser}
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center mb-2">
            <h2 className="text-2xl font-bold text-green-700 mb-1">注册</h2>
            <p className="text-sm text-gray-500">创建新BuildBridge账户</p>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <Label htmlFor="userType">用户类型 *</Label>
              <Select onValueChange={(value) => setUserType(value as "homeowner" | "tradie")}>
                <SelectTrigger>
                  <SelectValue placeholder="选择用户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">房主/业主</SelectItem>
                  <SelectItem value="tradie">技工/服务商</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fullName">姓名 *</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="请输入姓名" 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="email">邮箱地址 *</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="请输入邮箱" 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="phone">电话号码 *</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="请输入电话号码" 
                required 
              />
            </div>

            <div>
              <Label htmlFor="language">语言偏好</Label>
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
            
            <div>
              <Label htmlFor="location">地址 *</Label>
              <div className="mt-2">
                {!googlePlace ? (
                  <GooglePlacesAutocomplete
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="请输入您的地址..."
                    label=""
                    className="h-10"
                  />
                ) : (
                  <SelectedAddressDisplay
                    place={googlePlace}
                    onEdit={() => {
                      setGooglePlace(undefined)
                      setLocation("")
                    }}
                  />
                )}
              </div>
            </div>
            
            {userType === "tradie" && (
              <>
                <div>
                  <Label htmlFor="companyName">公司名称</Label>
                  <Input 
                    id="companyName" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    placeholder="请输入公司名称（可选）" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">专业领域 *</Label>
                  <Select onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        categories.length === 0 
                          ? "加载专业领域中..." 
                          : "选择您的专业领域"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          加载中...
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name_zh || category.name_en}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {categories.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已加载 {categories.length} 个专业领域
                    </p>
                  )}
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="password">密码 *</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="请输入密码（至少6个字符）" 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="请再次输入密码" 
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isLoading}
            >
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-green-700 hover:underline text-sm">
              已有账户？登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}

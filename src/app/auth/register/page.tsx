"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailVerificationDialog } from "@/components/ui/email-verification-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [userType, setUserType] = useState<"homeowner" | "tradie" | "">("")
  const [location, setLocation] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!userType) {
      setError("请选择用户类型")
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
        company: userType === "tradie" ? companyName : undefined
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
              <Label htmlFor="location">地址 *</Label>
              <Input 
                id="location" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="请输入地址" 
                required 
              />
            </div>
            
            {userType === "tradie" && (
              <div>
                <Label htmlFor="companyName">公司名称</Label>
                <Input 
                  id="companyName" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)} 
                  placeholder="请输入公司名称（可选）" 
                />
              </div>
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

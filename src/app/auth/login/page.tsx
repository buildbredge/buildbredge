"use client"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const { login, user, sendEmailVerification } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
    }
    
    // 预填邮箱地址
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    
    if (!email || !password) {
      setError("请填写所有必填字段")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        // 登录成功后直接跳转到dashboard
        router.push('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("请先输入邮箱地址")
      return
    }

    setIsResending(true)
    setError("")
    
    try {
      const result = await sendEmailVerification(email)
      if (result.success) {
        setSuccessMessage(result.message)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("发送验证邮件失败，请重试")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center mb-2">
          <h2 className="text-2xl font-bold text-green-700 mb-1">登录</h2>
          <p className="text-sm text-gray-500">登录您的BuildBridge账户</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
                {error.includes('邮箱尚未验证') && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="text-xs"
                    >
                      {isResending ? "发送中..." : "重新发送验证邮件"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label htmlFor="email">邮箱地址</Label>
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
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="请输入密码" 
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Link href="/auth/register" className="text-green-700 hover:underline text-sm block">
              还没有账户？注册
            </Link>
            <Link href="#" className="text-gray-500 hover:underline text-sm block">
              忘记密码？
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

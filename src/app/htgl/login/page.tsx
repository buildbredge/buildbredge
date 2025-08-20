"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, User, Building, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '登录失败')
        setIsLoading(false)
        return
      }

      // 管理员登录成功，设置cookies并跳转到管理面板
      const adminUser = {
        id: result.data.admin.id,
        email: result.data.admin.email,
        name: result.data.admin.name,
        role: 'admin'
      }
      
      // 设置cookies（注意：这里只是客户端设置，应该配合服务器端API）
      document.cookie = `adminToken=${result.data.user.id}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`
      document.cookie = `adminUser=${JSON.stringify(adminUser)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`
      
      // 同时保存到localStorage作为备份
      localStorage.setItem('adminToken', result.data.user.id || '')
      localStorage.setItem('adminUser', JSON.stringify(adminUser))
      
      router.push("/htgl")
    } catch (error) {
      console.error('登录错误:', error)
      setError("登录过程中出现错误，请稍后重试")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BuildBridge</h1>
                <p className="text-green-200 text-sm">管理员后台</p>
              </div>
            </div>
          </div>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">管理员登录</CardTitle>
              <CardDescription className="text-gray-300">
                请输入您的管理员凭据以访问后台系统
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-700 bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    <User className="w-4 h-4 inline mr-2" />
                    管理员邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@buildbridge.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">
                    <Lock className="w-4 h-4 inline mr-2" />
                    密码
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登录中...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      管理员登录
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  如需管理员权限，请联系系统管理员
                </p>
                <Link 
                  href="/" 
                  className="text-green-400 hover:text-green-300 text-sm underline"
                >
                  返回主页
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              <Shield className="w-3 h-3 inline mr-1" />
              安全连接 • 数据加密传输
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
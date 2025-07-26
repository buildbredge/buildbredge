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

    console.log('管理员登录尝试:', formData)

    // 简单的登录验证
    if (formData.email === "admin@buildbridge.nz" && formData.password === "buildbridge2025") {
      try {
        // 存储管理员会话
        const adminSession = {
          id: "admin1",
          email: "admin@buildbridge.nz",
          name: "系统管理员",
          role: "super_admin"
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', 'admin_token_' + Date.now())
          localStorage.setItem('adminUser', JSON.stringify(adminSession))

          console.log('登录成功，跳转到仪表板')
          router.push("/admin/dashboard")
        }
      } catch (error) {
        console.error('登录错误:', error)
        setError("登录过程中出现错误")
      }
    } else {
      setError("邮箱或密码错误")
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-white">管理员登录</CardTitle>
              <CardDescription className="text-gray-300">
                请使用管理员账户登录后台系统
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-200">邮箱地址</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@buildbridge.nz"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-gray-200">密码</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "登录中..." : "登录后台"}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-200 text-sm font-medium mb-2">演示账户信息：</p>
                <div className="text-blue-100 text-xs space-y-1">
                  <p>邮箱：admin@buildbridge.nz</p>
                  <p>密码：buildbridge2025</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <Link href="/" className="text-green-400 hover:text-green-300 text-sm">
                  ← 返回主站
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

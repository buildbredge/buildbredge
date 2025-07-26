"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyEmailContent() {
  const { verifyEmail, sendEmailVerification } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [verified, setVerified] = useState(false)

  const token = searchParams?.get('token')
  const email = searchParams?.get('email')

  useEffect(() => {
    const verifyToken = async (verificationToken: string) => {
      setIsLoading(true)
      setMessage({ type: "", text: "" })

      const result = await verifyEmail(verificationToken)

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setVerified(true)
      } else {
        setMessage({ type: "error", text: result.message })
      }

      setIsLoading(false)
    }

    if (token && email) {
      verifyToken(token)
    }
  }, [token, email, verifyEmail])

  const handleVerifyEmail = async (verificationToken: string) => {
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    const result = await verifyEmail(verificationToken)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setVerified(true)
    } else {
      setMessage({ type: "error", text: result.message })
    }

    setIsLoading(false)
  }

  const handleResendVerification = async () => {
    if (!email) {
      setMessage({ type: "error", text: "邮箱地址缺失" })
      return
    }

    setIsResending(true)
    setMessage({ type: "", text: "" })

    const result = await sendEmailVerification(email)

    setMessage({
      type: result.success ? "success" : "error",
      text: result.message
    })

    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">BuildBridge</h1>
          </div>
          <p className="text-gray-600">邮箱地址验证</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : verified ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Mail className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle>
              {isLoading ? "验证中..." : verified ? "验证成功！" : "邮箱验证"}
            </CardTitle>
            <CardDescription>
              {isLoading ? (
                "正在验证您的邮箱地址，请稍候..."
              ) : verified ? (
                "您的邮箱地址已成功验证，现在可以使用所有功能。"
              ) : (
                "点击验证链接来激活您的账户"
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ?
                    <CheckCircle className="w-5 h-5" /> :
                    <AlertCircle className="w-5 h-5" />
                  }
                  <span className="text-sm">{message.text}</span>
                </div>
              </div>
            )}

            {/* Verification Status */}
            {token && email && (
              <div className="text-center space-y-4">
                {verified ? (
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-800">
                      ✓ 邮箱已验证
                    </Badge>
                    <div className="space-y-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <Link href="/auth">
                          立即登录
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/">
                          返回首页
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  !isLoading && message.type === 'error' && (
                    <div className="space-y-4">
                      <Badge variant="secondary">
                        验证失败
                      </Badge>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>验证链接可能已失效或使用过。</p>
                        <p>您可以重新发送验证邮件：</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            发送中...
                          </>
                        ) : (
                          "重新发送验证邮件"
                        )}
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* No token/email case */}
            {(!token || !email) && (
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>请从您的邮箱中点击验证链接来访问此页面。</p>
                  <p>如果您没有收到验证邮件，请检查垃圾邮件文件夹。</p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth">
                      去登录页面
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">
                      返回首页
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Help Information */}
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 验证邮件可能需要几分钟才能到达</p>
                <p>• 请检查您的垃圾邮件文件夹</p>
                <p>• 验证链接24小时内有效</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            需要帮助？请联系
            <a href="mailto:support@buildbridge.nz" className="text-green-600 hover:underline ml-1">
              客服支持
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

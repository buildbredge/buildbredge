"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface EmailVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  email: string
  userType: 'homeowner' | 'tradie'
  isNewUser?: boolean
  isSubordinateTradie?: boolean
}

export function EmailVerificationDialog({
  isOpen,
  onClose,
  email,
  userType,
  isNewUser = true,
  isSubordinateTradie = false
}: EmailVerificationDialogProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const { sendEmailVerification } = useAuth()

  if (!isOpen) return null

  const roleText = userType === 'homeowner' ? '业主' : '技师/服务商'

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage("")
    
    try {
      const result = await sendEmailVerification(email)
      if (result.success) {
        setResendMessage("验证邮件已重新发送！")
      } else {
        setResendMessage("发送失败，请稍后重试")
      }
    } catch (err) {
      setResendMessage("发送失败，请稍后重试")
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    onClose()
    // 使用router.push替代window.location.href以获得更好的用户体验
    setTimeout(() => {
      window.location.href = `/auth/login?email=${encodeURIComponent(email)}`
    }, 100)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-green-700">
            {isSubordinateTradie ? '添加技师成功！' : isNewUser ? '注册成功！' : '角色添加成功！'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-gray-700">
              {isSubordinateTradie ? (
                <>恭喜您成功添加了新的<span className="font-semibold text-green-600">{roleText}</span>团队成员！</>
              ) : (
                <>恭喜您成功{isNewUser ? '注册' : '添加'}了<span className="font-semibold text-green-600">{roleText}</span>账户！</>
              )}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-800 mb-1">📧 邮箱验证必需</p>
                  <p className="text-blue-700 mb-2">
                    我们已向 <span className="font-semibold">{email}</span> 发送了验证邮件
                  </p>
                  <p className="text-blue-600 text-xs">
                    ⚠️ 请检查您的邮箱（包括垃圾邮件夹），点击验证链接后才能正常登录
                  </p>
                </div>
              </div>
            </div>

            {resendMessage && (
              <div className={`p-3 rounded-md text-sm ${
                resendMessage.includes('成功') 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {resendMessage}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!isSubordinateTradie && (
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                前往登录页面 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isResending ? "发送中..." : "重新发送验证邮件"}
            </Button>

            {isSubordinateTradie && (
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                完成
              </Button>
            )}
            
            <div className="flex justify-center space-x-4">
              <Link 
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                onClick={onClose}
              >
                返回首页
              </Link>
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                关闭
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 温馨提示：</p>
            <p>• 验证邮件可能需要几分钟到达</p>
            <p>• 请检查垃圾邮件文件夹</p>
            <p>• 验证链接24小时内有效</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
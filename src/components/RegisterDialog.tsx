"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, UserPlus, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface RegisterDialogProps {
  open: boolean
  onClose: () => void
  email: string
  onSuccess: (userId: string) => void
  onError: (error: string) => void
}

interface RegisterForm {
  name: string
  password: string
  confirmPassword: string
  phone: string
  userType: 'homeowner' | 'tradie'
  location: string
  company?: string
}

export function RegisterDialog({ 
  open, 
  onClose, 
  email, 
  onSuccess, 
  onError 
}: RegisterDialogProps) {
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: 'homeowner',
    location: "",
    company: ""
  })

  const updateForm = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formError) setFormError("")
  }

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "请输入姓名"
    if (!form.password) return "请输入密码"
    if (form.password.length < 6) return "密码至少需要6个字符"
    if (form.password !== form.confirmPassword) return "两次输入的密码不一致"
    if (!form.phone.trim()) return "请输入电话号码"
    if (!form.location.trim()) return "请输入地址"
    if (form.userType === 'tradie' && !form.company?.trim()) return "技师账户需要填写公司名称"
    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      setFormError(error)
      return
    }

    setIsLoading(true)
    setFormError("")

    try {
      const result = await register({
        name: form.name,
        email,
        password: form.password,
        phone: form.phone,
        userType: form.userType,
        location: form.location,
        company: form.company || undefined
      })

      if (result.success) {
        // 注册成功，需要获取新创建的用户ID
        // 这里我们可以通过再次查询来获取用户ID
        onSuccess(`temp_user_${Date.now()}`) // 临时方案，实际应该从注册结果获取
      } else {
        setFormError(result.message)
      }
    } catch (error) {
      setFormError("注册失败，请重试")
      onError(error instanceof Error ? error.message : "注册失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setForm({
        name: "",
        password: "",
        confirmPassword: "",
        phone: "",
        userType: 'homeowner',
        location: "",
        company: ""
      })
      setFormError("")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-6 h-6 text-green-600" />
              <DialogTitle>创建账户</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            填写信息创建您的账户，注册后可以更好地管理需求
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {formError && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{formError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="register-name">姓名 *</Label>
              <Input
                id="register-name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="请输入您的姓名"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="register-email">邮箱地址</Label>
              <Input
                id="register-email"
                value={email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="register-password">密码 *</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="至少6个字符"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="register-confirm-password">确认密码 *</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                  placeholder="再次输入密码"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="register-phone">电话号码 *</Label>
              <Input
                id="register-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="+64 21 123 4567"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>账户类型 *</Label>
              <RadioGroup 
                value={form.userType} 
                onValueChange={(value) => updateForm('userType', value)}
                className="flex space-x-6 mt-2"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="homeowner" id="homeowner" />
                  <Label htmlFor="homeowner">房主（发布需求）</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tradie" id="tradie" />
                  <Label htmlFor="tradie">技师（提供服务）</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="register-location">地址 *</Label>
              <Input
                id="register-location"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="请输入您的地址"
                disabled={isLoading}
              />
            </div>

            {form.userType === 'tradie' && (
              <div>
                <Label htmlFor="register-company">公司名称 *</Label>
                <Input
                  id="register-company"
                  value={form.company || ""}
                  onChange={(e) => updateForm('company', e.target.value)}
                  placeholder="请输入公司名称"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>注册中...</span>
                </div>
              ) : (
                "创建账户"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
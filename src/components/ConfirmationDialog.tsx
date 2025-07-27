"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail, UserPlus, User } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  type: 'email-exists' | 'register-prompt'
  email: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmationDialog({ 
  open, 
  onClose, 
  type, 
  email, 
  onConfirm, 
  onCancel,
  isLoading = false 
}: ConfirmationDialogProps) {
  const configs = {
    'email-exists': {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "邮箱已存在",
      description: `邮箱 ${email} 已经注册过了。您可以选择登录使用已有账户，或者以匿名方式发布需求。`,
      confirmText: "去登录",
      cancelText: "匿名发布",
      confirmVariant: "default" as const,
      cancelVariant: "outline" as const
    },
    'register-prompt': {
      icon: <UserPlus className="w-6 h-6 text-green-600" />,
      title: "创建账户",
      description: `邮箱 ${email} 还未注册。创建账户可以更好地管理您的需求和获得专属服务。`,
      confirmText: "立即注册",
      cancelText: "匿名发布",
      confirmVariant: "default" as const,
      cancelVariant: "outline" as const
    }
  }

  const config = configs[type]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 mt-6">
          <Button
            variant={config.cancelVariant}
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {config.cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>处理中...</span>
              </div>
            ) : (
              config.confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
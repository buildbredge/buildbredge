"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface QuoteSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  onQuoteSubmitted?: () => void
}

export function QuoteSubmissionModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onQuoteSubmitted
}: QuoteSubmissionModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // 表单状态
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setPrice("")
    setDescription("")
    setError("")
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = () => {
    if (!price.trim()) {
      setError("请输入报价金额")
      return false
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("请输入有效的报价金额")
      return false
    }

    if (!description.trim()) {
      setError("请输入报价说明")
      return false
    }

    if (description.trim().length < 10) {
      setError("报价说明至少需要10个字符")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user?.id) {
      setError("请先登录")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradie_id: user.id,
          price: parseFloat(price),
          description: description.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '提交报价失败')
      }

      setSuccess(true)
      onQuoteSubmitted?.()
      
      // 3秒后自动关闭
      setTimeout(() => {
        handleClose()
      }, 3000)

    } catch (err: any) {
      console.error('Quote submission error:', err)
      setError(err.message || '提交报价失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            提交报价
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {success ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-800 mb-2">报价提交成功！</h3>
                <p className="text-green-700 text-sm mb-4">
                  您的报价已发送给项目拥有者，请等待回复。
                </p>
                <p className="text-xs text-green-600">
                  此窗口将自动关闭...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">项目：{projectTitle}</CardTitle>
              <p className="text-sm text-gray-600">
                请填写您的报价信息，项目拥有者将收到邮件通知。
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="price" className="flex items-center mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    报价金额 (NZD) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    请输入您对这个项目的报价
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    报价说明 *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="请详细说明您的服务内容、工期安排、材料使用等..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    required
                    disabled={isSubmitting}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    详细的说明有助于获得客户信任（至少10个字符）
                  </p>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        提交报价
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
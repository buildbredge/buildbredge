"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowLeft, Upload, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const STATUS_LABELS: Record<string, string> = {
  not_submitted: "待提交",
  pending: "审核中",
  approved: "已通过",
  rejected: "需重新提交"
}

const STATUS_CLASSES: Record<string, string> = {
  not_submitted: "bg-orange-100 text-orange-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600"
}

export default function PersonalCertificationPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [addressProof, setAddressProof] = useState<File | null>(null)
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)
  const [smsNote, setSmsNote] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const addressInputRef = useRef<HTMLInputElement | null>(null)
  const idFrontInputRef = useRef<HTMLInputElement | null>(null)
  const idBackInputRef = useRef<HTMLInputElement | null>(null)

  const certificationStatus = useMemo(() => {
    const status = user?.certifications?.personal?.status
    if (!status) return "not_submitted"
    return status
  }, [user?.certifications?.personal?.status])

  const handleFileChange = (
    setter: (file: File | null) => void,
    file?: File
  ) => {
    if (file) {
      setter(file)
    } else {
      setter(null)
    }
  }

  const resetInput = (ref: React.MutableRefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      ref.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user?.id) {
      setError("请先登录后再提交认证")
      return
    }

    if (!addressProof || !idFront || !idBack) {
      setError("请上传所有必需的认证文件")
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError("登录状态已过期，请重新登录后再试")
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("type", "personal")
      formData.append("addressProof", addressProof)
      formData.append("idFront", idFront)
      formData.append("idBack", idBack)

      if (smsNote.trim()) {
        formData.append("smsNote", smsNote.trim())
      }

      if (notes.trim()) {
        formData.append("notes", notes.trim())
      }

      const response = await fetch("/api/tradies/certifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "提交失败，请稍后再试")
      }

      setSuccess("认证资料已提交，我们将在 1-2 个工作日内完成审核。")
      setError(null)
      handleFileChange(setAddressProof, undefined)
      handleFileChange(setIdFront, undefined)
      handleFileChange(setIdBack, undefined)
      resetInput(addressInputRef)
      resetInput(idFrontInputRef)
      resetInput(idBackInputRef)
    } catch (err) {
      const message = err instanceof Error ? err.message : "提交失败，请稍后再试"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回工作台
          </Button>
          <Badge className={STATUS_CLASSES[certificationStatus] || STATUS_CLASSES.not_submitted}>
            {STATUS_LABELS[certificationStatus] || STATUS_LABELS.not_submitted}
          </Badge>
        </div>

        <div className="space-y-6">
          <Card className="border-green-200 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">个人信息认证</CardTitle>
              <p className="text-sm text-gray-600">
                根据平台要求完成手机号验证、地址证明和身份文件上传，以便我们确认您的真实身份。所有文件仅用于审核，不会向客户公开。
              </p>
            </CardHeader>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">认证要求说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>支持的文件格式：PDF、JPG、PNG，单个文件不超过 5MB。</p>
              </div>
              <ul className="list-disc space-y-2 pl-6">
                <li>手机号验证：按提示发送包含注册邮箱的短信至平台指定号码。</li>
                <li>地址证明：上传近三个月内的账单或政府机构信函（银行、电力、电信、水费等）。</li>
                <li>身份证明：提供驾照、护照或身份证正反面的清晰照片，暂不接受学习驾照或限制驾照。</li>
              </ul>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">手机号验证</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  请使用注册时的手机发送短信，内容包含您的注册邮箱到 <strong>021 686 237</strong>。我们会在 1 个工作日内完成核对。
                </p>
                <Textarea
                  rows={3}
                  placeholder="可在此记录您发送短信的时间或补充备注（可选）"
                  className="resize-none"
                  value={smsNote}
                  onChange={(event) => setSmsNote(event.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">地址证明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="address-file">上传地址证明文件</Label>
                <Input
                  id="address-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-2"
                  ref={addressInputRef}
                  onChange={(event) => handleFileChange(setAddressProof, event.target.files?.[0])}
                  required
                />
                {addressProof && (
                  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <span className="truncate pr-4">{addressProof.name}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => {
                        handleFileChange(setAddressProof, undefined)
                        resetInput(addressInputRef)
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">上传 3 个月内的账单或政府机构信函，确保信息清晰可读。</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">身份证明</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="id-front">证件正面</Label>
                  <Input
                    id="id-front"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={idFrontInputRef}
                    onChange={(event) => handleFileChange(setIdFront, event.target.files?.[0])}
                    required
                  />
                  {idFront && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{idFront.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setIdFront, undefined)
                          resetInput(idFrontInputRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">请确保姓名、出生日期、证件号清晰可见。</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="id-back">证件背面</Label>
                  <Input
                    id="id-back"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={idBackInputRef}
                    onChange={(event) => handleFileChange(setIdBack, event.target.files?.[0])}
                    required
                  />
                  {idBack && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{idBack.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setIdBack, undefined)
                          resetInput(idBackInputRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">若证件背面为空，可重复上传正面文件。</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">补充说明（可选）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  <Upload className="mt-1 h-4 w-4 text-gray-500" />
                  <p>如需补充额外说明，请在此填写，例如联系方式更新、特殊备注等。</p>
                </div>
                <Textarea
                  rows={3}
                  className="resize-none"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="可选：补充说明审核人员需要注意的情况"
                />
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">提交后预计 1-2 个工作日完成人工审核。</p>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "提交中..." : "提交认证资料"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

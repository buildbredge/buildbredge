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

export default function ProfessionalCertificationPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [qualificationFile, setQualificationFile] = useState<File | null>(null)
  const [trainingFile, setTrainingFile] = useState<File | null>(null)
  const [experienceFile, setExperienceFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [businessNumber, setBusinessNumber] = useState("")
  const [extraNotes, setExtraNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const qualificationRef = useRef<HTMLInputElement | null>(null)
  const trainingRef = useRef<HTMLInputElement | null>(null)
  const experienceRef = useRef<HTMLInputElement | null>(null)
  const insuranceRef = useRef<HTMLInputElement | null>(null)

  const certificationStatus = useMemo(() => {
    const status = user?.certifications?.professional?.status
    if (!status) return "not_submitted"
    return status
  }, [user?.certifications?.professional?.status])

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

    if (!qualificationFile || !trainingFile || !experienceFile || !insuranceFile) {
      setError("请上传所有必需的资质文件")
      return
    }

    if (!businessNumber.trim()) {
      setError("请填写公司注册编号")
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
      formData.append("type", "professional")
      formData.append("qualification", qualificationFile)
      formData.append("training", trainingFile)
      formData.append("experience", experienceFile)
      formData.append("insurance", insuranceFile)
      formData.append("businessNumber", businessNumber.trim())

      if (extraNotes.trim()) {
        formData.append("extraNotes", extraNotes.trim())
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

      setSuccess("资质材料已提交，我们将在 1-3 个工作日内完成审核。")
      setError(null)
      handleFileChange(setQualificationFile, undefined)
      handleFileChange(setTrainingFile, undefined)
      handleFileChange(setExperienceFile, undefined)
      handleFileChange(setInsuranceFile, undefined)
      resetInput(qualificationRef)
      resetInput(trainingRef)
      resetInput(experienceRef)
      resetInput(insuranceRef)
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
          <Card className="border-blue-200 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">专业资质认证</CardTitle>
              <p className="text-sm text-gray-600">
                上传您的专业资质证明、培训记录、保险和公司注册信息，以便客户更快建立信任。
              </p>
            </CardHeader>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">认证要求说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-blue-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>支持的文件格式：PDF、JPG、PNG，单个文件不超过 5MB。</p>
              </div>
              <ul className="list-disc space-y-2 pl-6">
                <li>资质证书：上传能够证明您专业能力的证书。</li>
                <li>培训证明：提供近期完成的培训课程或技能提升记录。</li>
                <li>工作经验证明：可由雇主/业主出具推荐信或项目完工证明。</li>
                <li>保险证明：上传有效期内的公众责任险或相关保险。</li>
                <li>公司注册编号：填写公司注册号（如 NZBN、IRD）。</li>
              </ul>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">资质与培训文件</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="qualification-file">资质证书</Label>
                  <Input
                    id="qualification-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={qualificationRef}
                    onChange={(event) => handleFileChange(setQualificationFile, event.target.files?.[0])}
                    required
                  />
                  {qualificationFile && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{qualificationFile.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setQualificationFile, undefined)
                          resetInput(qualificationRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">例如：电工证、管道工执照、行业协会认证等。</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="training-file">培训证明</Label>
                  <Input
                    id="training-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={trainingRef}
                    onChange={(event) => handleFileChange(setTrainingFile, event.target.files?.[0])}
                    required
                  />
                  {trainingFile && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{trainingFile.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setTrainingFile, undefined)
                          resetInput(trainingRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">上传近期参加的培训或课程完成证明。</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="experience-file">工作经验证明</Label>
                  <Input
                    id="experience-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={experienceRef}
                    onChange={(event) => handleFileChange(setExperienceFile, event.target.files?.[0])}
                    required
                  />
                  {experienceFile && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{experienceFile.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setExperienceFile, undefined)
                          resetInput(experienceRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">可以是推荐信、完工证明或合同节选。</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="insurance-file">保险证明</Label>
                  <Input
                    id="insurance-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2"
                    ref={insuranceRef}
                    onChange={(event) => handleFileChange(setInsuranceFile, event.target.files?.[0])}
                    required
                  />
                  {insuranceFile && (
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="truncate pr-4">{insuranceFile.name}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          handleFileChange(setInsuranceFile, undefined)
                          resetInput(insuranceRef)
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">请确保保险单据显示有效日期与承保范围。</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">公司注册信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="business-number">公司注册编号</Label>
                <Input
                  id="business-number"
                  placeholder="例如：NZBN、IRD Number"
                  className="mt-2"
                  value={businessNumber}
                  onChange={(event) => setBusinessNumber(event.target.value)}
                  required
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">补充说明（可选）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  <Upload className="mt-1 h-4 w-4 text-gray-500" />
                  <p>如需补充团队规模、专长领域或其他说明，请在此填写。</p>
                </div>
                <Textarea
                  rows={3}
                  className="resize-none"
                  value={extraNotes}
                  onChange={(event) => setExtraNotes(event.target.value)}
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
              <p className="text-sm text-gray-500">提交后，审核进度会同步到工作台。请确保所有文件清晰可读。</p>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "提交中..." : "提交资质资料"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

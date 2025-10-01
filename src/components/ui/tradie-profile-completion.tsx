"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CertificationStatusValue = "not_submitted" | "pending" | "approved" | "rejected"

interface CertificationSummary {
  status: 'pending' | 'approved' | 'rejected'
  submittedAt?: string
  updatedAt?: string
  documentsCount?: number
}

interface TradieProfileCompletionProps {
  userProfile: {
    certifications?: {
      personal?: CertificationSummary
      professional?: CertificationSummary
    }
  } | null
  emailVerified: boolean
  onProfileUpdate?: () => void
}

interface CertificationCard {
  id: string
  title: string
  subtitle: string
  href: string
  description: string
  status: CertificationStatusValue
}

const STATUS_LABELS: Record<CertificationStatusValue, string> = {
  not_submitted: "待验证",
  pending: "审核中",
  approved: "已通过",
  rejected: "需重新提交"
}

const STATUS_CLASSES: Record<CertificationStatusValue, string> = {
  not_submitted: "bg-orange-100 text-orange-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600"
}

const resolveStatus = (summary?: CertificationSummary): CertificationStatusValue => {
  if (!summary) return "not_submitted"
  if (summary.status === "approved") return "approved"
  if (summary.status === "rejected") return "rejected"
  return "pending"
}

export function TradieProfileCompletion({ userProfile }: TradieProfileCompletionProps) {
  const personalStatus = resolveStatus(userProfile?.certifications?.personal)
  const professionalStatus = resolveStatus(userProfile?.certifications?.professional)

  const certificationCards: CertificationCard[] = [
    {
      id: "personal",
      title: "个人信息认证",
      subtitle: "完成身份核验，提升客户信任",
      href: "/dashboard/tradie/certifications/personal",
      description: "完善手机号、地址、身份信息，确保账户安全规范。",
      status: personalStatus
    },
    {
      id: "professional",
      title: "专业资质认证",
      subtitle: "展示专业资质，获取更多项目机会",
      href: "/dashboard/tradie/certifications/professional",
      description: "上传资质证书、培训记录和保险证明，让客户放心选择您。",
      status: professionalStatus
    }
  ]

  return (
    <div className="space-y-6">
      {certificationCards.map(card => (
        <Card key={card.id} className="border-orange-200 bg-gradient-to-br from-orange-50/60 to-white">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {card.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
            <Badge className={STATUS_CLASSES[card.status]}>
              {STATUS_LABELS[card.status]}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600 md:max-w-2xl">{card.description}</p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href={card.href}>
                前往{card.title}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TradieProfileCompletion

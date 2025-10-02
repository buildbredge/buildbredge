import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Buffer } from "buffer"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

const BUCKET = "buildbridge"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png"
])

const CERTIFICATION_TYPES = ["personal", "professional"] as const

interface UploadedDocument {
  docType: string
  url: string
  originalName: string
  storagePath: string
}

type CertificationType = (typeof CERTIFICATION_TYPES)[number]

function generateFilePath(userId: string, type: CertificationType, docType: string, originalName: string) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  return `certifications/${userId}/${type}/${docType}/${timestamp}-${random}-${sanitizedName}`
}

async function uploadDocument(
  file: File,
  userId: string,
  type: CertificationType,
  docType: string
): Promise<UploadedDocument> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`不支持的文件格式 ${file.type}，请上传 PDF 或 JPG/PNG 文件`)
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("文件大小超过5MB限制")
  }

  const storagePath = generateFilePath(userId, type, docType, file.name)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined
    })

  if (uploadError) {
    throw new Error(`文件上传失败: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)

  return {
    docType,
    url: publicUrlData.publicUrl,
    originalName: file.name,
    storagePath
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "用户验证失败" }, { status: 401 })
    }

    const formData = await request.formData()
    const typeValue = formData.get("type")

    if (!typeValue || typeof typeValue !== "string" || !CERTIFICATION_TYPES.includes(typeValue as CertificationType)) {
      return NextResponse.json({ success: false, error: "认证类型无效" }, { status: 400 })
    }

    const certificationType = typeValue as CertificationType

    const documents: UploadedDocument[] = []
    const metadata: Record<string, any> = {}
    const notes = typeof formData.get("notes") === "string" ? String(formData.get("notes")) : null

    if (certificationType === "personal") {
      const requiredFields = [
        { key: "addressProof", docType: "address_proof" },
        { key: "idFront", docType: "id_front" },
        { key: "idBack", docType: "id_back" }
      ] as const

      for (const field of requiredFields) {
        const value = formData.get(field.key)
        if (!(value instanceof File) || value.size === 0) {
          return NextResponse.json({ success: false, error: `请上传${field.key === 'addressProof' ? '地址证明' : '身份证件'}文件` }, { status: 400 })
        }

        const uploaded = await uploadDocument(value, user.id, certificationType, field.docType)
        documents.push(uploaded)
      }

      const smsNote = formData.get("smsNote")
      if (smsNote && typeof smsNote === "string") {
        metadata.smsNote = smsNote
      }

      const bankName = formData.get("bankName")
      const bankAccountName = formData.get("bankAccountName")
      const bankAccountNumber = formData.get("bankAccountNumber")

      if (!bankName || typeof bankName !== "string" || !bankName.trim()) {
        return NextResponse.json({ success: false, error: "请填写银行名称" }, { status: 400 })
      }

      if (!bankAccountName || typeof bankAccountName !== "string" || !bankAccountName.trim()) {
        return NextResponse.json({ success: false, error: "请填写开户姓名" }, { status: 400 })
      }

      if (!bankAccountNumber || typeof bankAccountNumber !== "string" || !bankAccountNumber.trim()) {
        return NextResponse.json({ success: false, error: "请填写银行账号" }, { status: 400 })
      }

      metadata.bankName = bankName.trim()
      metadata.bankAccountName = bankAccountName.trim()
      metadata.bankAccountNumber = bankAccountNumber.trim()
    } else {
      const requiredProfessionalFields = [
        { key: "qualification", docType: "qualification_certificate" },
        { key: "training", docType: "training_record" },
        { key: "experience", docType: "experience_proof" },
        { key: "insurance", docType: "insurance_proof" }
      ] as const

      for (const field of requiredProfessionalFields) {
        const value = formData.get(field.key)
        if (!(value instanceof File) || value.size === 0) {
          return NextResponse.json({ success: false, error: "请上传所有必需的资质文件" }, { status: 400 })
        }

        const uploaded = await uploadDocument(value, user.id, certificationType, field.docType)
        documents.push(uploaded)
      }

      const businessNumber = formData.get("businessNumber")
      if (businessNumber && typeof businessNumber === "string") {
        metadata.businessNumber = businessNumber
      }

      const extraNotes = formData.get("extraNotes")
      if (extraNotes && typeof extraNotes === "string") {
        metadata.extraNotes = extraNotes
      }
    }

    const { data: submission, error: upsertError } = await supabaseAdmin
      .from("tradie_certification_submissions")
      .upsert(
        {
          user_id: user.id,
          certification_type: certificationType,
          documents,
          metadata,
          notes,
          status: "pending",
          rejection_reason: null,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          reviewer_id: null
        },
        { onConflict: "user_id,certification_type" }
      )
      .select()
      .maybeSingle()

    if (upsertError) {
      console.error("Certification submission error", upsertError)
      return NextResponse.json({ success: false, error: "保存认证资料失败，请稍后重试" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: submission })
  } catch (error) {
    console.error("Certification submission unexpected error", error)
    const message = error instanceof Error ? error.message : "提交失败，请稍后再试"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "用户验证失败" }, { status: 401 })
    }

    const url = new URL(request.url)
    const typeParam = url.searchParams.get("type")

    let filterType: CertificationType | null = null
    if (typeParam) {
      if (!CERTIFICATION_TYPES.includes(typeParam as CertificationType)) {
        return NextResponse.json({ success: false, error: "认证类型无效" }, { status: 400 })
      }
      filterType = typeParam as CertificationType
    }

    let query = supabaseAdmin
      .from("tradie_certification_submissions")
      .select("certification_type, status, submitted_at, updated_at, documents, metadata, notes, rejection_reason")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })

    if (filterType) {
      query = query.eq("certification_type", filterType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Certification fetch error", error)
      return NextResponse.json({ success: false, error: "加载认证资料失败，请稍后重试" }, { status: 500 })
    }

    const submissions: Partial<Record<CertificationType, any>> = {}

    data?.forEach((row) => {
      if (!row) return

      const type = row.certification_type as CertificationType
      submissions[type] = {
        status: row.status,
        submittedAt: row.submitted_at,
        updatedAt: row.updated_at,
        documents: Array.isArray(row.documents) ? row.documents : [],
        metadata: row.metadata ?? null,
        notes: row.notes ?? null,
        rejectionReason: row.rejection_reason ?? null
      }
    })

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error("Certification fetch unexpected error", error)
    return NextResponse.json({ success: false, error: "加载认证资料失败，请稍后重试" }, { status: 500 })
  }
}

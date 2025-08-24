import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 在实际应用中，这里应该上传到 Supabase Storage 或其他云存储
    // 现在我们创建一个临时的响应，包含文件信息
    
    // 将文件转换为 base64 字符串作为临时存储
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const fileInfo = {
      filename: file.name,
      url: dataUrl, // 在实际应用中应该是云存储的URL
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      file: fileInfo
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const expiresIn = parseInt(searchParams.get('expires') || '3600') // 默认1小时

    if (!filePath) {
      return NextResponse.json({
        error: "需要提供文件路径"
      }, { status: 400 })
    }

    console.log('🔗 生成签名URL:', { filePath, expiresIn })

    // 从完整URL中提取文件路径
    let extractedPath = filePath
    if (filePath.includes('/storage/v1/object/public/buildbridge/')) {
      // 从公共URL中提取路径
      extractedPath = filePath.split('/storage/v1/object/public/buildbridge/')[1]
    } else if (filePath.startsWith('https://')) {
      // 处理完整URL
      const url = new URL(filePath)
      const pathParts = url.pathname.split('/buildbridge/')
      if (pathParts.length > 1) {
        extractedPath = pathParts[1]
      }
    }

    console.log('📁 提取的文件路径:', extractedPath)

    // 生成签名URL
    const { data, error } = await supabase.storage
      .from('buildbridge')
      .createSignedUrl(extractedPath, expiresIn)

    if (error) {
      console.error('❌ 生成签名URL失败:', error)
      return NextResponse.json({
        success: false,
        error: "生成签名URL失败",
        details: error.message
      }, { status: 500 })
    }

    if (!data?.signedUrl) {
      return NextResponse.json({
        success: false,
        error: "未获取到签名URL"
      }, { status: 500 })
    }

    console.log('✅ 签名URL生成成功')

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      originalPath: filePath,
      extractedPath,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 签名URL生成异常:", error)
    return NextResponse.json({
      success: false,
      error: "签名URL生成异常",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
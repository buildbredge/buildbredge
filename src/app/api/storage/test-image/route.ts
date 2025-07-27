import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({
        error: "需要提供图片URL"
      }, { status: 400 })
    }

    console.log('🖼️ 测试图片URL:', imageUrl)

    // 尝试获取图片
    const response = await fetch(imageUrl, {
      method: 'HEAD', // 只获取头部信息，不下载完整文件
    })

    console.log('📊 图片响应状态:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      imageUrl,
      accessible: response.ok,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 测试图片URL失败:", error)
    return NextResponse.json({
      success: false,
      error: "测试图片URL失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 })
    }

    // 验证URL是来自Supabase存储
    if (!imageUrl.startsWith('https://opguppjcyapztcdvzakj.supabase.co/storage/')) {
      return new NextResponse('Invalid image URL', { status: 400 })
    }

    console.log('🖼️ 代理图片请求:', imageUrl)

    // 获取图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'BuildBridge-ImageProxy/1.0',
      },
    })

    if (!response.ok) {
      console.error('❌ 图片获取失败:', response.status, response.statusText)
      return new NextResponse('Image not found', { status: 404 })
    }

    // 获取图片数据
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('✅ 图片代理成功:', { 
      url: imageUrl, 
      size: imageBuffer.byteLength,
      contentType 
    })

    // 返回图片
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error("❌ 图片代理失败:", error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
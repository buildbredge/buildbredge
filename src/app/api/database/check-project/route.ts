import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json({
        error: "需要提供项目ID"
      }, { status: 400 })
    }

    console.log('🔍 检查项目:', projectId)

    // 检查项目是否存在
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)

    if (error) {
      console.error('❌ 查询项目失败:', error)
      return NextResponse.json({
        error: "查询项目失败",
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('📋 项目查询结果:', {
      found: data?.length || 0,
      data: data
    })

    return NextResponse.json({
      success: true,
      projectId,
      found: data?.length || 0,
      project: data?.[0] || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 检查项目失败:", error)
    return NextResponse.json({
      success: false,
      error: "检查项目失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
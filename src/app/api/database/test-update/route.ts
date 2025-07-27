import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { projectId, imageUrls } = await request.json()

    if (!projectId) {
      return NextResponse.json({
        error: "需要提供项目ID"
      }, { status: 400 })
    }

    console.log('🔄 测试更新项目:', { projectId, imageUrls })

    // 先检查项目是否存在
    const { data: existingProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    console.log('📋 现有项目:', existingProject)

    // 尝试更新项目
    const { data, error } = await supabase
      .from('projects')
      .update({
        images: imageUrls || ["https://opguppjcyapztcdvzakj.supabase.co/storage/v1/object/public/buildbridge/projects/2fca129e-fe2a-4d25-83dc-d670bf0d589f/images/1753587324916_ey7usp.png"],
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()

    if (error) {
      console.error('❌ 更新失败:', error)
      return NextResponse.json({
        success: false,
        error: "更新失败",
        details: error.message,
        code: error.code,
        hint: error.hint,
        existingProject
      }, { status: 500 })
    }

    console.log('✅ 更新成功:', data)

    return NextResponse.json({
      success: true,
      projectId,
      updatedProject: data?.[0] || null,
      existingProject,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 测试更新失败:", error)
    return NextResponse.json({
      success: false,
      error: "测试更新失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
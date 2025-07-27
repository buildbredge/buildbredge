import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("🔧 开始修复存储桶配置...")

    const results = {
      checks: [] as string[],
      fixes: [] as string[],
      errors: [] as string[]
    }

    // 检查buildbridge存储桶
    const bucketId = 'buildbridge'
    
    try {
      const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(bucketId)
      
      if (getBucketError) {
        results.errors.push(`获取存储桶失败: ${getBucketError.message}`)
        return NextResponse.json({ success: false, results })
      }

      results.checks.push(`存储桶 ${bucketId} 存在: ✅`)
      results.checks.push(`公共访问: ${bucket.public ? '✅' : '❌'}`)

      // 测试一个示例文件URL
      const testUrl = "https://opguppjcyapztcdvzakj.supabase.co/storage/v1/object/public/buildbridge/projects/720b878a-6532-4719-b94c-e90f6caffba0/images/1753587780357_rk8dmg.png"
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' })
        results.checks.push(`测试图片URL访问: ${response.ok ? '✅' : '❌'} (状态: ${response.status})`)
        
        if (!response.ok) {
          results.fixes.push("图片URL无法访问，可能需要修复存储桶策略")
        }
      } catch (fetchError) {
        results.errors.push(`测试图片URL失败: ${fetchError}`)
      }

      // 提供修复建议
      if (!bucket.public) {
        results.fixes.push("需要在Supabase仪表板中将存储桶设置为公共可读")
        results.fixes.push("1. 访问 Supabase 仪表板 > Storage > buildbridge")
        results.fixes.push("2. 点击存储桶设置")
        results.fixes.push("3. 启用 'Public bucket' 选项")
      }

      // 检查存储策略
      results.fixes.push("确保已在Supabase SQL编辑器中执行以下策略:")
      results.fixes.push("CREATE POLICY \"Allow public read from buildbridge bucket\" ON storage.objects FOR SELECT USING (bucket_id = 'buildbridge');")

      console.log("🎉 存储桶检查完成")

      return NextResponse.json({
        success: true,
        message: "存储桶检查完成",
        results,
        recommendations: {
          immediateAction: !bucket.public ? "设置存储桶为公共可读" : "检查RLS策略",
          dashboard: "https://supabase.com/dashboard/project/opguppjcyapztcdvzakj/storage/buckets",
          sql: "https://supabase.com/dashboard/project/opguppjcyapztcdvzakj/sql"
        },
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      results.errors.push(`检查存储桶异常: ${error}`)
      throw error
    }

  } catch (error) {
    console.error("❌ 存储桶修复失败:", error)
    return NextResponse.json({
      success: false,
      error: "存储桶修复失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
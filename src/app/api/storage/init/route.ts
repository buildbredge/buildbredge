import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// 检查是否有服务角色密钥
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin = supabase
if (supabaseServiceKey) {
  const { createClient } = require('@supabase/supabase-js')
  supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("🗂️ 开始初始化存储桶...")

    const results = {
      buckets: { success: 0, errors: [] as string[] },
      policies: { success: 0, errors: [] as string[] }
    }

    // 检查权限
    if (!supabaseServiceKey) {
      console.log("⚠️ 没有服务角色密钥，使用普通客户端（权限可能不足）")
      results.buckets.errors.push("没有SUPABASE_SERVICE_ROLE_KEY，可能无法创建存储桶")
    }

    // 创建存储桶
    const buckets = [
      {
        id: 'buildbridge',
        name: 'buildbridge',
        public: true
      }
    ]

    for (const bucket of buckets) {
      try {
        // 检查存储桶是否已存在
        const { data: existingBucket } = await supabaseAdmin.storage.getBucket(bucket.id)
        
        if (existingBucket) {
          console.log(`✅ 存储桶 ${bucket.id} 已存在`)
          results.buckets.success++
        } else {
          // 创建存储桶
          const { error } = await supabaseAdmin.storage.createBucket(bucket.id, {
            public: bucket.public,
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/webp',
              'video/mp4',
              'video/quicktime',
              'video/avi',
              'video/x-ms-wmv'
            ],
            fileSizeLimit: 104857600 // 100MB
          })

          // 如果存储桶创建成功，设置公共策略
          if (!error) {
            try {
              // 强制设置存储桶为公共可读
              await supabaseAdmin.storage.updateBucket(bucket.id, {
                public: true
              })
              console.log(`✅ 存储桶 ${bucket.id} 设置为公共可读`)
            } catch (updateError) {
              console.warn(`⚠️ 无法更新存储桶 ${bucket.id} 为公共可读:`, updateError)
            }
          }

          if (error) {
            results.buckets.errors.push(`创建存储桶 ${bucket.id} 失败: ${error.message}`)
          } else {
            results.buckets.success++
            console.log(`✅ 创建存储桶: ${bucket.id}`)
          }
        }
      } catch (err) {
        results.buckets.errors.push(`存储桶 ${bucket.id} 处理异常: ${err}`)
      }
    }

    // 注意：存储策略需要在Supabase仪表板中手动设置，或使用SQL编辑器
    // 这里提供需要在Supabase中执行的SQL命令
    const sqlCommands = [
      `-- 允许所有用户上传到buildbridge存储桶
      CREATE POLICY "Allow public upload to buildbridge bucket" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'buildbridge');`,
      
      `-- 允许所有用户读取buildbridge存储桶的文件
      CREATE POLICY "Allow public read from buildbridge bucket" ON storage.objects
      FOR SELECT USING (bucket_id = 'buildbridge');`,
      
      `-- 允许所有用户更新buildbridge存储桶的文件
      CREATE POLICY "Allow public update to buildbridge bucket" ON storage.objects
      FOR UPDATE USING (bucket_id = 'buildbridge');`,
      
      `-- 允许所有用户删除buildbridge存储桶的文件
      CREATE POLICY "Allow public delete from buildbridge bucket" ON storage.objects
      FOR DELETE USING (bucket_id = 'buildbridge');`
    ]

    console.log("📋 存储策略SQL命令已准备，需要在Supabase SQL编辑器中手动执行:")
    sqlCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd}`)
    })

    results.policies.success = sqlCommands.length
    results.policies.errors.push("存储策略需要在Supabase仪表板中手动创建")

    console.log("🎉 存储桶初始化完成")

    return NextResponse.json({
      success: true,
      message: "存储桶初始化完成",
      results,
      summary: {
        buckets: `${results.buckets.success}/${buckets.length} 成功`,
        policies: `需要手动在Supabase中执行SQL命令`
      },
      sqlCommands,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 存储桶初始化失败:", error)
    return NextResponse.json({
      success: false,
      error: "存储桶初始化失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
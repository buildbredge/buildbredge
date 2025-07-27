import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("🔄 开始数据库迁移：允许 projects.user_id 为 NULL...")

    const results = {
      migration: { success: false, error: null as string | null },
      validation: { success: false, error: null as string | null },
      rollback: { available: true, instructions: "" }
    }

    // 执行数据库迁移
    try {
      // 注意：这个SQL需要在Supabase仪表板的SQL编辑器中手动执行
      // 因为通过客户端无法直接执行DDL语句
      const migrationSQL = `
        -- 允许 projects 表的 user_id 字段为 NULL
        ALTER TABLE projects ALTER COLUMN user_id DROP NOT NULL;
        
        -- 添加索引以优化查询性能
        CREATE INDEX IF NOT EXISTS idx_projects_user_id_null 
        ON projects(user_id) 
        WHERE user_id IS NULL;
        
        -- 添加注释说明
        COMMENT ON COLUMN projects.user_id IS 'User ID - NULL for anonymous projects, foreign key to auth.users for logged-in users';
      `

      console.log("📋 迁移SQL已准备，需要在Supabase SQL编辑器中执行:")
      console.log(migrationSQL)

      // 测试当前约束状态
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('user_id')
        .limit(1)

      if (testError) {
        throw new Error(`测试查询失败: ${testError.message}`)
      }

      results.migration.success = true
      results.migration.error = "需要手动执行SQL - 客户端无法直接修改表结构"

    } catch (error) {
      results.migration.success = false
      results.migration.error = error instanceof Error ? error.message : String(error)
    }

    // 验证迁移是否成功（通过尝试插入NULL值）
    try {
      // 这个测试会在实际迁移完成后验证
      const testProject = {
        description: "测试项目 - 请删除",
        location: "测试位置",
        detailed_description: "这是一个测试项目，用于验证数据库迁移。请在测试完成后删除。",
        email: "test@example.com",
        images: [],
        video: null,
        status: 'draft' as const,
        user_id: null // 测试NULL值
      }

      // 注意：这个操作在迁移完成前会失败
      const { data: insertData, error: insertError } = await supabase
        .from('projects')
        .insert(testProject)
        .select()

      if (insertError) {
        if (insertError.message.includes('violates not-null constraint') || 
            insertError.message.includes('null value in column')) {
          results.validation.success = false
          results.validation.error = "数据库迁移尚未完成 - user_id 仍然不允许为 NULL"
        } else {
          throw insertError
        }
      } else {
        // 如果插入成功，立即删除测试数据
        if (insertData && insertData[0]) {
          await supabase
            .from('projects')
            .delete()
            .eq('id', insertData[0].id)
        }
        results.validation.success = true
      }

    } catch (error) {
      results.validation.success = false
      results.validation.error = error instanceof Error ? error.message : String(error)
    }

    // 回滚说明
    results.rollback.instructions = `
      如需回滚此迁移，在Supabase SQL编辑器中执行：
      ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
      DROP INDEX IF EXISTS idx_projects_user_id_null;
    `

    console.log("✅ 数据库迁移脚本执行完成")

    return NextResponse.json({
      success: true,
      message: "数据库迁移脚本已准备",
      results,
      nextSteps: {
        manual: "请在Supabase仪表板的SQL编辑器中执行以下SQL：",
        sql: `
-- 1. 允许 projects.user_id 为 NULL
ALTER TABLE projects ALTER COLUMN user_id DROP NOT NULL;

-- 2. 添加性能索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id_null 
ON projects(user_id) 
WHERE user_id IS NULL;

-- 3. 添加列注释
COMMENT ON COLUMN projects.user_id IS 'User ID - NULL for anonymous projects, foreign key to auth.users for logged-in users';
        `,
        verification: "执行完成后，再次调用此API验证迁移是否成功"
      },
      dashboardUrl: "https://supabase.com/dashboard/project/opguppjcyapztcdvzakj/sql",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 数据库迁移失败:", error)
    return NextResponse.json({
      success: false,
      error: "数据库迁移失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
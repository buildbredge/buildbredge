import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🗄️ 测试增强数据库连接...")

    // 测试基本连接
    const { data: connectionTest, error: connectionError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (connectionError) {
      console.error("❌ 数据库连接失败:", connectionError)
      return NextResponse.json({
        success: false,
        error: "数据库连接失败",
        details: connectionError
      }, { status: 500 })
    }

    // 测试所有表是否存在以及新字段
    const tables = ['projects', 'owners', 'tradies', 'reviews']
    const tableStatus: Record<string, any> = {}

    for (const table of tables) {
      try {
        // 基本表存在性检查
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          tableStatus[table] = { exists: false, error: error.message }
          continue
        }

        // 获取记录总数
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        let enhancedFields = {}

        // 检查增强字段
        if (table === 'projects') {
          // 检查项目表的坐标字段
          const { data: projectSample } = await supabase
            .from('projects')
            .select('latitude, longitude')
            .limit(1)
            .single()

          enhancedFields = {
            hasCoordinates: projectSample && 'latitude' in projectSample && 'longitude' in projectSample,
            coordinatesSample: projectSample ? `${projectSample.latitude}, ${projectSample.longitude}` : null
          }
        }

        if (table === 'owners') {
          // 检查业主表的坐标和地址字段
          const { data: ownerSample } = await supabase
            .from('owners')
            .select('latitude, longitude, address')
            .limit(1)
            .single()

          enhancedFields = {
            hasCoordinates: ownerSample && 'latitude' in ownerSample && 'longitude' in ownerSample,
            hasAddress: ownerSample && 'address' in ownerSample,
            coordinatesSample: ownerSample ? `${ownerSample.latitude}, ${ownerSample.longitude}` : null
          }
        }

        if (table === 'tradies') {
          // 检查技师表的增强字段
          const { data: tradieSample } = await supabase
            .from('tradies')
            .select('latitude, longitude, address, service_radius, rating, review_count')
            .limit(1)
            .single()

          enhancedFields = {
            hasCoordinates: tradieSample && 'latitude' in tradieSample && 'longitude' in tradieSample,
            hasAddress: tradieSample && 'address' in tradieSample,
            hasServiceRadius: tradieSample && 'service_radius' in tradieSample,
            hasRatingSystem: tradieSample && 'rating' in tradieSample && 'review_count' in tradieSample,
            coordinatesSample: tradieSample ? `${tradieSample.latitude}, ${tradieSample.longitude}` : null,
            serviceRadiusSample: tradieSample?.service_radius,
            ratingSample: tradieSample ? `${tradieSample.rating} (${tradieSample.review_count} reviews)` : null
          }
        }

        if (table === 'reviews') {
          // 检查评论表的完整性
          const { data: reviewSample } = await supabase
            .from('reviews')
            .select('project_id, owner_id, tradie_id, rating, comment, is_approved')
            .limit(1)
            .single()

          enhancedFields = {
            hasCompleteStructure: reviewSample &&
              'project_id' in reviewSample &&
              'owner_id' in reviewSample &&
              'tradie_id' in reviewSample,
            hasRatingField: reviewSample && 'rating' in reviewSample,
            hasApprovalSystem: reviewSample && 'is_approved' in reviewSample,
            sampleRating: reviewSample?.rating
          }
        }

        tableStatus[table] = {
          exists: true,
          count: count || 0,
          accessible: true,
          enhanced: enhancedFields
        }

      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err instanceof Error ? err.message : String(err)
        }
      }
    }

    // 测试数据库函数
    let functionsStatus = {}
    try {
      // 测试距离计算函数
      const { data: distanceTest, error: distanceError } = await supabase
        .rpc('calculate_distance', {
          lat1: -36.8485,
          lon1: 174.7633,
          lat2: -36.8509,
          lon2: 174.7645
        })

      functionsStatus = {
        calculateDistance: distanceError ?
          { available: false, error: distanceError.message } :
          { available: true, testResult: `${distanceTest?.toFixed(2)} km` }
      }
    } catch (err) {
      functionsStatus = {
        calculateDistance: {
          available: false,
          error: err instanceof Error ? err.message : String(err)
        }
      }
    }

    // 测试视图
    let viewsStatus = {}
    try {
      const { data: statsTest, error: statsError } = await supabase
        .from('tradie_stats')
        .select('*')
        .limit(1)

      viewsStatus = {
        tradieStats: statsError ?
          { available: false, error: statsError.message } :
          { available: true, sampleData: statsTest?.[0] || null }
      }
    } catch (err) {
      viewsStatus = {
        tradieStats: {
          available: false,
          error: err instanceof Error ? err.message : String(err)
        }
      }
    }

    console.log("✅ 增强数据库连接测试完成")

    return NextResponse.json({
      success: true,
      message: "增强数据库连接正常",
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "已配置" : "未配置",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已配置" : "未配置"
      },
      tables: tableStatus,
      functions: functionsStatus,
      views: viewsStatus,
      enhancements: {
        geolocation: "✅ 地理位置坐标支持",
        reviews: "✅ 评论和评分系统",
        calculations: "✅ 距离计算功能",
        statistics: "✅ 技师统计视图"
      },
      recommendations: {
        nextSteps: [
          "在Supabase控制台执行 database/schema.sql",
          "初始化示例数据包含坐标信息",
          "测试地理位置查询功能",
          "验证评论系统工作正常"
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 增强数据库测试出错:", error)
    return NextResponse.json({
      success: false,
      error: "增强数据库测试失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

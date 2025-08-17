import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("🏗️ 开始初始化增强数据库...")

    // 创建示例数据（包含坐标）
    const sampleData = {
      owners: [
        {
          name: '张女士',
          phone: '+64-21-123456',
          email: 'zhang.owner@buildbridge.nz',
          status: 'approved' as const,
          balance: 1000.00,
          latitude: -36.8485,
          longitude: 174.7633,
          address: '奥克兰CBD'
        },
        {
          name: '李先生',
          phone: '+1-647-234567',
          email: 'li.owner@buildbridge.nz',
          status: 'pending' as const,
          balance: 0.00,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '多伦多市中心'
        },
        {
          name: '王女士',
          phone: '+61-4-345678',
          email: 'wang.owner@buildbridge.nz',
          status: 'approved' as const,
          balance: 500.00,
          latitude: -33.8688,
          longitude: 151.2093,
          address: '悉尼市中心'
        }
      ],
      tradies: [
        {
          name: '张师傅',
          phone: '+64-21-789012',
          email: 'zhang.electrician@buildbridge.nz',
          company: '奥克兰专业电气公司',
          status: 'approved' as const,
          balance: 2500.00,
          latitude: -36.8509,
          longitude: 174.7645,
          address: '奥克兰Ponsonby',
          service_radius: 30
        },
        {
          name: '王师傅',
          phone: '+64-21-890123',
          email: 'wang.plumber@buildbridge.nz',
          company: '个人服务',
          status: 'approved' as const,
          balance: 1800.00,
          latitude: -36.8485,
          longitude: 174.7500,
          address: '奥克兰CBD',
          service_radius: 25
        },
        {
          name: '李建筑队',
          phone: '+64-9-234567',
          email: 'li.construction@buildbridge.nz',
          company: '李氏建筑有限公司',
          status: 'pending' as const,
          balance: 0.00,
          latitude: -36.8600,
          longitude: 174.7800,
          address: '奥克兰Mount Eden',
          service_radius: 50
        },
        {
          name: '陈师傅',
          phone: '+1-416-345678',
          email: 'chen.painter@buildbridge.nz',
          company: '多伦多装修公司',
          status: 'approved' as const,
          balance: 1200.00,
          latitude: 43.6510,
          longitude: -79.3470,
          address: '多伦多East York',
          service_radius: 20
        },
        {
          name: '刘师傅',
          phone: '+61-2-456789',
          email: 'liu.carpenter@buildbridge.nz',
          company: '悉尼木工工作室',
          status: 'approved' as const,
          balance: 3000.00,
          latitude: -33.8650,
          longitude: 151.2094,
          address: '悉尼Darlinghurst',
          service_radius: 35
        }
      ],
      projects: [
        {
          description: '厨房水龙头更换',
          location: '新西兰-奥克兰-CBD',
          latitude: -36.8485,
          longitude: 174.7633,
          detailed_description: '需要更换厨房水龙头，现有的已经漏水。希望使用优质材料，工作需要在周末完成。包含移除旧水龙头和安装新的，确保无漏水。',
          email: 'zhang.owner@buildbridge.nz',
          phone: '+64-21-123456',
          images: [],
          video: null,
          status: 'published' as const,
          user_id: 'demo-user-1'
        },
        {
          description: '客厅灯具安装',
          location: '新西兰-奥克兰-Ponsonby',
          latitude: -36.8509,
          longitude: 174.7645,
          detailed_description: '新买了一套客厅吊灯，需要专业电工安装。包括移除旧灯具和安装新的。需要检查电路安全，确保符合标准。',
          email: 'li.owner@buildbridge.nz',
          phone: '+1-647-234567',
          images: [],
          video: null,
          status: 'published' as const,
          user_id: 'demo-user-2'
        },
        {
          description: '浴室翻新',
          location: '澳大利亚-悉尼-Darlinghurst',
          latitude: -33.8650,
          longitude: 151.2094,
          detailed_description: '需要完整的浴室翻新，包括瓷砖、洁具、水管等。希望现代简约风格，预算弹性。',
          email: 'wang.owner@buildbridge.nz',
          phone: '+61-4-345678',
          images: [],
          video: null,
          status: 'published' as const,
          user_id: 'demo-user-3'
        }
      ]
    }

    const results = {
      owners: { success: 0, errors: [] as string[] },
      tradies: { success: 0, errors: [] as string[] },
      projects: { success: 0, errors: [] as string[] },
      reviews: { success: 0, errors: [] as string[] }
    }

    // 插入业主数据
    for (const owner of sampleData.owners) {
      try {
        const { error } = await supabase
          .from('owners')
          .upsert(owner, {
            onConflict: 'email',
            ignoreDuplicates: false
          })

        if (error) {
          results.owners.errors.push(`插入业主 ${owner.name} 失败: ${error.message}`)
        } else {
          results.owners.success++
          console.log(`✅ 插入/更新业主: ${owner.name}`)
        }
      } catch (err) {
        results.owners.errors.push(`插入业主 ${owner.name} 异常: ${err}`)
      }
    }

    // 插入技师数据
    for (const tradie of sampleData.tradies) {
      try {
        const { error } = await supabase
          .from('tradies')
          .upsert(tradie, {
            onConflict: 'email',
            ignoreDuplicates: false
          })

        if (error) {
          results.tradies.errors.push(`插入技师 ${tradie.name} 失败: ${error.message}`)
        } else {
          results.tradies.success++
          console.log(`✅ 插入/更新技师: ${tradie.name}`)
        }
      } catch (err) {
        results.tradies.errors.push(`插入技师 ${tradie.name} 异常: ${err}`)
      }
    }

    // 插入项目数据
    for (const project of sampleData.projects) {
      try {
        // 先检查是否已存在
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('email', project.email)
          .eq('description', project.description)
          .single()

        if (existingProject) {
          console.log(`⚠️ 项目已存在: ${project.description}`)
          continue
        }

        const { error } = await supabase
          .from('projects')
          .insert(project)

        if (error) {
          results.projects.errors.push(`插入项目 ${project.description} 失败: ${error.message}`)
        } else {
          results.projects.success++
          console.log(`✅ 插入项目: ${project.description}`)
        }
      } catch (err) {
        results.projects.errors.push(`插入项目 ${project.description} 异常: ${err}`)
      }
    }

    // 创建示例评论数据
    console.log("📝 开始创建示例评论...")

    try {
      // 获取已创建的项目、业主和技师ID
      const { data: projects } = await supabase.from('projects').select('id, email, description')
      const { data: owners } = await supabase.from('owners').select('id, email, name')
      const { data: tradies } = await supabase.from('tradies').select('id, email, name')

      if (projects && owners && tradies) {
        const sampleReviews = [
          // 张师傅的评论
          {
            project_id: projects.find(p => p.email === 'zhang.owner@buildbridge.nz')?.id,
            owner_id: owners.find(o => o.email === 'zhang.owner@buildbridge.nz')?.id,
            tradie_id: tradies.find(t => t.email === 'zhang.electrician@buildbridge.nz')?.id,
            rating: 5,
            comment: '张师傅工作非常专业，准时到达，工作质量很高。安装的灯具非常满意，电路检查也很仔细。强烈推荐！',
            images: [],
            video: null
          },
          // 王师傅的评论
          {
            project_id: projects.find(p => p.email === 'li.owner@buildbridge.nz')?.id,
            owner_id: owners.find(o => o.email === 'li.owner@buildbridge.nz')?.id,
            tradie_id: tradies.find(t => t.email === 'wang.plumber@buildbridge.nz')?.id,
            rating: 4,
            comment: '王师傅技术不错，价格合理，就是稍微晚到了一点。水龙头安装质量很好，无漏水。整体还是很满意的。',
            images: [],
            video: null
          },
          // 刘师傅的评论
          {
            project_id: projects.find(p => p.email === 'wang.owner@buildbridge.nz')?.id,
            owner_id: owners.find(o => o.email === 'wang.owner@buildbridge.nz')?.id,
            tradie_id: tradies.find(t => t.email === 'liu.carpenter@buildbridge.nz')?.id,
            rating: 5,
            comment: '刘师傅的木工技术一流！浴室翻新超出预期，细节处理非常到位。工期准时，清理工作也很好。',
            images: [],
            video: null
          },
          // 添加更多评论
          {
            project_id: projects.find(p => p.email === 'zhang.owner@buildbridge.nz')?.id,
            owner_id: owners.find(o => o.email === 'zhang.owner@buildbridge.nz')?.id,
            tradie_id: tradies.find(t => t.email === 'wang.plumber@buildbridge.nz')?.id,
            rating: 4,
            comment: '之前请王师傅帮忙修过管道，这次又找他。服务态度好，价格公道，值得信赖。',
            images: [],
            video: null
          }
        ]

        for (const review of sampleReviews) {
          if (review.project_id && review.owner_id && review.tradie_id) {
            try {
              // 检查是否已存在相同评论
              const { data: existingReview } = await supabase
                .from('reviews')
                .select('id')
                .eq('project_id', review.project_id)
                .eq('owner_id', review.owner_id)
                .eq('tradie_id', review.tradie_id)
                .single()

              if (existingReview) {
                console.log("⚠️ 评论已存在，跳过")
                continue
              }

              const { error } = await supabase
                .from('reviews')
                .insert(review)

              if (error) {
                results.reviews.errors.push(`插入评论失败: ${error.message}`)
              } else {
                results.reviews.success++
                console.log("✅ 插入评论成功")
              }
            } catch (err) {
              results.reviews.errors.push(`插入评论异常: ${err}`)
            }
          }
        }
      }
    } catch (err) {
      results.reviews.errors.push(`创建评论数据异常: ${err}`)
    }

    console.log("🎉 增强数据库初始化完成")

    return NextResponse.json({
      success: true,
      message: "增强数据库初始化完成",
      results,
      summary: {
        owners: `${results.owners.success}/${sampleData.owners.length} 成功`,
        tradies: `${results.tradies.success}/${sampleData.tradies.length} 成功`,
        projects: `${results.projects.success}/${sampleData.projects.length} 成功`,
        reviews: `${results.reviews.success} 条评论创建成功`
      },
      features: {
        coordinates: "✅ 地理坐标字段已添加",
        reviews: "✅ 评论系统已创建",
        geolocation: "✅ 支持基于位置的查询",
        rating: "✅ 技师评分系统已启用"
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ 增强数据库初始化失败:", error)
    return NextResponse.json({
      success: false,
      error: "增强数据库初始化失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// POST /api/users/claim-anonymous-projects - 用户登录后认领匿名项目
export async function POST(request: NextRequest) {
  try {
    const { user_id, email } = await request.json()

    if (!user_id || !email) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, email" },
        { status: 400 }
      )
    }

    // 查找该邮箱的匿名项目（user_id为null）
    const { data: anonymousProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id, description, created_at')
      .eq('email', email)
      .is('user_id', null)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error("Error fetching anonymous projects:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch anonymous projects" },
        { status: 500 }
      )
    }

    if (!anonymousProjects || anonymousProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No anonymous projects found for this email",
        claimedCount: 0,
        projects: []
      })
    }

    // 更新这些项目的user_id
    const projectIds = anonymousProjects.map(p => p.id)
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        user_id: user_id,
        updated_at: new Date().toISOString()
      })
      .in('id', projectIds)

    if (updateError) {
      console.error("Error claiming anonymous projects:", updateError)
      return NextResponse.json(
        { error: "Failed to claim anonymous projects" },
        { status: 500 }
      )
    }

    // 发送认领成功通知邮件
    try {
      const projectTitles = anonymousProjects.map(p => p.description)
      
      await smtpEmailService.sendAnonymousProjectClaimNotification({
        to: email,
        projectCount: anonymousProjects.length,
        projectTitles: projectTitles
      })
      
      console.log(`✅ Anonymous project claim notification sent to ${email}`)
    } catch (emailError) {
      console.error("❌ Failed to send claim notification email:", emailError)
      // 不让邮件错误影响认领成功
    }

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${anonymousProjects.length} projects`,
      claimedCount: anonymousProjects.length,
      projects: anonymousProjects.map(p => ({
        id: p.id,
        description: p.description,
        created_at: p.created_at
      }))
    })

  } catch (error) {
    console.error("Error in claim anonymous projects API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/users/claim-anonymous-projects?email=xxx - 检查匿名项目数量（可选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      )
    }

    // 查找该邮箱的匿名项目数量
    const { count, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .is('user_id', null)

    if (error) {
      console.error("Error counting anonymous projects:", error)
      return NextResponse.json(
        { error: "Failed to count anonymous projects" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      email: email,
      anonymousProjectCount: count || 0
    })

  } catch (error) {
    console.error("Error in count anonymous projects API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
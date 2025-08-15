import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// POST /api/projects/[id]/review - 用户完成项目评价
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id
    const { owner_id, rating, comment, images = [], video = null } = await request.json()

    // 验证必需字段
    if (!owner_id || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: owner_id, rating" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // 获取项目信息
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        status,
        user_id,
        accepted_quote_id,
        accepted_quote:quotes(
          tradie_id
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // 检查项目状态
    if (project.status !== 'completed') {
      return NextResponse.json(
        { error: "Project must be completed before review" },
        { status: 400 }
      )
    }

    // 检查权限 - 只有项目拥有者可以评价
    if (project.user_id && project.user_id !== owner_id) {
      return NextResponse.json(
        { error: "Only project owner can submit review" },
        { status: 403 }
      )
    }

    // 检查是否已有评价
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('project_id', projectId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already submitted for this project" },
        { status: 400 }
      )
    }

    const acceptedQuote = Array.isArray(project.accepted_quote) ? project.accepted_quote[0] : project.accepted_quote
    const tradieId = acceptedQuote?.tradie_id

    if (!tradieId) {
      return NextResponse.json(
        { error: "No tradie assigned to this project" },
        { status: 400 }
      )
    }

    // 创建评价
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        project_id: projectId,
        owner_id: owner_id,
        tradie_id: tradieId,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        images: images,
        video: video,
        is_approved: true // 自动批准评价
      })
      .select()
      .single()

    if (reviewError) {
      console.error("Error creating review:", reviewError)
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      )
    }

    // 更新项目状态为已评价
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        status: 'reviewed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectUpdateError) {
      console.error("Error updating project status:", projectUpdateError)
      // 不让状态更新错误影响评价成功
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: review
    })

  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/tradies/[id]/quotes - 获取技师的所有报价
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id
    console.log("Fetching quotes for tradie ID:", tradieId)

    // 验证技师ID
    if (!tradieId) {
      console.error("No tradie ID provided")
      return NextResponse.json(
        { error: "Tradie ID is required" },
        { status: 400 }
      )
    }

    // 验证技师ID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(tradieId)) {
      console.error("Invalid tradie ID format:", tradieId)
      return NextResponse.json(
        { error: "Invalid tradie ID format" },
        { status: 400 }
      )
    }

    // 获取技师的所有报价及项目信息
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        created_at,
        updated_at,
        projects!quotes_project_id_fkey(
          id,
          description,
          location,
          status,
          created_at,
          accepted_quote_id
        )
      `)
      .eq('tradie_id', tradieId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching tradie quotes:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: "Failed to fetch quotes",
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    // 处理报价状态逻辑
    const processedQuotes = quotes?.map(quote => {
      const project = Array.isArray(quote.projects) ? quote.projects[0] : quote.projects
      
      // 确定最终状态
      let finalStatus = quote.status
      
      // 如果项目有接受的报价但不是这个报价，标记为自动拒绝
      if (project?.accepted_quote_id && project.accepted_quote_id !== quote.id) {
        finalStatus = 'auto_rejected'
      }
      
      return {
        id: quote.id,
        project_id: quote.project_id,
        tradie_id: quote.tradie_id,
        price: quote.price,
        description: quote.description,
        status: finalStatus,
        created_at: quote.created_at,
        updated_at: quote.updated_at,
        project: {
          id: project?.id,
          description: project?.description,
          location: project?.location,
          status: project?.status,
          created_at: project?.created_at,
          accepted_quote_id: project?.accepted_quote_id
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      quotes: processedQuotes
    })

  } catch (error) {
    console.error("Error processing tradie quotes request:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { 
        error: "Internal server error",
        debug: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
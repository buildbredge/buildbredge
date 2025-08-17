import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/owners/[id]/quotes - 获取业主收到的所有报价
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const ownerId = params.id

    // 验证业主ID
    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      )
    }

    // 获取业主所有项目收到的报价
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
          user_id
        ),
        users!quotes_tradie_id_fkey(
          id,
          name,
          email,
          company
        )
      `)
      .eq('projects.user_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching owner quotes:", error)
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 }
      )
    }

    // 处理数据结构
    const processedQuotes = quotes?.map(quote => {
      const project = Array.isArray(quote.projects) ? quote.projects[0] : quote.projects
      const tradie = Array.isArray(quote.users) ? quote.users[0] : quote.users
      
      return {
        id: quote.id,
        project_id: quote.project_id,
        tradie_id: quote.tradie_id,
        price: quote.price,
        description: quote.description,
        status: quote.status,
        created_at: quote.created_at,
        updated_at: quote.updated_at,
        project: {
          id: project?.id,
          description: project?.description,
          location: project?.location,
          status: project?.status,
          created_at: project?.created_at
        },
        tradie: {
          id: tradie?.id,
          name: tradie?.name,
          email: tradie?.email,
          company: tradie?.company
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      quotes: processedQuotes
    })

  } catch (error) {
    console.error("Error processing owner quotes request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
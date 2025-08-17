import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/tradies/[id]/projects - 获取技师已接受报价的项目
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id
    console.log("Fetching projects for tradie ID:", tradieId)

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

    // 获取技师已接受报价的项目
    const { data: projects, error } = await supabase
      .from('quotes')
      .select(`
        id,
        price,
        description,
        created_at,
        tradie_id,
        status,
        projects!inner(
          id,
          description,
          location,
          status,
          created_at,
          email,
          user_id,
          accepted_quote_id,
          users(
            name,
            email
          )
        )
      `)
      .eq('tradie_id', tradieId)
      .eq('status', 'accepted')
      .not('projects.accepted_quote_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching tradie projects:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: "Failed to fetch projects",
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    console.log(`Found ${projects?.length || 0} projects for tradie ${tradieId}`)

    // 处理数据结构
    const processedProjects = projects?.map(project => {
      const acceptedQuote = Array.isArray(project.quotes) ? project.quotes[0] : project.quotes
      const owner = Array.isArray(project.users) ? project.users[0] : project.users
      
      return {
        id: project.id,
        description: project.description,
        location: project.location,
        status: project.status,
        created_at: project.created_at,
        accepted_quote: {
          id: acceptedQuote?.id,
          price: acceptedQuote?.price,
          description: acceptedQuote?.description,
          created_at: acceptedQuote?.created_at
        },
        owner: {
          name: owner?.name,
          email: owner?.email || project.email
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      projects: processedProjects
    })

  } catch (error) {
    console.error("Error processing tradie projects request:", error)
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
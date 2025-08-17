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

    // 先获取技师已被接受的报价
    const { data: acceptedQuotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        price,
        description,
        created_at,
        tradie_id
      `)
      .eq('tradie_id', tradieId)
      .eq('status', 'accepted')

    console.log("📊 Accepted quotes query result:", { acceptedQuotes, quotesError })

    if (quotesError) {
      console.error("Error fetching accepted quotes:", quotesError)
      return NextResponse.json(
        { 
          error: "Failed to fetch quotes",
          debug: process.env.NODE_ENV === 'development' ? quotesError.message : undefined
        },
        { status: 500 }
      )
    }

    if (!acceptedQuotes || acceptedQuotes.length === 0) {
      console.log("📋 No accepted quotes found")
      return NextResponse.json({
        success: true,
        projects: []
      })
    }

    // 获取这些报价对应的项目信息
    const projectIds = acceptedQuotes.map(quote => quote.project_id)
    
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        location,
        status,
        created_at,
        email,
        user_id,
        accepted_quote_id
      `)
      .in('id', projectIds)
      .order('created_at', { ascending: false })

    console.log("📋 Projects query result:", { projects, projectsError })

    if (projectsError) {
      console.error("Error fetching projects:", projectsError)
      return NextResponse.json(
        { 
          error: "Failed to fetch projects",
          debug: process.env.NODE_ENV === 'development' ? projectsError.message : undefined
        },
        { status: 500 }
      )
    }

    // 获取项目业主信息
    const userIds = projects?.map(p => p.user_id).filter(Boolean) || []
    let owners: any[] = []
    
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds)
      
      owners = usersData || []
    }

    console.log(`Found ${projects?.length || 0} projects for tradie ${tradieId}`)

    // 处理数据结构
    const processedProjects = projects?.map(project => {
      const acceptedQuote = acceptedQuotes.find(q => q.project_id === project.id)
      const owner = owners.find(o => o.id === project.user_id)
      
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
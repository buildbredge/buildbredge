import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // First get the tradie's categories
    const { data: tradieProfessions, error: professionError } = await supabase
      .from("tradie_professions")
      .select("category_id")
      .eq("tradie_id", tradieId)

    if (professionError || !tradieProfessions || tradieProfessions.length === 0) {
      return NextResponse.json({
        projects: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      })
    }

    // Get the category IDs
    const categoryIds = [...new Set(tradieProfessions.map(tp => tp.category_id).filter(Boolean))]

    // Get the tradie's location for distance calculation
    const { data: tradieData } = await supabase
      .from("users")
      .select("latitude, longitude, service_radius")
      .eq("id", tradieId)
      .single()

    // Build the base query for matching projects
    // Only show projects that are available for tradies to accept
    // Exclude: in-progress, completed, reviewed projects
    let query = supabase
      .from("projects")
      .select(`
        id,
        description,
        detailed_description,
        location,
        latitude,
        longitude,
        status,
        email,
        phone,
        time_option,
        priority_need,
        created_at,
        updated_at,
        category_id,
        categories(
          id,
          name_en,
          name_zh
        )
      `)
      .eq("status", "published")  // Only published projects (exclude draft, completed, cancelled)
      .order("created_at", { ascending: false })

    // Only matching by category_id
    if (categoryIds.length > 0) {
      let { data: categoryMatches, count: categoryCount } = await query
        .in("category_id", categoryIds)
        .range(offset, offset + limit - 1)

      const processedProjects = processProjectResults(categoryMatches || [], tradieData)
      return NextResponse.json({
        projects: processedProjects,
        total: categoryCount || 0,
        page,
        limit,
        totalPages: Math.ceil((categoryCount || 0) / limit),
        matchType: "category"
      })
    }

    // No categories found for this tradie
    return NextResponse.json({
      projects: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      matchType: "none"
    })

  } catch (error) {
    console.error("Error fetching matched projects:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function processProjectResults(projects: any[], tradieData: any) {
  return projects.map((project: any) => {
    // Calculate distance if coordinates are available
    let distance = null
    if (
      tradieData?.latitude && 
      tradieData?.longitude && 
      project.latitude && 
      project.longitude
    ) {
      distance = calculateDistance(
        tradieData.latitude,
        tradieData.longitude,
        project.latitude,
        project.longitude
      )
    }

    return {
      id: project.id,
      description: project.description,
      detailed_description: project.detailed_description,
      location: project.location,
      status: project.status,
      email: project.email,
      phone: project.phone,
      time_option: project.time_option,
      priority_need: project.priority_need,
      created_at: project.created_at,
      updated_at: project.updated_at,
      category: project.categories ? {
        id: project.categories.id,
        name_en: project.categories.name_en,
        name_zh: project.categories.name_zh,
      } : null,
      distance: distance,
      // Flag if the project is within service radius
      within_service_radius: distance !== null && tradieData?.service_radius 
        ? distance <= tradieData.service_radius 
        : true
    }
  })
  .filter((project: any) => {
    // Only include projects within service radius if location data is available
    return project.within_service_radius
  })
  .sort((a: any, b: any) => {
    // Sort by distance first (if available), then by creation date (newest first)
    if (a.distance !== null && b.distance !== null) {
      if (a.distance !== b.distance) {
        return a.distance - b.distance
      }
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
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

    // First get the tradie's professions
    const { data: tradieProfessions, error: professionError } = await supabase
      .from("tradie_professions")
      .select(`
        profession_id,
        professions!inner(
          id,
          category_id,
          name_en,
          name_zh
        )
      `)
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

    // Get the profession IDs and category IDs
    const professionIds = tradieProfessions.map(tp => tp.profession_id)
    const categoryIds = [...new Set(tradieProfessions.map(tp => {
      const professions = Array.isArray(tp.professions) ? tp.professions[0] : tp.professions
      return professions?.category_id
    }).filter(Boolean))]

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
        profession_id,
        categories(
          id,
          name_en,
          name_zh
        ),
        professions(
          id,
          name_en,
          name_zh,
          category_id
        )
      `)
      .eq("status", "published")  // Only published projects (exclude draft, completed, cancelled)
      .order("created_at", { ascending: false })

    // Primary matching: by category_id (as requested)
    let { data: categoryMatches, count: categoryCount } = await query
      .in("category_id", categoryIds)
      .range(offset, offset + limit - 1)

    if (categoryMatches && categoryMatches.length > 0) {
      const processedProjects = processProjectResults(categoryMatches, tradieData)
      return NextResponse.json({
        projects: processedProjects,
        total: categoryCount || 0,
        page,
        limit,
        totalPages: Math.ceil((categoryCount || 0) / limit),
        matchType: "category"
      })
    }

    // Secondary: exact profession matches (if no category matches)
    let { data: exactMatches, count: exactCount } = await query
      .in("profession_id", professionIds)
      .range(offset, offset + limit - 1)

    if (exactMatches && exactMatches.length > 0) {
      const processedProjects = processProjectResults(exactMatches, tradieData)
      return NextResponse.json({
        projects: processedProjects,
        total: exactCount || 0,
        page,
        limit,
        totalPages: Math.ceil((exactCount || 0) / limit),
        matchType: "exact"
      })
    }

    // Fallback: return recent projects
    const { data: fallbackMatches, count: fallbackCount } = await query
      .range(offset, offset + limit - 1)

    const processedProjects = processProjectResults(fallbackMatches || [], tradieData)
    return NextResponse.json({
      projects: processedProjects,
      total: fallbackCount || 0,
      page,
      limit,
      totalPages: Math.ceil((fallbackCount || 0) / limit),
      matchType: "fallback"
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
      profession: project.professions ? {
        id: project.professions.id,
        name_en: project.professions.name_en,
        name_zh: project.professions.name_zh,
        category_id: project.professions.category_id,
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
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const projectId = params.id

    // First get the project details to know the category
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("category_id, latitude, longitude")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Build the query to find matching tradies
    const query = supabase
      .from("users")
      .select(`
        id,
        name,
        phone,
        email,
        address,
        latitude,
        longitude,
        company,
        experience_years,
        bio,
        rating,
        review_count,
        service_radius,
        user_roles!inner(role_type),
        tradie_professions!inner(
          category_id,
          profession_id,
          professions(
            id,
            category_id,
            name_en,
            name_zh
          )
        )
      `)
      .eq("user_roles.role_type", "tradie")
      .eq("status", "approved")

    // Only matching by category_id
    if (project.category_id) {
      const { data: categoryMatches } = await query
        .eq("tradie_professions.category_id", project.category_id)
        .order("rating", { ascending: false })

      if (categoryMatches && categoryMatches.length > 0) {
        const processedTradies = processTradieResults(categoryMatches, project)
        return NextResponse.json({ tradies: processedTradies })
      }
    }

    // No matches found
    return NextResponse.json({ tradies: [] })

  } catch (error) {
    console.error("Error fetching recommended tradies:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function processTradieResults(tradies: any[], project: any) {
  // First, deduplicate tradies by ID since they might appear multiple times due to multiple professions
  const uniqueTradies = new Map()
  
  tradies.forEach((tradie: any) => {
    if (!uniqueTradies.has(tradie.id)) {
      uniqueTradies.set(tradie.id, tradie)
    } else {
      // Merge professions if tradie already exists
      const existing = uniqueTradies.get(tradie.id)
      existing.tradie_professions = existing.tradie_professions.concat(tradie.tradie_professions)
    }
  })

  return Array.from(uniqueTradies.values()).map((tradie: any) => {
    // Calculate distance if coordinates are available
    let distance = null
    if (
      project.latitude && 
      project.longitude && 
      tradie.latitude && 
      tradie.longitude
    ) {
      distance = calculateDistance(
        project.latitude,
        project.longitude,
        tradie.latitude,
        tradie.longitude
      )
    }

    // Get profession details - deduplicate professions
    const professionsMap = new Map()
    const categoriesMap = new Map()
    
    tradie.tradie_professions?.forEach((tp: any) => {
      // Add category info
      categoriesMap.set(tp.category_id, {
        id: tp.category_id,
      })
      
      // Add profession info only if profession_id is not null and professions data exists
      if (tp.profession_id && tp.professions) {
        professionsMap.set(tp.professions.id, {
          id: tp.professions.id,
          category_id: tp.professions.category_id,
          name_en: tp.professions.name_en,
          name_zh: tp.professions.name_zh,
        })
      }
    })
    
    const professions = Array.from(professionsMap.values())
    const categories = Array.from(categoriesMap.values())

    return {
      id: tradie.id,
      name: tradie.name,
      phone: tradie.phone,
      email: tradie.email,
      address: tradie.address,
      company: tradie.company,
      experience_years: tradie.experience_years,
      bio: tradie.bio,
      rating: tradie.rating || 0,
      review_count: tradie.review_count || 0,
      service_radius: tradie.service_radius,
      distance: distance,
      professions: professions,
      categories: categories,
      // Include primary profession for display (for backward compatibility)
      primary_profession: professions[0] || null,
      // Include primary category for display
      primary_category: categories[0] || null,
    }
  })
  .filter((tradie: any) => {
    // Filter by service radius if distance is available
    if (tradie.distance !== null && tradie.service_radius) {
      return tradie.distance <= tradie.service_radius
    }
    return true
  })
  .sort((a: any, b: any) => {
    // Sort by distance first (if available), then by rating
    if (a.distance !== null && b.distance !== null) {
      if (a.distance !== b.distance) {
        return a.distance - b.distance
      }
    }
    return b.rating - a.rating
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

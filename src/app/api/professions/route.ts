import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category_id")

    let query = supabase
      .from('professions')
      .select(`
        id,
        category_id,
        name_en,
        name_zh,
        categories(
          id,
          name_en,
          name_zh
        )
      `)
      .order('name_zh')

    // Filter by category if provided
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: professions, error } = await query

    if (error) {
      console.error("Error fetching professions:", error)
      return NextResponse.json(
        { error: "Failed to fetch professions" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      professions: professions || []
    })

  } catch (error) {
    console.error("Error in professions API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
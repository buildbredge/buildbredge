import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id

    // Get tradie's current professions
    const { data: tradieProfessions, error } = await supabase
      .from('tradie_professions')
      .select(`
        profession_id,
        professions(
          id,
          category_id,
          name_en,
          name_zh,
          categories(
            id,
            name_en,
            name_zh
          )
        )
      `)
      .eq('tradie_id', tradieId)

    if (error) {
      console.error("Error fetching tradie professions:", error)
      return NextResponse.json(
        { error: "Failed to fetch tradie professions" },
        { status: 500 }
      )
    }

    const professions = tradieProfessions?.map(tp => tp.professions) || []

    return NextResponse.json({
      professions
    })

  } catch (error) {
    console.error("Error in tradie professions API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id
    const { profession_ids } = await request.json()

    if (!profession_ids || !Array.isArray(profession_ids)) {
      return NextResponse.json(
        { error: "profession_ids must be an array" },
        { status: 400 }
      )
    }

    // Start a transaction: delete existing professions and insert new ones
    const { error: deleteError } = await supabase
      .from('tradie_professions')
      .delete()
      .eq('tradie_id', tradieId)

    if (deleteError) {
      console.error("Error deleting tradie professions:", deleteError)
      return NextResponse.json(
        { error: "Failed to update professions" },
        { status: 500 }
      )
    }

    // Insert new professions
    if (profession_ids.length > 0) {
      // First, get the category_id for each profession
      const { data: professionsData, error: fetchError } = await supabase
        .from('professions')
        .select('id, category_id')
        .in('id', profession_ids)

      if (fetchError) {
        console.error("Error fetching profession categories:", fetchError)
        return NextResponse.json(
          { error: "Failed to update professions" },
          { status: 500 }
        )
      }

      const professionsToInsert = professionsData.map(profession => ({
        tradie_id: tradieId,
        profession_id: profession.id,
        category_id: profession.category_id
      }))

      const { error: insertError } = await supabase
        .from('tradie_professions')
        .insert(professionsToInsert)

      if (insertError) {
        console.error("Error inserting tradie professions:", insertError)
        return NextResponse.json(
          { error: "Failed to update professions" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Professions updated successfully"
    })

  } catch (error) {
    console.error("Error updating tradie professions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
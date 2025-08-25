import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const { quoteId } = params

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Get quote with related data
    const { data: quote, error } = await supabase
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
        project:projects (
          id,
          description,
          location,
          detailed_description,
          status,
          user_id
        ),
        tradie:users!quotes_tradie_id_fkey (
          id,
          name,
          email,
          company,
          parent_tradie_id,
          parent_tradie:users!parent_tradie_id_fkey (
            id,
            name,
            company
          )
        )
      `)
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Error fetching quote:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch quote details' },
        { status: 500 }
      )
    }

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedQuote = {
      ...quote,
      // Add computed fields
      project_title: quote.project?.description || 'Unknown Project',
      tradie_name: quote.tradie?.name || 'Unknown Tradie',
      is_affiliate: !!quote.tradie?.parent_tradie_id,
      parent_tradie_name: quote.tradie?.parent_tradie?.name
    }

    return NextResponse.json({
      success: true,
      quote: formattedQuote
    })

  } catch (error: any) {
    console.error('Error in quote API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
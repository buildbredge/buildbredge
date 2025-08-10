import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get("input")

  if (!input) {
    return NextResponse.json({ error: "Missing input parameter" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  
  if (!apiKey) {
    console.error("Google Places API key not configured")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  // Use the new Places API (Text Search - Autocomplete)
  const endpoint = `https://places.googleapis.com/v1/places:autocomplete`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: input,
        languageCode: 'en',
        regionCode: 'NZ', // Default to New Zealand, but will also include other countries
        includedRegionCodes: ['NZ', 'AU', 'US', 'CA'],
        includedPrimaryTypes: ['establishment', 'geocode']
      })
    })
    const data = await response.json()


    // Handle new API response format
    if (data.error) {
      return NextResponse.json({ 
        error: "Google API error", 
        details: data.error
      }, { status: 500 })
    }

    // Transform new API response to match legacy format for frontend compatibility
    const suggestions = data.suggestions || []
    const predictions = suggestions.map((suggestion: any) => ({
      description: suggestion.placePrediction?.text?.text || suggestion.stringData?.text || '',
      place_id: suggestion.placePrediction?.placeId || '',
      structured_formatting: {
        main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || suggestion.stringData?.text || '',
        secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || ''
      }
    })).filter((pred: any) => pred.place_id) // Only keep place predictions, not string suggestions

    if (predictions.length === 0) {
      return NextResponse.json({ 
        status: "ZERO_RESULTS", 
        predictions: [] 
      })
    }

    return NextResponse.json({
      status: "OK",
      predictions: predictions
    })
    
  } catch (error) {
    console.error("❌ 服务器错误:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

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

  const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input,
  )}&key=${apiKey}&language=en&components=country:nz|country:au|country:us|country:ca&types=address`

  try {
    
    const response = await fetch(endpoint)
    const data = await response.json()


    // ZERO_RESULTS是正常状态，表示没有找到匹配结果
    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ 
        status: "ZERO_RESULTS", 
        predictions: [] 
      })
    }

    if (data.status !== "OK") {
      return NextResponse.json({ 
        error: "Google API error", 
        details: data,
        status: data.status 
      }, { status: 500 })
    }

    return NextResponse.json(data)
    
  } catch (error) {
    console.error("❌ 服务器错误:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

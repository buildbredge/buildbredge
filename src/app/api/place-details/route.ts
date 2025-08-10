import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get("place_id")

  if (!placeId) {
    return NextResponse.json({ error: "Missing place_id parameter" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  
  if (!apiKey) {
    console.error("Google Places API key not configured")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  // Use the new Places API (Place Details)
  const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`

  try {
    console.log('🌍 获取地点详情:', placeId)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents'
      }
    })
    const data = await response.json()

    if (data.error) {
      console.error("Google Place Details API error:", data.error)
      return NextResponse.json({ 
        error: "Google API error", 
        details: data.error
      }, { status: 500 })
    }

    // New API response structure
    const place = data
    
    // 解析地址组件
    const addressComponents = place.addressComponents || []
    let country = ""
    let state = ""
    let city = ""
    let district = ""
    let postalCode = ""

    for (const component of addressComponents) {
      const types = component.types
      
      if (types.includes('country')) {
        country = component.longText || component.shortText || ""
      } else if (types.includes('administrative_area_level_1')) {
        state = component.longText || component.shortText || ""
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.longText || component.shortText || ""
      } else if (types.includes('sublocality') || types.includes('administrative_area_level_3')) {
        district = component.longText || component.shortText || ""
      } else if (types.includes('postal_code')) {
        postalCode = component.longText || component.shortText || ""
      }
    }

    // 构建详细的地点信息
    const placeDetails = {
      placeId: place.id,
      address: place.formattedAddress,
      name: place.displayName?.text || "",
      coordinates: {
        lat: place.location?.latitude || null,
        lng: place.location?.longitude || null
      },
      country,
      state,
      city,
      district,
      postalCode
    }

    console.log('✅ 地点详情获取成功:', placeDetails.address)

    return NextResponse.json({
      status: "OK",
      result: placeDetails
    })
    
  } catch (error) {
    console.error("❌ 获取地点详情失败:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
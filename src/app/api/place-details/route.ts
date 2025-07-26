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

  // 使用Place Details API获取详细信息，包括坐标
  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&key=${apiKey}&fields=place_id,formatted_address,geometry,address_components,name`

  try {
    console.log('🌍 获取地点详情:', placeId)
    
    const response = await fetch(endpoint)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Place Details API error:", data)
      return NextResponse.json({ 
        error: "Google API error", 
        details: data,
        status: data.status 
      }, { status: 500 })
    }

    const place = data.result
    
    // 解析地址组件
    const addressComponents = place.address_components || []
    let country = ""
    let state = ""
    let city = ""
    let district = ""
    let postalCode = ""

    for (const component of addressComponents) {
      const types = component.types
      
      if (types.includes('country')) {
        country = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name
      } else if (types.includes('sublocality') || types.includes('administrative_area_level_3')) {
        district = component.long_name
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name
      }
    }

    // 构建详细的地点信息
    const placeDetails = {
      placeId: place.place_id,
      address: place.formatted_address,
      name: place.name || "",
      coordinates: {
        lat: place.geometry?.location?.lat || null,
        lng: place.geometry?.location?.lng || null
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
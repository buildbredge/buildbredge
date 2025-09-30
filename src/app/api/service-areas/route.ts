import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const cityParam = url.searchParams.get("city")
    const city = cityParam ? cityParam.trim() : ""

    if (!city) {
      const { data, error } = await supabase
        .from("service_areas")
        .select("city")
        .order("city", { ascending: true })

      if (error) {
        console.error("Failed to fetch service cities:", error)
        return NextResponse.json({ success: false, error: "无法加载服务城市" }, { status: 500 })
      }

      const cities = Array.from(new Set((data || []).map(item => item.city).filter(Boolean)))

      return NextResponse.json({
        success: true,
        data: {
          cities
        }
      })
    }

    const { data, error } = await supabase
      .from("service_areas")
      .select("id, city, area")
      .eq("city", city)
      .order("area", { ascending: true })

    if (error) {
      console.error("Failed to fetch service areas for city", city, error)
      return NextResponse.json({ success: false, error: "无法加载服务区域" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        areas: data || []
      }
    })
  } catch (error) {
    console.error("Service area API error:", error)
    return NextResponse.json({ success: false, error: "服务器内部错误" }, { status: 500 })
  }
}

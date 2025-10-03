import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ professionId: string }> },
) {
  try {
    const { professionId } = await context.params;
    console.log("Loading tradies for profession ID:", professionId);

    // 查找专业信息，包含所属分类
    const { data: professionRows, error: professionError } = await supabase
      .from("professions")
      .select(`
        id,
        name_zh,
        name_en,
        category_id,
        categories(id, name_zh, name_en)
      `)
      .eq("id", professionId);

    if (professionError) {
      console.error("Error loading profession:", professionError);
      return NextResponse.json(
        { error: "Profession not found" },
        { status: 404 },
      );
    }

    const professionData = professionRows?.[0];
    if (!professionData) {
      console.log("Profession not found:", professionId);
      return NextResponse.json(
        { error: "Profession not found" },
        { status: 404 },
      );
    }

    // 通过 tradie_professions 表查找该专业的技师
    const { data: tradieData, error } = await supabase
      .from("tradie_professions")
      .select(`
        tradie_id,
        profession_id,
        users!inner(
          id,
          name,
          email,
          phone,
          company,
          address,
          rating,
          review_count,
          status,
          created_at,
          bio,
          experience_years,
          hourly_rate
        )
      `)
      .eq("profession_id", professionId);

    if (error) {
      console.error("Error loading tradies:", error);
      return NextResponse.json(
        { error: "Failed to load tradies" },
        { status: 500 },
      );
    }

    // 去重处理（同一个技师可能有多个profession记录）
    const uniqueTradies = new Map();
    tradieData?.forEach((item: any) => {
      const isUserApproved =
        item.users?.status === "approved" || item.users?.status === "active";
      if (item.users && isUserApproved) {
        uniqueTradies.set(item.users.id, item.users);
      }
    });

    const formattedTradies = Array.from(uniqueTradies.values());

    return NextResponse.json({
      data: {
        profession: {
          id: professionData.id,
          name_zh: professionData.name_zh,
          name_en: professionData.name_en,
          category_id: professionData.category_id,
          category: professionData.categories || null,
        },
        tradies: formattedTradies,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 同时提供获取所有专业的路由
export async function POST(request: NextRequest) {
  try {
    const { data: professions, error } = await supabase
      .from("professions")
      .select("id");

    if (error) {
      console.error("Error fetching professions:", error);
      return NextResponse.json(
        { error: "Failed to fetch professions" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: professions || [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

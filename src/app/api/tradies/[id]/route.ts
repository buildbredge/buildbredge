import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tradieId = id

    // 获取技师基本数据
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
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
      `)
      .eq('id', tradieId)
      .single()

    if (userError) {
      console.error('Error fetching tradie data:', userError)
      return NextResponse.json({ error: 'Tradie not found' }, { status: 404 })
    }

    // 获取技师的专业类别
    const { data: categoryData, error: categoryError } = await supabase
      .from('tradie_professions')
      .select(`
        categories!inner(
          name_zh,
          name_en
        )
      `)
      .eq('tradie_id', tradieId)

    const categories = categoryData?.map((item: any) => item.categories.name_zh) || []

    // 获取技师的项目历史
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('tradie_portfolios')
      .select('*')
      .eq('tradie_id', tradieId)
      .order('completed_date', { ascending: false })

    const portfolio = portfolioData || []

    // 组装返回数据
    const tradieData = {
      ...userData,
      categories,
      portfolio
    }

    return NextResponse.json({ data: tradieData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
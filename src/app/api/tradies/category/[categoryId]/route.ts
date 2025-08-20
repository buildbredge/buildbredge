import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    console.log('Loading tradies for category ID:', categoryId)
    
    // 首先查找类别信息
    const { data: categoriesData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)

    if (categoryError) {
      console.error('Error loading category:', categoryError)
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const categoryData = categoriesData?.[0]
    if (!categoryData) {
      console.log('Category not found:', categoryId)
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 通过 tradie_professions 表查找该类别的技师
    const { data: tradieData, error } = await supabase
      .from('tradie_professions')
      .select(`
        tradie_id,
        category_id,
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
      .eq('category_id', categoryId)

    if (error) {
      console.error('Error loading tradies:', error)
      return NextResponse.json({ error: 'Failed to load tradies' }, { status: 500 })
    }

    // 去重处理（同一个技师可能有多个profession记录）
    const uniqueTradies = new Map()
    tradieData?.forEach((item: any) => {
      if (item.users && item.users.status === 'approved') {
        uniqueTradies.set(item.users.id, item.users)
      }
    })

    const formattedTradies = Array.from(uniqueTradies.values())

    return NextResponse.json({
      data: {
        category: categoryData,
        tradies: formattedTradies
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// 同时提供获取所有类别的路由
export async function POST(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json({ data: categories || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
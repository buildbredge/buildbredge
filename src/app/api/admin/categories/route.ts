import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withAdminAuth, AdminUser } from '@/lib/adminAuth'

// 创建管理员专用的Supabase客户端
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Get all categories
async function handleCategoriesGet(request: NextRequest, adminUser: AdminUser) {
  try {
    console.log(`Admin ${adminUser.email} fetching categories...`)

    const supabaseAdmin = getSupabaseAdmin()
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: categories || []
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new category
async function handleCategoriesPost(request: NextRequest, adminUser: AdminUser) {
  try {
    const { name_en, name_zh, description } = await request.json()

    if (!name_en || !name_zh) {
      return NextResponse.json(
        { success: false, error: '中英文名称都是必填项' },
        { status: 400 }
      )
    }

    console.log(`Admin ${adminUser.email} creating category: ${name_zh}`)

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name_en: name_en.trim(),
        name_zh: name_zh.trim(),
        description: description?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '分类创建成功'
    })

  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handleCategoriesGet)
export const POST = withAdminAuth(handleCategoriesPost)
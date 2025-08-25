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

// Get all professions with category info
async function handleProfessionsGet(request: NextRequest, adminUser: AdminUser) {
  try {
    console.log(`Admin ${adminUser.email} fetching professions...`)

    const supabaseAdmin = getSupabaseAdmin()
    const { data: professions, error } = await supabaseAdmin
      .from('professions')
      .select(`
        *,
        category:categories(
          name_zh,
          name_en
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching professions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch professions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: professions || []
    })

  } catch (error) {
    console.error('Professions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new profession
async function handleProfessionsPost(request: NextRequest, adminUser: AdminUser) {
  try {
    const { category_id, name_en, name_zh, description, icon } = await request.json()

    if (!name_en || !name_zh) {
      return NextResponse.json(
        { success: false, error: '中英文名称都是必填项' },
        { status: 400 }
      )
    }

    console.log(`Admin ${adminUser.email} creating profession: ${name_zh}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Validate category_id if provided
    if (category_id) {
      const { data: category, error: categoryError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json(
          { success: false, error: '指定的分类不存在' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('professions')
      .insert({
        category_id: category_id || null,
        name_en: name_en.trim(),
        name_zh: name_zh.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null
      })
      .select(`
        *,
        category:categories(
          name_zh,
          name_en
        )
      `)
      .single()

    if (error) {
      console.error('Error creating profession:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '职业创建成功'
    })

  } catch (error) {
    console.error('Profession creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handleProfessionsGet)
export const POST = withAdminAuth(handleProfessionsPost)
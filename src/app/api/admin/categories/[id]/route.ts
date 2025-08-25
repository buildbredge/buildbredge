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

// Update category
async function handleCategoryPatch(request: NextRequest, adminUser: AdminUser, { params }: { params: { id: string } }) {
  try {
    const { name_en, name_zh, description } = await request.json()
    const categoryId = params.id

    if (!name_en || !name_zh) {
      return NextResponse.json(
        { success: false, error: '中英文名称都是必填项' },
        { status: 400 }
      )
    }

    console.log(`Admin ${adminUser.email} updating category: ${categoryId}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name_en: name_en.trim(),
        name_zh: name_zh.trim(),
        description: description?.trim() || null
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '分类更新成功'
    })

  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete category
async function handleCategoryDelete(request: NextRequest, adminUser: AdminUser, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id

    console.log(`Admin ${adminUser.email} deleting category: ${categoryId}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, name_zh')
      .eq('id', categoryId)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      )
    }

    // Check if category has associated professions
    const { data: professions, error: professionsError } = await supabaseAdmin
      .from('professions')
      .select('id')
      .eq('category_id', categoryId)

    if (professionsError) {
      console.error('Error checking professions:', professionsError)
      return NextResponse.json(
        { success: false, error: 'Failed to check associated professions' },
        { status: 500 }
      )
    }

    if (professions && professions.length > 0) {
      return NextResponse.json(
        { success: false, error: `无法删除分类，因为它还有 ${professions.length} 个关联的职业` },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    })

  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuth(handleCategoryPatch)
export const DELETE = withAdminAuth(handleCategoryDelete)
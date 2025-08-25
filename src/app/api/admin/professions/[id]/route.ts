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

// Update profession
async function handleProfessionPatch(request: NextRequest, adminUser: AdminUser, { params }: { params: { id: string } }) {
  try {
    const { category_id, name_en, name_zh, description, icon } = await request.json()
    const professionId = params.id

    if (!name_en || !name_zh) {
      return NextResponse.json(
        { success: false, error: '中英文名称都是必填项' },
        { status: 400 }
      )
    }

    console.log(`Admin ${adminUser.email} updating profession: ${professionId}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Check if profession exists
    const { data: existingProfession, error: fetchError } = await supabaseAdmin
      .from('professions')
      .select('id')
      .eq('id', professionId)
      .single()

    if (fetchError || !existingProfession) {
      return NextResponse.json(
        { success: false, error: '职业不存在' },
        { status: 404 }
      )
    }

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
      .update({
        category_id: category_id || null,
        name_en: name_en.trim(),
        name_zh: name_zh.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null
      })
      .eq('id', professionId)
      .select(`
        *,
        category:categories(
          name_zh,
          name_en
        )
      `)
      .single()

    if (error) {
      console.error('Error updating profession:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '职业更新成功'
    })

  } catch (error) {
    console.error('Profession update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete profession
async function handleProfessionDelete(request: NextRequest, adminUser: AdminUser, { params }: { params: { id: string } }) {
  try {
    const professionId = params.id

    console.log(`Admin ${adminUser.email} deleting profession: ${professionId}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Check if profession exists
    const { data: existingProfession, error: fetchError } = await supabaseAdmin
      .from('professions')
      .select('id, name_zh')
      .eq('id', professionId)
      .single()

    if (fetchError || !existingProfession) {
      return NextResponse.json(
        { success: false, error: '职业不存在' },
        { status: 404 }
      )
    }

    // TODO: Check if profession is used by any tradies
    // This would require checking if there are any tradie_specialties referencing this profession
    // For now, we'll allow deletion but this could be enhanced later

    const { error: deleteError } = await supabaseAdmin
      .from('professions')
      .delete()
      .eq('id', professionId)

    if (deleteError) {
      console.error('Error deleting profession:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '职业删除成功'
    })

  } catch (error) {
    console.error('Profession deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuth(handleProfessionPatch)
export const DELETE = withAdminAuth(handleProfessionDelete)
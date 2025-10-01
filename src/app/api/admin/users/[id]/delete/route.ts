import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AdminUser } from '@/lib/adminAuth'
import { createClient } from '@supabase/supabase-js'

// 创建管理员专用的Supabase客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 删除用户的API - 受保护的管理员功能
async function handleDeleteUser(
  request: NextRequest,
  adminUser: AdminUser,
  context?: { params: Promise<{ id: string }> }
) {
  const params = context?.params ? await context.params : undefined
  const userId = params?.id

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required' },
      { status: 400 }
    )
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    console.log(`Admin ${adminUser.email} attempting to delete user: ${userId}`)

    // 1. 首先获取用户信息以进行日志记录
    const { data: userInfo, error: userError } = await supabaseAdmin
      .from('users')
      .select('name, email, parent_tradie_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user info:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Deleting user: ${userInfo.name} (${userInfo.email})`)

    // 2. 检查用户是否有subordinate tradies，如果有，先清理他们的parent_tradie_id
    let subordinates = null
    if (userInfo.parent_tradie_id === null) {
      // 这是一个主技师，需要处理subordinate tradies
      const { data: subordinatesData } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .eq('parent_tradie_id', userId)

      subordinates = subordinatesData

      if (subordinates && subordinates.length > 0) {
        console.log(`Found ${subordinates.length} subordinate tradies, clearing their parent_tradie_id`)
        
        // 清除subordinate tradies的parent_tradie_id
        const { error: clearSubordinatesError } = await supabaseAdmin
          .from('users')
          .update({ parent_tradie_id: null })
          .eq('parent_tradie_id', userId)

        if (clearSubordinatesError) {
          console.error('Error clearing subordinate tradies:', clearSubordinatesError)
          return NextResponse.json(
            { success: false, error: 'Failed to clear subordinate relationships' },
            { status: 500 }
          )
        }

        console.log('Successfully cleared subordinate relationships')
      }
    }

    // 3. 更新projects表，将user_id和accepted_quote_id设为null
    console.log('Updating projects table...')
    const { error: projectsUpdateError } = await supabaseAdmin
      .from('projects')
      .update({ user_id: null })
      .eq('user_id', userId)

    if (projectsUpdateError) {
      console.error('Error updating projects user_id:', projectsUpdateError)
    }

    // 更新projects表中的accepted_quote_id（如果这个用户的quote被接受）
    const { data: acceptedQuotes } = await supabaseAdmin
      .from('quotes')
      .select('id')
      .eq('tradie_id', userId)

    if (acceptedQuotes && acceptedQuotes.length > 0) {
      const quoteIds = acceptedQuotes.map(q => q.id)
      const { error: projectsQuoteUpdateError } = await supabaseAdmin
        .from('projects')
        .update({ accepted_quote_id: null })
        .in('accepted_quote_id', quoteIds)

      if (projectsQuoteUpdateError) {
        console.error('Error updating projects accepted_quote_id:', projectsQuoteUpdateError)
      }
    }

    // 4. 删除tradie_professions记录
    console.log('Deleting tradie_professions records...')
    const { error: professionsError } = await supabaseAdmin
      .from('tradie_professions')
      .delete()
      .eq('tradie_id', userId)

    if (professionsError) {
      console.error('Error deleting tradie_professions:', professionsError)
    }

    // 5. 删除quotes记录
    console.log('Deleting quotes records...')
    const { error: quotesError } = await supabaseAdmin
      .from('quotes')
      .delete()
      .eq('tradie_id', userId)

    if (quotesError) {
      console.error('Error deleting quotes:', quotesError)
    }

    // 6. 删除reviews记录（作为tradie或owner的）
    console.log('Deleting reviews records...')
    const { error: reviewsError1 } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('tradie_id', userId)

    const { error: reviewsError2 } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('owner_id', userId)

    if (reviewsError1 || reviewsError2) {
      console.error('Error deleting reviews:', reviewsError1 || reviewsError2)
    }

    // 7. 删除user_roles记录
    console.log('Deleting user_roles records...')
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (rolesError) {
      console.error('Error deleting user_roles:', rolesError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete user roles' },
        { status: 500 }
      )
    }

    // 8. 删除users表记录
    console.log('Deleting users table record...')
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (usersError) {
      console.error('Error deleting users record:', usersError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete user record' },
        { status: 500 }
      )
    }

    // 9. 最后删除Supabase Authentication记录
    console.log('Deleting authentication record...')
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete authentication record' },
        { status: 500 }
      )
    }

    console.log(`Successfully deleted user: ${userInfo.name} (${userInfo.email})`)

    return NextResponse.json({
      success: true,
      message: `用户 ${userInfo.name} (${userInfo.email}) 已完全删除`,
      details: {
        deletedUser: userInfo.name,
        deletedEmail: userInfo.email,
        clearedSubordinates: subordinates?.length || 0
      }
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during user deletion' },
      { status: 500 }
    )
  }
}

// Export protected DELETE handler
export const DELETE = withAdminAuth(handleDeleteUser)

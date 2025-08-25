import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// 查找缺失专业信息的tradie用户
export async function GET() {
  try {
    // 1. 先获取所有有专业信息的tradie用户ID
    const { data: existingProfessions, error: profError } = await supabase
      .from('tradie_professions')
      .select('tradie_id')

    if (profError) {
      return NextResponse.json({
        success: false,
        error: profError.message
      }, { status: 500 })
    }

    const existingTradieIds = existingProfessions?.map(p => p.tradie_id) || []

    // 2. 获取所有tradie用户，然后过滤出没有专业信息的
    const { data: allTradies, error: tradieError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        company,
        user_roles!inner(role_type)
      `)
      .eq('user_roles.role_type', 'tradie')

    if (tradieError) {
      return NextResponse.json({
        success: false,
        error: tradieError.message
      }, { status: 500 })
    }

    // 3. 过滤出缺失专业信息的用户
    const missingProfessions = allTradies?.filter(user => 
      !existingTradieIds.includes(user.id)
    ) || []

    return NextResponse.json({
      success: true,
      data: missingProfessions
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}

// 删除缺失专业信息的tradie用户
export async function DELETE() {
  try {
    // 1. 先获取所有有专业信息的tradie用户ID
    const { data: existingProfessions, error: profError } = await supabase
      .from('tradie_professions')
      .select('tradie_id')

    if (profError) {
      return NextResponse.json({
        success: false,
        error: profError.message
      }, { status: 500 })
    }

    const existingTradieIds = existingProfessions?.map(p => p.tradie_id) || []

    // 2. 获取所有tradie用户
    const { data: allTradies, error: findError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        user_roles!inner(role_type)
      `)
      .eq('user_roles.role_type', 'tradie')

    if (findError) {
      return NextResponse.json({
        success: false,
        error: findError.message
      }, { status: 500 })
    }

    // 3. 过滤出缺失专业信息的用户
    const usersToDelete = allTradies?.filter(user => 
      !existingTradieIds.includes(user.id)
    ) || []

    if (!usersToDelete || usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "没有需要删除的不完整用户",
        deletedCount: 0
      })
    }

    const userIdsToDelete = usersToDelete.map(u => u.id)
    console.log(`准备删除 ${userIdsToDelete.length} 个不完整的tradie用户`)

    // 2. 删除用户角色记录
    const { error: roleDeleteError } = await supabase
      .from('user_roles')
      .delete()
      .in('user_id', userIdsToDelete)

    if (roleDeleteError) {
      console.error('删除用户角色失败:', roleDeleteError)
      return NextResponse.json({
        success: false,
        error: `删除用户角色失败: ${roleDeleteError.message}`
      }, { status: 500 })
    }

    // 3. 删除用户记录
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .in('id', userIdsToDelete)

    if (userDeleteError) {
      console.error('删除用户失败:', userDeleteError)
      return NextResponse.json({
        success: false,
        error: `删除用户失败: ${userDeleteError.message}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${userIdsToDelete.length} 个不完整的tradie用户`,
      deletedCount: userIdsToDelete.length,
      deletedUsers: usersToDelete.map(u => ({ id: u.id, name: u.name }))
    })

  } catch (error) {
    console.error('清理不完整用户失败:', error)
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
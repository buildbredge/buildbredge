import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

interface TradieImportData {
  website?: string
  address: string
  category_id: string
  profession_id: string
  name: string
  bio?: string
  company?: string
  service_area?: string
  email: string
  phone: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TradieImportData = await request.json()
    const { 
      website, 
      address, 
      category_id, 
      profession_id, 
      name, 
      bio, 
      company, 
      service_area,
      email,
      phone
    } = body

    // 验证必需字段
    if (!name || !address || !category_id || !profession_id || !email || !phone) {
      return NextResponse.json({
        success: false,
        message: "缺少必需字段: name, address, category_id, profession_id, email, phone"
      }, { status: 400 })
    }

    console.log(`开始导入技师: ${name}`)

    // 1. 检查邮箱是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser && !checkError) {
      return NextResponse.json({
        success: false,
        message: "邮箱已存在"
      }, { status: 400 })
    }

    // 2. 验证category_id和profession_id是否存在
    const { data: categoryExists, error: categoryCheckError } = await supabase
      .from('categories')
      .select('id, name_zh, name_en')
      .eq('id', category_id)
      .single()

    if (!categoryExists || categoryCheckError) {
      console.error(`Category查询失败:`, categoryCheckError)
      return NextResponse.json({
        success: false,
        message: `无效的category_id: ${category_id} - ${categoryCheckError?.message || '未找到分类'}`
      }, { status: 400 })
    }

    const { data: professionExists, error: professionCheckError } = await supabase
      .from('professions')
      .select('id, name_zh, name_en, category_id')
      .eq('id', profession_id)
      .single()

    if (!professionExists || professionCheckError) {
      console.error(`Profession查询失败:`, professionCheckError)
      return NextResponse.json({
        success: false,
        message: `无效的profession_id: ${profession_id} - ${professionCheckError?.message || '未找到专业'}`
      }, { status: 400 })
    }

    // 验证profession是否属于指定的category
    if (professionExists.category_id !== category_id) {
      console.error(`Profession不属于指定的Category: profession ${profession_id} 属于 ${professionExists.category_id}, 但期望属于 ${category_id}`)
      return NextResponse.json({
        success: false,
        message: `专业(${professionExists.name_zh})不属于指定分类(${categoryExists.name_zh})`
      }, { status: 400 })
    }

    console.log(`✓ 验证通过 - 分类: ${categoryExists.name_zh}, 专业: ${professionExists.name_zh}`)

    // 3. 生成UUID并插入用户基本信息
    const userId = randomUUID()

    const userInsertData = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address || '',
      website: website || null,
      service_area: service_area || null,
      bio: bio || null,
      company: company || null,
      status: 'approved' as const,
      balance: 0,
      rating: 5.0,
      review_count: 0,
      service_radius: 50, // 默认服务半径50公里
      phone_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: userError } = await supabase
      .from('users')
      .insert(userInsertData)

    if (userError) {
      console.error('插入用户失败:', userError)
      return NextResponse.json({
        success: false,
        message: `插入用户失败: ${userError?.message || '未知错误'}`
      }, { status: 500 })
    }

    console.log(`✓ 用户插入成功，ID: ${userId}`)

    // 4. 插入用户角色信息
    const roleInsertData = {
      user_id: userId,
      role_type: 'tradie' as const,
      is_primary: true,
      created_at: new Date().toISOString()
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert(roleInsertData)

    if (roleError) {
      console.error('插入用户角色失败:', roleError)
      // 如果角色插入失败，尝试删除已创建的用户
      await supabase.from('users').delete().eq('id', userId)
      return NextResponse.json({
        success: false,
        message: `插入用户角色失败: ${roleError.message}`
      }, { status: 500 })
    }

    console.log(`✓ 用户角色插入成功`)

    // 5. 插入技师专业信息
    const professionInsertData = {
      tradie_id: userId,
      category_id: category_id,
      profession_id: profession_id,
      created_at: new Date().toISOString()
    }

    const { error: professionError } = await supabase
      .from('tradie_professions')
      .insert(professionInsertData)

    if (professionError) {
      console.error('插入技师专业信息失败:', professionError)
      console.error('插入数据:', professionInsertData)
      
      // 如果专业信息插入失败，尝试清理已创建的数据
      console.log('清理已创建的用户数据...')
      await supabase.from('user_roles').delete().eq('user_id', userId)
      await supabase.from('users').delete().eq('id', userId)
      
      return NextResponse.json({
        success: false,
        message: `插入技师专业信息失败: ${professionError.message}`
      }, { status: 500 })
    }

    console.log(`✓ 技师专业信息插入成功`)
    console.log(`✓ 技师 ${name} 导入完成`)

    return NextResponse.json({
      success: true,
      message: "技师数据导入成功",
      userId: userId
    })

  } catch (error) {
    console.error('批量导入API错误:', error)
    return NextResponse.json({
      success: false,
      message: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`
    }, { status: 500 })
  }
}
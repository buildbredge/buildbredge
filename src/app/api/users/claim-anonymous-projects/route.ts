import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

// POST /api/users/claim-anonymous-projects - 用户登录后认领匿名项目
export async function POST(request: NextRequest) {
  try {
    const { user_id, project_id, project_ids } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing required field: user_id" },
        { status: 400 }
      )
    }

    // 验证用户存在
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    let projectsToUpdate = []
    let targetProjectIds = []

    if (project_id) {
      // 认领单个项目
      targetProjectIds = [project_id]
    } else if (project_ids && Array.isArray(project_ids) && project_ids.length > 0) {
      // 认领多个项目
      targetProjectIds = project_ids
    } else {
      return NextResponse.json(
        { error: "Must specify either project_id or project_ids array" },
        { status: 400 }
      )
    }

    console.log(`🔍 Looking for projects with email: ${userData.email}, IDs: ${targetProjectIds}`)
    
    // 验证这些项目存在且是匿名的（属于该用户邮箱但user_id为null）
    const { data: selectedProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id, description, created_at, email, user_id')
      .eq('email', userData.email)
      .is('user_id', null)
      .in('id', targetProjectIds)

    if (fetchError) {
      console.error("Error fetching projects:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      )
    }

    projectsToUpdate = selectedProjects || []
    console.log(`📋 Found ${projectsToUpdate.length} projects to update`)

    // 检查是否所有请求的项目都找到了
    if (projectsToUpdate.length !== targetProjectIds.length) {
      const foundIds = projectsToUpdate.map(p => p.id)
      const notFoundIds = targetProjectIds.filter(id => !foundIds.includes(id))
      console.log(`❌ Some projects not claimable: ${notFoundIds.join(', ')}`)
      
      return NextResponse.json(
        { error: `Projects not found or not claimable: ${notFoundIds.join(', ')}` },
        { status: 404 }
      )
    }

    if (projectsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No projects to claim",
        claimedCount: 0,
        projects: []
      })
    }

    // 更新这些项目的user_id
    const projectIds = projectsToUpdate.map(p => p.id)
    console.log(`🔄 Updating projects with user_id: ${user_id}, project_ids: ${projectIds}`)
    
    // 在更新前再次检查项目状态
    const { data: preUpdateCheck, error: preCheckError } = await supabase
      .from('projects')
      .select('id, user_id, email')
      .in('id', projectIds)
      .eq('email', userData.email)

    if (preCheckError) {
      console.error("Error in pre-update check:", preCheckError)
    } else {
      console.log(`🔍 Pre-update check results:`, preUpdateCheck)
      const alreadyClaimed = preUpdateCheck?.filter(p => p.user_id !== null) || []
      if (alreadyClaimed.length > 0) {
        console.log(`⚠️ Some projects already claimed:`, alreadyClaimed)
      }
    }
    
    // 构建更新查询并记录详细信息
    console.log(`🔧 Building update query with conditions:`)
    console.log(`   - project IDs: [${projectIds.join(', ')}]`)
    console.log(`   - email: ${userData.email}`)
    console.log(`   - user_id must be null`)
    console.log(`   - setting user_id to: ${user_id}`)
    
    const updateData = {
      user_id: user_id,
      updated_at: new Date().toISOString()
    }
    console.log(`   - update data:`, updateData)

    // 检查环境变量
    console.log(`🔑 Environment check:`)
    console.log(`   - SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING'}`)
    console.log(`   - SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS' : 'MISSING'}`)
    
    let updateQuery
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`❌ SUPABASE_SERVICE_ROLE_KEY is missing, falling back to regular client`)
      // 使用普通客户端
      updateQuery = supabase
        .from('projects')
        .update(updateData)
        .in('id', projectIds)
        .eq('email', userData.email)
        .is('user_id', null)
        .select('id, description')
    } else {
      console.log(`✅ Using service role key for update`)
      
      // 使用service role client进行更新（绕过RLS限制）
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // 测试service role连接
      const { data: testData, error: testError } = await serviceSupabase
        .from('projects')
        .select('id')
        .limit(1)
      
      console.log(`🧪 Service role test:`, { testData: testData?.length, testError })
      
      if (testError) {
        console.log(`❌ Service role failed, falling back to regular client`)
        // 回退到普通客户端
        updateQuery = supabase
          .from('projects')
          .update(updateData)
          .in('id', projectIds)
          .eq('email', userData.email)
          .is('user_id', null)
          .select('id, description')
      } else {
        // 使用service role
        updateQuery = serviceSupabase
          .from('projects')
          .update(updateData)
          .in('id', projectIds)
          .eq('email', userData.email)
          .is('user_id', null)
          .select('id, description')
      }
    }

    console.log(`🗃️ Generated SQL Query:`)
    console.log(`UPDATE projects`)
    console.log(`SET user_id = '${user_id}', updated_at = '${updateData.updated_at}'`)
    console.log(`WHERE id IN ('${projectIds.join("', '")}')`)
    console.log(`  AND email = '${userData.email}'`)
    console.log(`  AND user_id IS NULL;`)
    
    // 在执行更新前，检查项目的实际状态
    const { data: actualProjectData } = await supabase
      .from('projects')
      .select('id, email, user_id, status, created_at, updated_at')
      .eq('id', projectIds[0])
      .single()
    
    console.log(`🔍 Actual project data in DB:`, actualProjectData)
    
    if (actualProjectData) {
      console.log(`📋 Project status check:`)
      console.log(`   - ID matches: ${actualProjectData.id === projectIds[0]}`)
      console.log(`   - Email matches: ${actualProjectData.email === userData.email}`)
      console.log(`   - user_id is null: ${actualProjectData.user_id === null}`)
      console.log(`   - Current user_id: ${actualProjectData.user_id}`)
      console.log(`   - Current email: ${actualProjectData.email}`)
    }

    const { data: updatedProjects, error: updateError } = await updateQuery

    if (updateError) {
      console.error("Error claiming anonymous projects:", updateError)
      console.error("Error details:", updateError.details, updateError.hint, updateError.code)
      return NextResponse.json(
        { error: `Failed to claim anonymous projects: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log(`🔧 Update query result (using service role):`, { updatedProjects, updateError })

    // 验证更新是否成功
    console.log(`✅ Updated ${updatedProjects?.length || 0} projects:`, updatedProjects)
    
    if (!updatedProjects || updatedProjects.length === 0) {
      console.log(`❌ Update failed - no projects were updated`)
      
      // 提供更具体的错误信息
      const { data: currentProjectStatus } = await supabase
        .from('projects')
        .select('id, user_id, email, updated_at')
        .in('id', projectIds)

      console.log(`🔍 Post-update: Current status of requested projects:`, currentProjectStatus)
      
      const alreadyClaimed = currentProjectStatus?.filter(p => p.user_id !== null) || []
      const wrongEmail = currentProjectStatus?.filter(p => p.email !== userData.email) || []
      
      console.log(`🔍 Post-update analysis:`)
      console.log(`   - Total projects found: ${currentProjectStatus?.length || 0}`)
      console.log(`   - Already claimed: ${alreadyClaimed.length}`)
      console.log(`   - Wrong email: ${wrongEmail.length}`)
      console.log(`   - Projects that should have been updated:`, 
        currentProjectStatus?.filter(p => p.user_id === null && p.email === userData.email))
      
      // 检查是否有项目在我们检查后被其他进程声明了
      const recentlyUpdated = currentProjectStatus?.filter(p => {
        const updatedAt = new Date(p.updated_at)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        return updatedAt > fiveMinutesAgo && p.user_id !== null
      }) || []
      
      console.log(`⏰ Recently updated projects (last 5 min): ${recentlyUpdated.length}`, recentlyUpdated)
      
      let detailedError = "No projects were updated. "
      if (alreadyClaimed.length > 0) {
        detailedError += `${alreadyClaimed.length} project(s) already claimed. `
      }
      if (wrongEmail.length > 0) {
        detailedError += `${wrongEmail.length} project(s) belong to different email. `
      }
      if (currentProjectStatus?.length === 0) {
        detailedError += "Projects not found in database. "
      }
      if (recentlyUpdated.length > 0) {
        detailedError += `${recentlyUpdated.length} project(s) were claimed by another process recently. `
      }

      return NextResponse.json(
        { error: detailedError },
        { status: 400 }
      )
    }

    // 发送认领成功通知邮件
    try {
      const projectTitles = projectsToUpdate.map(p => p.description)
      
      await smtpEmailService.sendAnonymousProjectClaimNotification({
        to: userData.email,
        projectCount: projectsToUpdate.length,
        projectTitles: projectTitles
      })
      
      console.log(`✅ Anonymous project claim notification sent to ${userData.email}`)
    } catch (emailError) {
      console.error("❌ Failed to send claim notification email:", emailError)
      // 不让邮件错误影响认领成功
    }

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${projectsToUpdate.length} projects`,
      claimedCount: projectsToUpdate.length,
      projects: projectsToUpdate.map(p => ({
        id: p.id,
        description: p.description,
        created_at: p.created_at
      }))
    })

  } catch (error) {
    console.error("Error in claim anonymous projects API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/users/claim-anonymous-projects?email=xxx - 获取匿名项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      )
    }

    // 查找该邮箱的匿名项目详细信息
    const { data: anonymousProjects, error } = await supabase
      .from('projects')
      .select(`
        id,
        description,
        status,
        location,
        created_at,
        categories!inner(name_zh),
        professions!inner(name_zh)
      `)
      .eq('email', email)
      .is('user_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching anonymous projects:", error)
      return NextResponse.json(
        { error: "Failed to fetch anonymous projects" },
        { status: 500 }
      )
    }

    // 格式化项目数据
    const formattedProjects = (anonymousProjects || []).map(project => {
      const categoryName = Array.isArray(project.categories) 
        ? (project.categories[0] as any)?.name_zh || '未分类'
        : (project.categories as any)?.name_zh || '未分类'
      
      const professionName = Array.isArray(project.professions)
        ? (project.professions[0] as any)?.name_zh || '未指定'
        : (project.professions as any)?.name_zh || '未指定'

      return {
        id: project.id,
        title: categoryName,
        description: project.description,
        status: project.status,
        category: categoryName,
        profession: professionName,
        location: project.location,
        createdAt: project.created_at
      }
    })

    return NextResponse.json({
      email: email,
      anonymousProjectCount: formattedProjects.length,
      projects: formattedProjects
    })

  } catch (error) {
    console.error("Error in count anonymous projects API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 获取业主统计
    const { data: owners, error: ownersError } = await supabase
      .from('owners')
      .select('id, status, created_at')

    if (ownersError) throw ownersError

    // 获取技师统计
    const { data: tradies, error: tradiesError } = await supabase
      .from('tradies')
      .select('id, status, created_at')

    if (tradiesError) throw tradiesError

    // 获取项目统计
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, user_id, status, created_at')

    if (projectsError) throw projectsError

    // 计算统计数据
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 业主统计
    const ownersStats = {
      total: owners?.length || 0,
      pending: owners?.filter(o => o.status === 'pending').length || 0,
      approved: owners?.filter(o => o.status === 'approved').length || 0,
      closed: owners?.filter(o => o.status === 'closed').length || 0,
      thisMonth: owners?.filter(o => new Date(o.created_at) >= thisMonth).length || 0,
      lastMonth: owners?.filter(o => 
        new Date(o.created_at) >= lastMonth && 
        new Date(o.created_at) < thisMonth
      ).length || 0
    }

    // 技师统计
    const tradiesStats = {
      total: tradies?.length || 0,
      pending: tradies?.filter(t => t.status === 'pending').length || 0,
      approved: tradies?.filter(t => t.status === 'approved').length || 0,
      closed: tradies?.filter(t => t.status === 'closed').length || 0,
      thisMonth: tradies?.filter(t => new Date(t.created_at) >= thisMonth).length || 0,
      lastMonth: tradies?.filter(t => 
        new Date(t.created_at) >= lastMonth && 
        new Date(t.created_at) < thisMonth
      ).length || 0
    }

    // 项目统计
    const projectsStats = {
      total: projects?.length || 0,
      published: projects?.filter(p => p.status === 'published').length || 0,
      completed: projects?.filter(p => p.status === 'completed').length || 0,
      cancelled: projects?.filter(p => p.status === 'cancelled').length || 0,
      thisMonth: projects?.filter(p => new Date(p.created_at) >= thisMonth).length || 0,
      lastMonth: projects?.filter(p => 
        new Date(p.created_at) >= lastMonth && 
        new Date(p.created_at) < thisMonth
      ).length || 0
    }

    // 活跃用户统计（有发帖的用户）
    const activeUserIds = new Set(projects?.map(p => p.user_id) || [])
    const activeOwners = owners?.filter(o => activeUserIds.has(o.id)) || []
    const activeTradies = tradies?.filter(t => activeUserIds.has(t.id)) || []

    // 用户注册趋势（过去12个月）
    const registrationTrend = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthOwners = owners?.filter(o => {
        const createdAt = new Date(o.created_at)
        return createdAt >= monthStart && createdAt < monthEnd
      }).length || 0
      
      const monthTradies = tradies?.filter(t => {
        const createdAt = new Date(t.created_at)
        return createdAt >= monthStart && createdAt < monthEnd
      }).length || 0

      registrationTrend.push({
        month: monthStart.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
        owners: monthOwners,
        tradies: monthTradies,
        total: monthOwners + monthTradies
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: ownersStats.total + tradiesStats.total,
          totalOwners: ownersStats.total,
          totalTradies: tradiesStats.total,
          totalProjects: projectsStats.total,
          activeUsers: activeOwners.length + activeTradies.length,
          pendingUsers: ownersStats.pending + tradiesStats.pending,
          thisMonthNewUsers: ownersStats.thisMonth + tradiesStats.thisMonth,
          lastMonthNewUsers: ownersStats.lastMonth + tradiesStats.lastMonth
        },
        owners: ownersStats,
        tradies: tradiesStats,
        projects: projectsStats,
        activity: {
          activeOwners: activeOwners.length,
          activeTradies: activeTradies.length,
          inactiveOwners: ownersStats.total - activeOwners.length,
          inactiveTradies: tradiesStats.total - activeTradies.length
        },
        trends: {
          registration: registrationTrend
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("获取用户统计失败:", error)
    return NextResponse.json({
      success: false,
      error: "获取用户统计失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
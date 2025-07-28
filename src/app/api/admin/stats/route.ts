import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

// Admin dashboard statistics API
export async function GET() {
  try {
    console.log('Fetching admin dashboard statistics...')

    // Get user statistics (owners + tradies)
    const { data: owners, error: ownersError } = await supabase
      .from('owners')
      .select('id, status, created_at')

    const { data: tradies, error: tradiesError } = await supabase
      .from('tradies')  
      .select('id, status, created_at')

    if (ownersError || tradiesError) {
      console.error('Error fetching users:', ownersError || tradiesError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Get project statistics
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, status, created_at')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json(
        { error: 'Failed to fetch project data' },
        { status: 500 }
      )
    }

    // Get review statistics
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, created_at')

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    // Calculate statistics
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // User statistics
    const totalOwners = owners?.length || 0
    const totalTradies = tradies?.length || 0
    const totalUsers = totalOwners + totalTradies

    const activeOwners = owners?.filter(o => o.status === 'approved').length || 0
    const activeTradies = tradies?.filter(t => t.status === 'approved').length || 0
    const activeUsers = activeOwners + activeTradies

    const newOwnersThisMonth = owners?.filter(o => 
      new Date(o.created_at) >= thisMonth
    ).length || 0
    
    const newTradiesThisMonth = tradies?.filter(t => 
      new Date(t.created_at) >= thisMonth
    ).length || 0
    
    const newUsersThisMonth = newOwnersThisMonth + newTradiesThisMonth

    const newUsersLastMonth = owners?.filter(o => 
      new Date(o.created_at) >= lastMonth && new Date(o.created_at) < thisMonth
    ).length || 0 + tradies?.filter(t => 
      new Date(t.created_at) >= lastMonth && new Date(t.created_at) < thisMonth
    ).length || 0

    // Project statistics
    const totalProjects = projects?.length || 0
    const activeProjects = projects?.filter(p => 
      p.status === 'published' || p.status === 'in_progress'
    ).length || 0
    
    const completedProjects = projects?.filter(p => 
      p.status === 'completed'
    ).length || 0

    const newProjectsThisMonth = projects?.filter(p => 
      new Date(p.created_at) >= thisMonth
    ).length || 0

    const newProjectsLastMonth = projects?.filter(p => 
      new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth
    ).length || 0

    // Review statistics
    const totalReviews = reviews?.length || 0
    const avgRating = reviews?.length ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

    // Calculate growth rates
    const userGrowthRate = newUsersLastMonth > 0 ? 
      ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100) : 
      (newUsersThisMonth > 0 ? 100 : 0)

    const projectGrowthRate = newProjectsLastMonth > 0 ? 
      ((newProjectsThisMonth - newProjectsLastMonth) / newProjectsLastMonth * 100) : 
      (newProjectsThisMonth > 0 ? 100 : 0)

    // Estimated revenue (mock calculation based on projects)
    const estimatedRevenuePerProject = 50 // Assuming $50 average commission per project
    const totalRevenue = completedProjects * estimatedRevenuePerProject

    const stats = {
      // User stats
      totalUsers,
      activeUsers,
      totalOwners,
      totalTradies,
      activeOwners,
      activeTradies,
      newUsersThisMonth,
      userGrowthRate: Math.round(userGrowthRate * 10) / 10,

      // Project stats  
      totalProjects,
      activeProjects,
      completedProjects,
      newProjectsThisMonth,
      projectGrowthRate: Math.round(projectGrowthRate * 10) / 10,

      // Business stats
      totalRevenue,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      
      // Monthly growth (overall)
      monthlyGrowth: Math.round(((userGrowthRate + projectGrowthRate) / 2) * 10) / 10
    }

    console.log('Dashboard stats calculated:', stats)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate statistics: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

// Admin dashboard statistics API
export async function GET() {
  try {
    console.log('Fetching admin dashboard statistics...')

    // Get user statistics from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, status, created_at')

    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role_type, created_at')

    if (usersError || rolesError) {
      console.error('Error fetching users:', usersError || rolesError)
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
    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => u.status === 'approved').length || 0
    
    const ownerRoles = userRoles?.filter(r => r.role_type === 'owner') || []
    const tradieRoles = userRoles?.filter(r => r.role_type === 'tradie') || []
    
    const totalOwners = ownerRoles.length
    const totalTradies = tradieRoles.length

    // Project statistics
    const totalProjects = projects?.length || 0
    const activeProjects = projects?.filter(p => 
      p.status === 'published' || p.status === 'in_progress'
    ).length || 0
    
    const completedProjects = projects?.filter(p => 
      p.status === 'completed'
    ).length || 0

    // Review statistics
    const totalReviews = reviews?.length || 0
    const avgRating = reviews?.length ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

    const stats = {
      // User stats  
      totalUsers,
      activeUsers,
      totalOwners,
      totalTradies,
      activeOwners: totalOwners, // Simplified
      activeTradies: totalTradies, // Simplified
      
      // Project stats
      totalProjects,
      activeProjects,
      completedProjects,
      
      // Business stats
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      totalRevenue: completedProjects * 50 // Simplified calculation
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
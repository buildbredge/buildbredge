import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { withAdminAuth, AdminUser } from '@/lib/adminAuth'

// Admin projects list API with pagination and filtering - Protected
async function handleProjectsListRequest(request: NextRequest, adminUser: AdminUser) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') 
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    console.log('Fetching projects list with filters:', { page, limit, status, search })

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        id,
        description,
        location,
        detailed_description,
        email,
        phone,
        status,
        created_at,
        updated_at,
        user_id,
        images,
        video
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`description.ilike.%${search}%,location.ilike.%${search}%,email.ilike.%${search}%)`)
    }

    // Execute query with pagination
    const { data: projects, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects: ' + error.message },
        { status: 500 }
      )
    }

    // Get user details for projects (owners)
    const userIds = [...new Set(projects?.map(p => p.email).filter(Boolean))]
    
    let userDetails: Record<string, any> = {}
    
    if (userIds.length > 0) {
      // Try to get owner details by email
      const { data: owners } = await supabase
        .from('owners')
        .select('email, name, phone')
        .in('email', userIds)

      if (owners) {
        owners.forEach(owner => {
          userDetails[owner.email] = {
            name: owner.name,
            phone: owner.phone
          }
        })
      }
    }

    // Transform projects data
    const transformedProjects = projects?.map(project => ({
      id: project.id,
      title: project.description.substring(0, 50) + (project.description.length > 50 ? '...' : ''),
      description: project.description,
      category: 'General', // Could be derived from category_id if available
      location: project.location,
      budget: 'Not specified', // Budget field doesn't exist in current schema
      urgency: 'Normal', // Urgency field doesn't exist in current schema  
      status: project.status || 'published',
      userId: project.user_id || project.email,
      userName: userDetails[project.email]?.name || 'Unknown User',
      userEmail: project.email,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      responses: 0, // Would need separate query to count responses
      selectedTradie: null, // Would need additional logic
      images: project.images || [],
      video: project.video,
      phone: project.phone,
      detailedDescription: project.detailed_description
    })) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    const response = {
      success: true,
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: offset + limit < (totalCount || 0),
        hasPrev: page > 1
      },
      filters: {
        status,
        search
      },
      timestamp: new Date().toISOString()
    }

    console.log(`Returning ${transformedProjects.length} projects out of ${totalCount} total`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin projects list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// Export protected GET handler  
export const GET = withAdminAuth(handleProjectsListRequest)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

// Admin users list API with pagination and filtering - updated for users/user_roles schema
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userType = searchParams.get('userType') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    console.log('Fetching users list with filters:', { page, limit, userType, status, search })

    // Build base query for users
    let usersQuery = supabase
      .from('users')
      .select(`
        id, name, email, phone, address, status, created_at, updated_at,
        user_roles!inner(role_type, is_primary)
      `)

    // Apply status filter
    if (status !== 'all') {
      usersQuery = usersQuery.eq('status', status)
    }

    // Apply search filter
    if (search) {
      usersQuery = usersQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role type filter
    if (userType !== 'all') {
      const roleType = userType === 'homeowner' ? 'owner' : 'tradie'
      usersQuery = usersQuery.eq('user_roles.role_type', roleType)
    }

    const { data: users, error: usersError } = await usersQuery
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users: ' + usersError.message },
        { status: 500 }
      )
    }

    // Transform data to unified format
    const transformedUsers = (users || []).map(user => {
      const primaryRole = user.user_roles.find(r => r.is_primary) || user.user_roles[0]
      const userTypeLabel = primaryRole?.role_type === 'owner' ? 'homeowner' : 'tradie'
      
      return {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        phone: user.phone || 'N/A',
        userType: userTypeLabel,
        location: user.address || 'Not specified',
        joinDate: user.created_at,
        status: user.status,
        lastLogin: user.updated_at, // Approximation
        projectsCount: 0, // Would need separate query
        totalSpent: 0, // Would need calculation from projects
        rating: null, // Would need calculation from reviews
        company: null, // Not stored in users table currently
        roles: user.user_roles.map(r => r.role_type)
      }
    })

    // Apply pagination
    const paginatedUsers = transformedUsers.slice(offset, offset + limit)

    const response = {
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: transformedUsers.length,
        totalPages: Math.ceil(transformedUsers.length / limit),
        hasNext: offset + limit < transformedUsers.length,
        hasPrev: page > 1
      },
      filters: {
        userType,
        status,
        search
      },
      timestamp: new Date().toISOString()
    }

    console.log(`Returning ${paginatedUsers.length} users out of ${transformedUsers.length} total`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

// Admin users list API with pagination and filtering
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

    // Fetch owners
    let ownersQuery = supabase
      .from('owners')
      .select('id, name, email, phone, status, created_at, updated_at, address, balance')

    if (status !== 'all') {
      ownersQuery = ownersQuery.eq('status', status)
    }

    if (search) {
      ownersQuery = ownersQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Fetch tradies  
    let tradiesQuery = supabase
      .from('tradies')
      .select('id, name, email, phone, company, specialty, status, created_at, updated_at, address, balance, rating, review_count')

    if (status !== 'all') {
      tradiesQuery = tradiesQuery.eq('status', status)
    }

    if (search) {
      tradiesQuery = tradiesQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    let owners: any[] = []
    let tradies: any[] = []

    if (userType === 'all' || userType === 'homeowner') {
      const { data: ownersData, error: ownersError } = await ownersQuery
      if (ownersError) {
        console.error('Error fetching owners:', ownersError)
      } else {
        owners = ownersData || []
      }
    }

    if (userType === 'all' || userType === 'tradie') {
      const { data: tradiesData, error: tradiesError } = await tradiesQuery
      if (tradiesError) {
        console.error('Error fetching tradies:', tradiesError)  
      } else {
        tradies = tradiesData || []
      }
    }

    // Transform data to unified format
    const transformedOwners = owners.map(owner => ({
      id: owner.id,
      name: owner.name || 'Unknown',
      email: owner.email,
      phone: owner.phone || 'N/A',
      userType: 'homeowner' as const,
      location: owner.address || 'Not specified',
      joinDate: owner.created_at,
      status: owner.status,
      lastLogin: owner.updated_at, // Approximation
      projectsCount: 0, // Would need separate query
      totalSpent: owner.balance || 0,
      rating: null,
      company: null,
      specialty: null
    }))

    const transformedTradies = tradies.map(tradie => ({
      id: tradie.id,
      name: tradie.name || 'Unknown',
      email: tradie.email,
      phone: tradie.phone || 'N/A',
      userType: 'tradie' as const,
      location: tradie.address || 'Not specified',
      joinDate: tradie.created_at,
      status: tradie.status,
      lastLogin: tradie.updated_at, // Approximation
      projectsCount: 0, // Would need separate query
      totalSpent: null,
      rating: tradie.rating,
      company: tradie.company,
      specialty: tradie.specialty
    }))

    // Combine and sort by creation date
    const allUsers = [...transformedOwners, ...transformedTradies]
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

    // Apply pagination
    const paginatedUsers = allUsers.slice(offset, offset + limit)

    const response = {
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: allUsers.length,
        totalPages: Math.ceil(allUsers.length / limit),
        hasNext: offset + limit < allUsers.length,
        hasPrev: page > 1
      },
      filters: {
        userType,
        status,
        search
      },
      timestamp: new Date().toISOString()
    }

    console.log(`Returning ${paginatedUsers.length} users out of ${allUsers.length} total`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
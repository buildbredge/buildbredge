import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMockServices } from '@/lib/mockData'

// TypeScript interfaces for API responses

interface ErrorResponse {
  error: string
  code?: string
  timestamp: string
}

// Create Supabase client with proper service role key for server-side operations
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Use service role key if available for better permissions
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  // Fallback to anon key if service role key is not available
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    
    // Optimized single query with join to fetch categories and professions together
    const { data: categoriesWithProfessions, error } = await supabase
      .from('categories')
      .select(`
        id,
        name_en,
        name_zh,
        description,
        created_at,
        professions:professions(
          id,
          category_id,
          name_en,
          name_zh,
          icon,
          description
        )
      `)
      .order('created_at')
    
    // Handle database table not existing (common during development)
    if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
      console.warn('Database tables do not exist, returning mock data')
      
      const mockData = getMockServices()
      
      return NextResponse.json(mockData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'Content-Type': 'application/json',
          'X-Data-Source': 'mock'
        }
      })
    }
    
    // Handle other database errors
    if (error) {
      console.error('Database error occurred:', error.code, error.message)
      
      const mockData = getMockServices()
      
      return NextResponse.json(mockData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
          'Content-Type': 'application/json',
          'X-Data-Source': 'mock-fallback'
        }
      })
    }
    
    // Handle empty results
    if (!categoriesWithProfessions || categoriesWithProfessions.length === 0) {
      console.warn('No categories found in database, returning mock data')
      
      const mockData = getMockServices()
      
      return NextResponse.json(mockData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'Content-Type': 'application/json',
          'X-Data-Source': 'mock-empty'
        }
      })
    }
    
    // Successfully retrieved data from database
    return NextResponse.json(categoriesWithProfessions, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200',
        'Content-Type': 'application/json',
        'X-Data-Source': 'database'
      }
    })
    
  } catch (error) {
    // Log error for debugging but don't expose internal details to client
    console.error('Services API error:', error)
    
    // Return mock data as final fallback
    const mockData = getMockServices()
    
    return NextResponse.json(mockData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'Content-Type': 'application/json',
        'X-Data-Source': 'mock-error-fallback'
      }
    })
  }
}

// Add error handling for unsupported HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed', timestamp: new Date().toISOString() } satisfies ErrorResponse,
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', timestamp: new Date().toISOString() } satisfies ErrorResponse,
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', timestamp: new Date().toISOString() } satisfies ErrorResponse,
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}
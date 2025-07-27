import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name_en: string
          name_zh: string
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_zh: string
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_zh?: string
        }
      }
      professions: {
        Row: {
          id: string
          category_id: string
          name_en: string
          name_zh: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_en: string
          name_zh: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name_en?: string
          name_zh?: string
        }
      }
      tradie_professions: {
        Row: {
          id: string
          tradie_id: string
          profession_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tradie_id: string
          profession_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tradie_id?: string
          profession_id?: string
        }
      }
      owners: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string
          status: 'pending' | 'approved' | 'closed'
          balance: number
          latitude: number | null
          longitude: number | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          phone?: string | null
          email: string
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
        }
      }
      tradies: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string
          company: string | null
          specialty: string | null
          status: 'pending' | 'approved' | 'closed'
          balance: number
          latitude: number | null
          longitude: number | null
          address: string | null
          service_radius: number
          rating: number | null
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          phone?: string | null
          email: string
          company?: string | null
          specialty?: string | null
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          service_radius?: number
          rating?: number | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string
          company?: string | null
          specialty?: string | null
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          service_radius?: number
          rating?: number | null
          review_count?: number
        }
      }
      projects: {
        Row: {
          id: string
          description: string
          location: string
          latitude: number | null
          longitude: number | null
          detailed_description: string | null
          email: string
          phone: string | null
          images: string[]
          video: string | null
          status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          user_id: string | null
          category_id: string | null
          profession_id: string | null
          other_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          location: string
          latitude?: number | null
          longitude?: number | null
          detailed_description?: string | null
          email: string
          phone?: string | null
          images?: string[]
          video?: string | null
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          user_id?: string | null
          category_id?: string | null
          profession_id?: string | null
          other_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          detailed_description?: string | null
          email?: string
          phone?: string | null
          images?: string[]
          video?: string | null
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          user_id?: string
          category_id?: string | null
          profession_id?: string | null
          other_description?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          owner_id: string
          tradie_id: string
          rating: number
          comment: string | null
          images: string[]
          video: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          owner_id: string
          tradie_id: string
          rating: number
          comment?: string | null
          images?: string[]
          video?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          owner_id?: string
          tradie_id?: string
          rating?: number
          comment?: string | null
          images?: string[]
          video?: string | null
          is_approved?: boolean
        }
      }
    }
    Views: {
      tradie_stats: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string
          company: string | null
          specialty: string | null
          status: 'pending' | 'approved' | 'closed'
          balance: number
          latitude: number | null
          longitude: number | null
          address: string | null
          service_radius: number
          rating: number | null
          review_count: number
          created_at: string
          calculated_rating: number
          calculated_review_count: number
          recent_review_count: number
          distance?: number
        }
      }
    }
  }
}

// Type definitions for location queries and filters
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationQuery extends Coordinates {
  radius?: number
  limit?: number
}

export interface ReviewFilters {
  tradieId?: string
  ownerId?: string
  projectId?: string
  minRating?: number
  maxRating?: number
  isApproved?: boolean
  limit?: number
  offset?: number
}

export interface TradieSearchParams {
  specialty?: string
  location?: LocationQuery
  minRating?: number
  status?: 'pending' | 'approved' | 'closed'
  sortBy?: 'rating' | 'review_count' | 'distance' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

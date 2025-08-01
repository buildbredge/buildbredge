import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions: string[]
          avatar: string | null
          phone: string | null
          department: string | null
          is_active: boolean
          last_login_at: string | null
          login_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: string[]
          avatar?: string | null
          phone?: string | null
          department?: string | null
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: string[]
          avatar?: string | null
          phone?: string | null
          department?: string | null
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number
          created_by?: string | null
          updated_at?: string
        }
      }
      admin_activity_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Record<string, any>
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Record<string, any>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Record<string, any>
          ip_address?: string | null
          user_agent?: string | null
        }
      }
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
      admin_stats: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions: string[]
          avatar: string | null
          phone: string | null
          department: string | null
          is_active: boolean
          last_login_at: string | null
          login_count: number
          created_by: string | null
          created_at: string
          updated_at: string
          total_activities: number
          recent_activities: number
          last_action: string | null
        }
      }
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

// Admin-related type definitions
export type AdminRole = 'super_admin' | 'admin' | 'moderator'

export interface AdminPermissions {
  user_management?: boolean
  project_management?: boolean
  tradie_management?: boolean
  review_management?: boolean
  system_settings?: boolean
  admin_management?: boolean
  activity_logs?: boolean
  database_management?: boolean
  support_tickets?: boolean
  content_moderation?: boolean
}

export interface AdminSession {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: string[]
  avatar?: string | null
  department?: string | null
}

export interface AdminLoginCredentials {
  email: string
  password: string
}

export interface AdminActivityLogData {
  admin_id: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export interface AdminFilters {
  role?: AdminRole
  department?: string
  is_active?: boolean
  created_after?: string
  created_before?: string
  search?: string
  limit?: number
  offset?: number
}

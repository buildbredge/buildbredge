import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
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
        }
        Insert: {
          id: string
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
        }
        Insert: {
          id: string
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
          created_at: string
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
          created_at?: string
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
  }
}

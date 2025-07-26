import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          suburb: string | null
          user_type: 'homeowner' | 'tradie'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          suburb?: string | null
          user_type: 'homeowner' | 'tradie'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          suburb?: string | null
          user_type?: 'homeowner' | 'tradie'
          updated_at?: string
        }
      }
      tradie_profiles: {
        Row: {
          id: string
          company_name: string | null
          specialties: string[] | null
          hourly_rate: number | null
          experience_years: number | null
          verified: boolean
          created_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          specialties?: string[] | null
          hourly_rate?: number | null
          experience_years?: number | null
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          specialties?: string[] | null
          hourly_rate?: number | null
          experience_years?: number | null
          verified?: boolean
        }
      }
    }
  }
}

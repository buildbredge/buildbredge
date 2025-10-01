import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义 - 增强版本
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          description: string
          location: string
          latitude: number | null
          longitude: number | null
          detailed_description: string
          email: string
          phone: string | null
          images: string[]
          video: string | null
          status: 'published' | 'draft' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          user_id: string | null
          time_option: 'urgent' | 'recent' | 'flexible' | null
          priority_need: 'cost' | 'quality' | null
          category_id: string | null
          profession_id: string | null
          other_description: string | null
          accepted_quote_id: string | null
        }
        Insert: {
          id?: string
          description: string
          location: string
          latitude?: number | null
          longitude?: number | null
          detailed_description: string
          email: string
          phone?: string | null
          images?: string[]
          video?: string | null
          status?: 'published' | 'draft' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          user_id?: string | null
          time_option?: 'urgent' | 'recent' | 'flexible' | null
          priority_need?: 'cost' | 'quality' | null
          category_id?: string | null
          profession_id?: string | null
          other_description?: string | null
          accepted_quote_id?: string | null
        }
        Update: {
          id?: string
          description?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          detailed_description?: string
          email?: string
          phone?: string | null
          images?: string[]
          video?: string | null
          status?: 'published' | 'draft' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          user_id?: string | null
          time_option?: 'urgent' | 'recent' | 'flexible' | null
          priority_need?: 'cost' | 'quality' | null
          category_id?: string | null
          profession_id?: string | null
          other_description?: string | null
          accepted_quote_id?: string | null
        }
      }
      users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          address: string | null
          latitude: number | null
          longitude: number | null
          status: 'active' | 'pending' | 'approved' | 'closed' | 'suspended'
          created_at: string
          updated_at: string
          phone_verified: boolean
          phone_verified_at: string | null
          company: string | null
          service_radius: number | null
          balance: number
          rating: number
          review_count: number
          hourly_rate: number | null
          experience_years: number | null
          bio: string | null
          parent_tradie_id: string | null
        }
        Insert: {
          id: string
          name: string
          phone: string
          email: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: 'active' | 'pending' | 'approved' | 'closed' | 'suspended'
          created_at?: string
          updated_at?: string
          phone_verified?: boolean
          phone_verified_at?: string | null
          company?: string | null
          service_radius?: number | null
          balance?: number
          rating?: number
          review_count?: number
          hourly_rate?: number | null
          experience_years?: number | null
          bio?: string | null
          parent_tradie_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: 'active' | 'pending' | 'approved' | 'closed' | 'suspended'
          created_at?: string
          updated_at?: string
          phone_verified?: boolean
          phone_verified_at?: string | null
          company?: string | null
          service_radius?: number | null
          balance?: number
          rating?: number
          review_count?: number
          hourly_rate?: number | null
          experience_years?: number | null
          bio?: string | null
          parent_tradie_id?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_type: 'owner' | 'tradie'
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_type: 'owner' | 'tradie'
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_type?: 'owner' | 'tradie'
          is_primary?: boolean
          created_at?: string
        }
      }
      tradie_certification_submissions: {
        Row: {
          id: string
          user_id: string
          certification_type: 'personal' | 'professional'
          status: 'pending' | 'approved' | 'rejected'
          documents: Array<{
            docType: string
            url: string
            originalName: string
            storagePath?: string
          }>
          metadata: Record<string, any>
          notes: string | null
          rejection_reason: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewer_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_type: 'personal' | 'professional'
          status?: 'pending' | 'approved' | 'rejected'
          documents?: Array<{
            docType: string
            url: string
            originalName: string
            storagePath?: string
          }>
          metadata?: Record<string, any>
          notes?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_type?: 'personal' | 'professional'
          status?: 'pending' | 'approved' | 'rejected'
          documents?: Array<{
            docType: string
            url: string
            originalName: string
            storagePath?: string
          }>
          metadata?: Record<string, any>
          notes?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          owner_id: string
          tradie_id: string
          rating: number
          comment: string
          images: string[]
          video: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          owner_id: string
          tradie_id: string
          rating: number
          comment: string
          images?: string[]
          video?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          owner_id?: string
          tradie_id?: string
          rating?: number
          comment?: string
          images?: string[]
          video?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          project_id: string
          tradie_id: string
          price: number
          description: string
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          tradie_id: string
          price: number
          description: string
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          tradie_id?: string
          price?: number
          description?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          project_id: string
          quote_id: string
          payer_id: string
          tradie_id: string
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          amount: number
          platform_fee: number
          affiliate_fee: number
          tax_amount: number
          net_amount: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          payment_method: string | null
          currency: string
          payment_metadata: Record<string, any>
          failure_reason: string | null
          created_at: string
          confirmed_at: string | null
          failed_at: string | null
          refunded_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          quote_id: string
          payer_id: string
          tradie_id: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          amount: number
          platform_fee?: number
          affiliate_fee?: number
          tax_amount?: number
          net_amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          payment_method?: string | null
          currency?: string
          payment_metadata?: Record<string, any>
          failure_reason?: string | null
          created_at?: string
          confirmed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          quote_id?: string
          payer_id?: string
          tradie_id?: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          amount?: number
          platform_fee?: number
          affiliate_fee?: number
          tax_amount?: number
          net_amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          payment_method?: string | null
          currency?: string
          payment_metadata?: Record<string, any>
          failure_reason?: string | null
          created_at?: string
          confirmed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
        }
      }
      escrow_accounts: {
        Row: {
          id: string
          payment_id: string
          tradie_id: string
          parent_tradie_id: string | null
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          tax_withheld: number
          net_amount: number
          protection_start_date: string
          protection_end_date: string
          protection_days: number
          status: 'held' | 'released' | 'disputed' | 'withdrawn'
          release_trigger: 'manual' | 'automatic' | 'dispute_resolution' | null
          release_notes: string | null
          released_by: string | null
          created_at: string
          released_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          tradie_id: string
          parent_tradie_id?: string | null
          gross_amount: number
          platform_fee?: number
          affiliate_fee?: number
          tax_withheld?: number
          net_amount: number
          protection_start_date?: string
          protection_end_date: string
          protection_days?: number
          status?: 'held' | 'released' | 'disputed' | 'withdrawn'
          release_trigger?: 'manual' | 'automatic' | 'dispute_resolution' | null
          release_notes?: string | null
          released_by?: string | null
          created_at?: string
          released_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          tradie_id?: string
          parent_tradie_id?: string | null
          gross_amount?: number
          platform_fee?: number
          affiliate_fee?: number
          tax_withheld?: number
          net_amount?: number
          protection_start_date?: string
          protection_end_date?: string
          protection_days?: number
          status?: 'held' | 'released' | 'disputed' | 'withdrawn'
          release_trigger?: 'manual' | 'automatic' | 'dispute_resolution' | null
          release_notes?: string | null
          released_by?: string | null
          created_at?: string
          released_at?: string | null
          updated_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          tradie_id: string
          escrow_account_id: string
          requested_amount: number
          tax_deducted: number
          processing_fee: number
          final_amount: number
          bank_details: Record<string, any>
          withdrawal_method: string
          status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'
          reference_number: string | null
          external_transaction_id: string | null
          failure_reason: string | null
          approved_by: string | null
          processed_by: string | null
          requested_at: string
          approved_at: string | null
          processed_at: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          tradie_id: string
          escrow_account_id: string
          requested_amount: number
          tax_deducted?: number
          processing_fee?: number
          final_amount: number
          bank_details: Record<string, any>
          withdrawal_method?: string
          status?: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'
          reference_number?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          approved_by?: string | null
          processed_by?: string | null
          requested_at?: string
          approved_at?: string | null
          processed_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          tradie_id?: string
          escrow_account_id?: string
          requested_amount?: number
          tax_deducted?: number
          processing_fee?: number
          final_amount?: number
          bank_details?: Record<string, any>
          withdrawal_method?: string
          status?: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'
          reference_number?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          approved_by?: string | null
          processed_by?: string | null
          requested_at?: string
          approved_at?: string | null
          processed_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
      affiliate_earnings: {
        Row: {
          id: string
          parent_tradie_id: string
          child_tradie_id: string
          payment_id: string
          escrow_account_id: string
          base_amount: number
          fee_rate: number
          fee_amount: number
          status: 'pending' | 'available' | 'withdrawn' | 'disputed'
          availability_date: string | null
          earned_at: string
          available_at: string | null
          withdrawn_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          parent_tradie_id: string
          child_tradie_id: string
          payment_id: string
          escrow_account_id: string
          base_amount: number
          fee_rate?: number
          fee_amount: number
          status?: 'pending' | 'available' | 'withdrawn' | 'disputed'
          availability_date?: string | null
          earned_at?: string
          available_at?: string | null
          withdrawn_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          parent_tradie_id?: string
          child_tradie_id?: string
          payment_id?: string
          escrow_account_id?: string
          base_amount?: number
          fee_rate?: number
          fee_amount?: number
          status?: 'pending' | 'available' | 'withdrawn' | 'disputed'
          availability_date?: string | null
          earned_at?: string
          available_at?: string | null
          withdrawn_at?: string | null
          updated_at?: string
        }
      }
      system_config: {
        Row: {
          key: string
          value: Record<string, any>
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: Record<string, any>
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Record<string, any>
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      tradie_stats: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          company: string | null
          specialty: string | null
          latitude: number | null
          longitude: number | null
          address: string | null
          service_radius: number | null
          status: 'active' | 'pending' | 'approved' | 'closed' | 'suspended'
          balance: number
          rating: number
          review_count: number
          created_at: string
          updated_at: string
          calculated_rating: number
          calculated_review_count: number
          recent_review_count: number
        }
      }
      tradie_earnings_summary: {
        Row: {
          tradie_id: string
          tradie_name: string
          pending_escrow: number
          available_balance: number
          withdrawn_total: number
          total_payments: number
          active_escrows: number
        }
      }
      affiliate_earnings_summary: {
        Row: {
          parent_tradie_id: string
          parent_tradie_name: string
          subordinate_count: number
          pending_fees: number
          available_fees: number
          withdrawn_fees: number
          total_fees_earned: number
        }
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      calculate_payment_fees: {
        Args: {
          p_amount: number
          p_tradie_id: string
          p_currency?: string
        }
        Returns: {
          platform_fee: number
          affiliate_fee: number
          tax_amount: number
          net_amount: number
          parent_tradie_id: string | null
        }[]
      }
      create_escrow_account: {
        Args: {
          p_payment_id: string
        }
        Returns: string
      }
      release_escrow_funds: {
        Args: {
          p_escrow_id: string
          p_release_trigger?: string
          p_released_by?: string
          p_notes?: string
        }
        Returns: boolean
      }
      process_automatic_escrow_releases: {
        Args: Record<string, never>
        Returns: {
          escrow_id: string
          tradie_id: string
          amount: number
        }[]
      }
    }
  }
}

// 地理位置相关类型
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationData {
  coordinates?: Coordinates
  address?: string
  serviceRadius?: number // 仅适用于技师
}

// 扩展的实体类型（包含关联数据）
export interface ProjectWithLocation {
  id: string
  description: string
  location: string
  latitude: number | null
  longitude: number | null
  detailed_description: string
  email: string
  phone: string | null
  images: string[]
  video: string | null
  status: 'published' | 'draft' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  user_id: string
  distance?: number // 距离当前位置的距离（公里）
  nearbyTradies?: TradieWithStats[] // 附近的技师
}

export interface TradieWithStats {
  id: string
  name: string
  phone: string
  email: string
  company: string
  specialty: string
  latitude: number | null
  longitude: number | null
  address: string | null
  service_radius: number
  status: 'pending' | 'approved' | 'closed'
  balance: number
  rating: number
  review_count: number
  created_at: string
  updated_at: string
  calculated_rating: number
  calculated_review_count: number
  recent_review_count: number
  distance?: number // 距离项目的距离（公里）
  recentReviews?: ReviewWithDetails[] // 最近的评论
}

export interface ReviewWithDetails {
  id: string
  project_id: string
  owner_id: string
  tradie_id: string
  rating: number
  comment: string
  images: string[]
  video: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
  project?: Database['public']['Tables']['projects']['Row']
  owner?: Database['public']['Tables']['users']['Row']
  tradie?: Database['public']['Tables']['users']['Row']
}

// 地理查询参数
export interface LocationQuery {
  latitude: number
  longitude: number
  radius?: number // 搜索半径（公里），默认50
  limit?: number // 结果数量限制，默认20
}

// 评论过滤参数
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

// 技师搜索参数
export interface TradieSearchParams {
  specialty?: string
  location?: LocationQuery
  minRating?: number
  status?: Database['public']['Tables']['users']['Row']['status']
  sortBy?: 'rating' | 'distance' | 'review_count' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

// Tradie hierarchy related types
export interface SubordinateTradie {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  specialty: string | null
  status: string
  created_at: string
  rating: number
  review_count: number
}

export interface ParentTradie {
  id: string
  name: string
  email: string
  company: string | null
  specialty: string | null
}

export interface AddTradieData {
  name: string
  email: string
  password: string
  phone: string
  location: string
  company?: string
  categoryId?: string
  parentTradieId: string
}

export default Database

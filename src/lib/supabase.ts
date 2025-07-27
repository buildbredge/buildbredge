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
        }
      }
      owners: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          latitude: number | null
          longitude: number | null
          address: string | null
          status: 'pending' | 'approved' | 'closed'
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      tradies: {
        Row: {
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
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          company: string
          specialty: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          service_radius?: number
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          company?: string
          specialty?: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          service_radius?: number
          status?: 'pending' | 'approved' | 'closed'
          balance?: number
          rating?: number
          review_count?: number
          created_at?: string
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
    }
    Views: {
      tradie_stats: {
        Row: {
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
  owner?: Database['public']['Tables']['owners']['Row']
  tradie?: Database['public']['Tables']['tradies']['Row']
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
  status?: Database['public']['Tables']['tradies']['Row']['status']
  sortBy?: 'rating' | 'distance' | 'review_count' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export default Database

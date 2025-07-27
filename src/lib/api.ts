import { supabase, Database, Coordinates, LocationQuery, ReviewFilters, TradieSearchParams } from '../../lib/supabase'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Owner = Database['public']['Tables']['owners']['Row']
export type OwnerInsert = Database['public']['Tables']['owners']['Insert']
export type OwnerUpdate = Database['public']['Tables']['owners']['Update']

export type Tradie = Database['public']['Tables']['tradies']['Row']
export type TradieInsert = Database['public']['Tables']['tradies']['Insert']
export type TradieUpdate = Database['public']['Tables']['tradies']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Profession = Database['public']['Tables']['professions']['Row']
export type ProfessionInsert = Database['public']['Tables']['professions']['Insert']
export type ProfessionUpdate = Database['public']['Tables']['professions']['Update']

export type TradieProfession = Database['public']['Tables']['tradie_professions']['Row']
export type TradieProfessionInsert = Database['public']['Tables']['tradie_professions']['Insert']
export type TradieProfessionUpdate = Database['public']['Tables']['tradie_professions']['Update']

export type TradieStats = Database['public']['Views']['tradie_stats']['Row']

// 项目API
export const projectsApi = {
  // 获取所有项目
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据ID获取项目
  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // 如果项目不存在，返回null而不是抛出错误
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 根据ID获取项目（包含分类和职业信息）
  async getByIdWithCategory(id: string): Promise<(Project & { category?: Category, profession?: Profession }) | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(id, name_en, name_zh),
        profession:professions(id, name_en, name_zh)
      `)
      .eq('id', id)
      .single()

    if (error) {
      // 如果项目不存在，返回null而不是抛出错误
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新项目
  async create(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新项目
  async update(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`项目不存在 (ID: ${id})`)
      }
      throw error
    }
    return data
  },

  // 删除项目
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 根据状态获取项目
  async getByStatus(status: Project['status']): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据用户ID获取项目
  async getByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 基于位置获取附近项目
  async getNearby(location: LocationQuery): Promise<Project[]> {
    const { latitude, longitude, radius = 50, limit = 20 } = location

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(limit)

    if (error) throw error

    // 在客户端计算距离并过滤
    const projectsWithDistance = (data || [])
      .map(project => ({
        ...project,
        distance: project.latitude && project.longitude
          ? calculateDistance(latitude, longitude, project.latitude, project.longitude)
          : null
      }))
      .filter(project => project.distance !== null && project.distance! <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return projectsWithDistance
  }
}

// 业主API
export const ownersApi = {
  // 获取所有业主
  async getAll(): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据ID获取业主
  async getById(id: string): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新业主
  async create(owner: OwnerInsert): Promise<Owner> {
    const { data, error } = await supabase
      .from('owners')
      .insert(owner)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新业主
  async update(id: string, updates: OwnerUpdate): Promise<Owner> {
    const { data, error } = await supabase
      .from('owners')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除业主
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 根据状态获取业主
  async getByStatus(status: Owner['status']): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据邮箱查找业主
  async getByEmail(email: string): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  }
}

// 技师API
export const tradiesApi = {
  // 获取所有技师
  async getAll(): Promise<Tradie[]> {
    const { data, error } = await supabase
      .from('tradies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 获取技师统计信息
  async getAllWithStats(): Promise<TradieStats[]> {
    const { data, error } = await supabase
      .from('tradie_stats')
      .select('*')
      .order('rating', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据ID获取技师
  async getById(id: string): Promise<Tradie | null> {
    const { data, error } = await supabase
      .from('tradies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 根据ID获取技师统计信息
  async getStatsById(id: string): Promise<TradieStats | null> {
    const { data, error } = await supabase
      .from('tradie_stats')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新技师
  async create(tradie: TradieInsert): Promise<Tradie> {
    const { data, error } = await supabase
      .from('tradies')
      .insert(tradie)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新技师
  async update(id: string, updates: TradieUpdate): Promise<Tradie> {
    const { data, error } = await supabase
      .from('tradies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除技师
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tradies')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 根据状态获取技师
  async getByStatus(status: Tradie['status']): Promise<Tradie[]> {
    const { data, error } = await supabase
      .from('tradies')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据专业获取技师
  async getBySpecialty(specialty: string): Promise<Tradie[]> {
    const { data, error } = await supabase
      .from('tradies')
      .select('*')
      .eq('specialty', specialty)
      .eq('status', 'approved')
      .order('rating', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据邮箱查找技师
  async getByEmail(email: string): Promise<Tradie | null> {
    const { data, error } = await supabase
      .from('tradies')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 获取已认证的技师
  async getApproved(): Promise<Tradie[]> {
    return this.getByStatus('approved')
  },

  // 基于位置和条件搜索技师
  async search(params: TradieSearchParams): Promise<TradieStats[]> {
    const {
      specialty,
      location,
      minRating = 0,
      status = 'approved',
      sortBy = 'rating',
      sortOrder = 'desc'
    } = params

    let query = supabase
      .from('tradie_stats')
      .select('*')
      .eq('status', status)
      .gte('rating', minRating)

    if (specialty) {
      query = query.eq('specialty', specialty)
    }

    // 应用排序
    if (sortBy === 'distance' && location) {
      // 距离排序需要在客户端完成
      query = query.order('rating', { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    const { data, error } = await query

    if (error) throw error

    let result = data || []

    // 如果指定了位置，计算距离并过滤
    if (location) {
      const { latitude, longitude, radius = 50, limit = 20 } = location

      result = result
        .filter(tradie => tradie.latitude !== null && tradie.longitude !== null)
        .map(tradie => ({
          ...tradie,
          distance: calculateDistance(latitude, longitude, tradie.latitude!, tradie.longitude!)
        }))
        .filter(tradie => tradie.distance <= radius)
        .slice(0, limit)

      // 如果按距离排序，重新排序
      if (sortBy === 'distance') {
        result.sort((a, b) => {
          const distanceA = a.distance || 0
          const distanceB = b.distance || 0
          return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA
        })
      }
    }

    return result
  },

  // 获取附近的技师
  async getNearby(location: LocationQuery, specialty?: string): Promise<TradieStats[]> {
    return this.search({
      location,
      specialty,
      sortBy: 'distance',
      sortOrder: 'asc'
    })
  }
}

// 评论API
export const reviewsApi = {
  // 获取所有评论
  async getAll(filters?: ReviewFilters): Promise<Review[]> {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (filters) {
      const { tradieId, ownerId, projectId, minRating, maxRating, limit = 50, offset = 0 } = filters

      if (tradieId) query = query.eq('tradie_id', tradieId)
      if (ownerId) query = query.eq('owner_id', ownerId)
      if (projectId) query = query.eq('project_id', projectId)
      if (minRating !== undefined) query = query.gte('rating', minRating)
      if (maxRating !== undefined) query = query.lte('rating', maxRating)

      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // 根据ID获取评论
  async getById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新评论
  async create(review: ReviewInsert): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新评论
  async update(id: string, updates: ReviewUpdate): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除评论
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 获取技师的评论
  async getByTradieId(tradieId: string, limit: number = 10): Promise<Review[]> {
    return this.getAll({
      tradieId,
      limit,
      isApproved: true
    })
  },

  // 获取项目的评论
  async getByProjectId(projectId: string): Promise<Review[]> {
    return this.getAll({
      projectId,
      isApproved: true
    })
  },

  // 获取业主的评论
  async getByOwnerId(ownerId: string): Promise<Review[]> {
    return this.getAll({
      ownerId,
      isApproved: true
    })
  },

  // 审核评论
  async approve(id: string): Promise<Review> {
    return this.update(id, { is_approved: true })
  },

  // 拒绝评论
  async reject(id: string): Promise<Review> {
    return this.update(id, { is_approved: false })
  },

  // 获取待审核的评论
  async getPending(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// 地理位置工具函数
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // 使用Haversine公式计算地球上两点间的距离（公里）
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 获取用户当前位置
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(new Error(`获取位置失败: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟
      }
    )
  })
}

// 用户邮箱检查API
export const userApi = {
  // 检查邮箱是否已存在（在owners或tradies表中）
  async checkEmailExists(email: string): Promise<{ exists: boolean; userType?: 'homeowner' | 'tradie' }> {
    try {
      // 先检查owners表
      const { data: ownerData } = await supabase
        .from('owners')
        .select('id')
        .eq('email', email)
        .single()

      if (ownerData) {
        return { exists: true, userType: 'homeowner' }
      }

      // 再检查tradies表
      const { data: tradieData } = await supabase
        .from('tradies')
        .select('id')
        .eq('email', email)
        .single()

      if (tradieData) {
        return { exists: true, userType: 'tradie' }
      }

      return { exists: false }
    } catch (error) {
      console.error('Error checking email:', error)
      return { exists: false }
    }
  }
}

// 分类API
export const categoriesApi = {
  // 获取所有分类
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_zh', { ascending: true })

    if (error) throw error
    return data || []
  },

  // 根据ID获取分类
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新分类
  async create(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新分类
  async update(id: string, updates: CategoryUpdate): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除分类
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 职业API
export const professionsApi = {
  // 获取所有职业
  async getAll(): Promise<Profession[]> {
    const { data, error } = await supabase
      .from('professions')
      .select('*')
      .order('name_zh', { ascending: true })

    if (error) throw error
    return data || []
  },

  // 根据分类ID获取职业
  async getByCategoryId(categoryId: string): Promise<Profession[]> {
    const { data, error } = await supabase
      .from('professions')
      .select('*')
      .eq('category_id', categoryId)
      .order('name_zh', { ascending: true })

    if (error) throw error
    return data || []
  },

  // 根据ID获取职业
  async getById(id: string): Promise<Profession | null> {
    const { data, error } = await supabase
      .from('professions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  },

  // 创建新职业
  async create(profession: ProfessionInsert): Promise<Profession> {
    const { data, error } = await supabase
      .from('professions')
      .insert(profession)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新职业
  async update(id: string, updates: ProfessionUpdate): Promise<Profession> {
    const { data, error } = await supabase
      .from('professions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除职业
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('professions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 技师职业关联API
export const tradieProfessionsApi = {
  // 获取技师的所有职业
  async getByTradieId(tradieId: string): Promise<Profession[]> {
    const { data, error } = await supabase
      .from('tradie_professions')
      .select(`
        professions (*)
      `)
      .eq('tradie_id', tradieId)

    if (error) throw error
    return data?.map((item: any) => item.professions).filter(Boolean) || []
  },

  // 为技师添加职业
  async create(tradieProfession: TradieProfessionInsert): Promise<TradieProfession> {
    const { data, error } = await supabase
      .from('tradie_professions')
      .insert(tradieProfession)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除技师的职业关联
  async delete(tradieId: string, professionId: string): Promise<void> {
    const { error } = await supabase
      .from('tradie_professions')
      .delete()
      .eq('tradie_id', tradieId)
      .eq('profession_id', professionId)

    if (error) throw error
  },

  // 删除技师的所有职业关联
  async deleteAllByTradieId(tradieId: string): Promise<void> {
    const { error } = await supabase
      .from('tradie_professions')
      .delete()
      .eq('tradie_id', tradieId)

    if (error) throw error
  },

  // 批量设置技师的职业
  async setTradieProfessions(tradieId: string, professionIds: string[]): Promise<void> {
    // 先删除所有现有关联
    await this.deleteAllByTradieId(tradieId)

    // 如果有新的职业ID，则创建新关联
    if (professionIds.length > 0) {
      const insertData = professionIds.map(professionId => ({
        tradie_id: tradieId,
        profession_id: professionId
      }))

      const { error } = await supabase
        .from('tradie_professions')
        .insert(insertData)

      if (error) throw error
    }
  }
}

// 错误处理工具
export class ApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// 通用错误处理
export function handleApiError(error: any): never {
  if (error.message) {
    throw new ApiError(error.message, error.code)
  }
  throw new ApiError('未知错误')
}

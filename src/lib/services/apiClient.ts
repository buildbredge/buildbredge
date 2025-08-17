/**
 * 安全的API客户端
 * 用于前端与后端API的安全通信，隐藏数据库结构
 */

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface ProjectData {
  id: string
  title: string
  description: string
  status: string
  category: string
  profession: string
  location: string
  createdAt: string
  updatedAt: string
}

interface ProjectDetailData extends ProjectData {
  images: string[]
  budget: number | null
}

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface UserProfileData {
  id: string
  name: string
  email: string
  phone: string
  phone_verified?: boolean
  address: string
  status: 'pending' | 'approved' | 'closed' | 'active'
  verified: boolean
  emailVerified: boolean
  createdAt: string
  roles?: UserRole[]
  activeRole?: 'owner' | 'tradie'
  // Legacy properties for backward compatibility
  company?: string
  serviceRadius?: number
  rating?: number
  reviewCount?: number
  location?: string
  hourlyRate?: number
  experienceYears?: number
  bio?: string
  // 融合式设计：包含所有角色数据
  ownerData?: {
    status: string
    balance: number
    projectCount?: number
  }
  tradieData?: {
    company: string
    specialty: string
    serviceRadius: number
    rating: number
    reviewCount: number
    status: string
    balance: number
    hourlyRate?: number
    experienceYears?: number
    bio?: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DashboardData {
  projectStats: {
    total: number
    published: number
    inProgress: number
    completed: number
    draft: number
  }
  recentProjects: Array<{
    id: string
    title: string
    description: string
    status: string
    category: string
    profession: string
    location: string
    createdAt: string
  }>
  serviceStats?: {
    availableJobs: number
    activeServices: number
    pendingQuotes: number
    monthlyRevenue: number
  }
  availableCategories: Array<{
    id: string
    name: string
    count: number
  }>
}

interface ProjectsListResponse {
  projects: ProjectData[]
  pagination: PaginationData
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = '/api'
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.token = token
  }

  // 清除认证token
  clearAuthToken() {
    this.token = null
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {})
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || '请求失败'
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: '网络请求失败'
      }
    }
  }

  // 项目相关API
  async getProjects(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<ProjectsListResponse>> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)

    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    
    return this.request<ProjectsListResponse>(`/projects${query}`)
  }

  async getProject(id: string): Promise<ApiResponse<ProjectDetailData>> {
    return this.request<ProjectDetailData>(`/projects/${id}`)
  }

  async createProject(data: {
    description: string
    categoryId: string
    professionId?: string
    images?: string[]
    budget?: number
  }): Promise<ApiResponse<{ projectId: string; message: string }>> {
    return this.request(`/projects`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProject(
    id: string,
    data: {
      description?: string
      categoryId?: string
      professionId?: string
      images?: string[]
      budget?: number
      status?: string
    }
  ): Promise<ApiResponse<{ projectId: string; message: string }>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProject(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // 用户资料相关API
  async getUserProfile(role?: 'owner' | 'tradie'): Promise<ApiResponse<UserProfileData>> {
    const params = role ? `?role=${role}` : ''
    return this.request<UserProfileData>(`/users/profile${params}`)
  }

  async updateUserProfile(data: {
    name: string
    phone: string
    phone_verified?: boolean
    address: string
    role?: 'owner' | 'tradie'
    company?: string
    serviceRadius?: number
    hourlyRate?: number
    experienceYears?: number
    bio?: string
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async switchUserRole(role: 'owner' | 'tradie'): Promise<ApiResponse<UserProfileData>> {
    return this.getUserProfile(role)
  }

  // Dashboard数据相关API
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.request<DashboardData>('/dashboard/data')
  }
}

// 创建单例实例
export const apiClient = new ApiClient()

// 导出类型定义
export type {
  ApiResponse,
  ProjectData,
  ProjectDetailData,
  UserProfileData,
  UserRole,
  ProjectsListResponse,
  PaginationData,
  DashboardData
}
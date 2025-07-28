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
  createdAt: string
  updatedAt: string
}

interface ProjectDetailData extends ProjectData {
  images: string[]
  budget: number | null
  location: string | null
}

interface UserProfileData {
  id: string
  name: string
  email: string
  phone: string
  userType: 'homeowner' | 'tradie'
  location: string
  company?: string
  specialty?: string
  serviceRadius?: number
  rating?: number
  reviewCount?: number
  status: 'pending' | 'approved' | 'closed'
  verified: boolean
  emailVerified: boolean
  createdAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
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
  async getUserProfile(): Promise<ApiResponse<UserProfileData>> {
    return this.request<UserProfileData>('/users/profile')
  }

  async updateUserProfile(data: {
    name: string
    phone: string
    location: string
    company?: string
    specialty?: string
    serviceRadius?: number
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
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
  ProjectsListResponse,
  PaginationData
}
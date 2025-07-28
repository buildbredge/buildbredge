import { supabase } from './supabase'
import { AdminLoginCredentials, AdminSession, AdminActivityLogData, AdminFilters } from './supabase'

// Admin Authentication API
export class AdminAPI {
  // 管理员登录
  static async login(credentials: AdminLoginCredentials): Promise<AdminSession | null> {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: credentials.email,
          password: credentials.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Login failed:', data.error)
        return null
      }

      return data.admin
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }

  // 记录管理员活动
  static async logActivity(data: AdminActivityLogData): Promise<void> {
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: data.admin_id,
        p_action: data.action,
        p_resource_type: data.resource_type || null,
        p_resource_id: data.resource_id || null,
        p_details: data.details || {},
        p_ip_address: data.ip_address || null,
        p_user_agent: data.user_agent || null
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  // 验证管理员权限
  static async checkPermission(adminId: string, permission: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_admin_permission', {
        p_admin_id: adminId,
        p_permission: permission
      })

      if (error) {
        console.error('Permission check error:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  // 获取管理员列表
  static async getAdmins(filters?: AdminFilters) {
    try {
      let query = supabase
        .from('admin_stats')
        .select('*')

      if (filters?.role) {
        query = query.eq('role', filters.role)
      }

      if (filters?.department) {
        query = query.eq('department', filters.department)
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      if (filters?.created_after) {
        query = query.gte('created_at', filters.created_after)
      }

      if (filters?.created_before) {
        query = query.lte('created_at', filters.created_before)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch admins:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get admins error:', error)
      return []
    }
  }

  // 获取单个管理员信息
  static async getAdmin(adminId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .eq('id', adminId)
        .single()

      if (error) {
        console.error('Failed to fetch admin:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get admin error:', error)
      return null
    }
  }

  // 创建新管理员 (需要通过API路由处理密码加密)
  static async createAdmin(adminData: {
    email: string
    password: string
    name: string
    role: 'super_admin' | 'admin' | 'moderator'
    permissions?: string[]
    avatar?: string
    phone?: string
    department?: string
    created_by: string
  }) {
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to create admin:', data.error)
        return null
      }

      return data.admin
    } catch (error) {
      console.error('Create admin error:', error)
      return null
    }
  }

  // 更新管理员信息
  static async updateAdmin(adminId: string, updates: {
    email?: string
    name?: string
    role?: 'super_admin' | 'admin' | 'moderator'
    permissions?: string[]
    avatar?: string
    phone?: string
    department?: string
    is_active?: boolean
  }, updatedBy: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        console.error('Failed to update admin:', error)
        return null
      }

      // 记录更新活动
      await this.logActivity({
        admin_id: updatedBy,
        action: 'update_admin',
        resource_type: 'admin',
        resource_id: adminId,
        details: { updates }
      })

      return data
    } catch (error) {
      console.error('Update admin error:', error)
      return null
    }
  }

  // 重置管理员密码 (需要通过API路由处理密码加密)
  static async resetPassword(adminId: string, newPassword: string, resetBy: string) {
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
          newPassword,
          resetBy
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to reset password:', data.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Reset password error:', error)
      return false
    }
  }

  // 获取管理员活动日志
  static async getActivityLogs(adminId?: string, limit = 50, offset = 0) {
    try {
      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin:admins(name, email)
        `)

      if (adminId) {
        query = query.eq('admin_id', adminId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Failed to fetch activity logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get activity logs error:', error)
      return []
    }
  }

  // 删除管理员（软删除 - 设为非活跃）
  static async deactivateAdmin(adminId: string, deactivatedBy: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({ is_active: false })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        console.error('Failed to deactivate admin:', error)
        return false
      }

      // 记录停用活动
      await this.logActivity({
        admin_id: deactivatedBy,
        action: 'deactivate_admin',
        resource_type: 'admin',
        resource_id: adminId,
        details: { deactivated_admin_email: data.email }
      })

      return true
    } catch (error) {
      console.error('Deactivate admin error:', error)
      return false
    }
  }

  // 激活管理员
  static async activateAdmin(adminId: string, activatedBy: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({ is_active: true })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        console.error('Failed to activate admin:', error)
        return false
      }

      // 记录激活活动
      await this.logActivity({
        admin_id: activatedBy,
        action: 'activate_admin',
        resource_type: 'admin',
        resource_id: adminId,
        details: { activated_admin_email: data.email }
      })

      return true
    } catch (error) {
      console.error('Activate admin error:', error)
      return false
    }
  }
}
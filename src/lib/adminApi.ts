// 管理员API请求工具函数

export interface AdminApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 处理token过期的函数
export const handleTokenExpired = () => {
  // 清除localStorage
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")
  
  // 清除cookies
  document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  
  // 显示提示信息
  alert('登录已过期，请重新登录')
  
  // 跳转到登录页
  window.location.href = '/htgl/login'
}

// 通用的管理员API请求函数
export async function adminApiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<AdminApiResponse<T> | null> {
  try {
    const adminToken = localStorage.getItem('adminToken')
    
    if (!adminToken) {
      handleTokenExpired()
      return null
    }

    const defaultHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    // 检查token过期
    if (response.status === 401) {
      handleTokenExpired()
      return null
    }

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `请求失败: ${response.status}`
      }
    }

    return data

  } catch (error) {
    console.error('Admin API request error:', error)
    return {
      success: false,
      error: '网络请求失败'
    }
  }
}

// 专门的GET请求
export const adminGet = <T = any>(url: string): Promise<AdminApiResponse<T> | null> => {
  return adminApiRequest<T>(url, { method: 'GET' })
}

// 专门的POST请求
export const adminPost = <T = any>(url: string, data: any): Promise<AdminApiResponse<T> | null> => {
  return adminApiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 专门的PATCH请求
export const adminPatch = <T = any>(url: string, data: any): Promise<AdminApiResponse<T> | null> => {
  return adminApiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

// 专门的DELETE请求
export const adminDelete = <T = any>(url: string): Promise<AdminApiResponse<T> | null> => {
  return adminApiRequest<T>(url, { method: 'DELETE' })
}
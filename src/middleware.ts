import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 这个函数在每个请求上运行
export function middleware(request: NextRequest) {
  // 排除登录页面，允许访问（处理带或不带末尾斜杠的情况）
  if (request.nextUrl.pathname === '/htgl/login' || request.nextUrl.pathname === '/htgl/login/') {
    console.log('Allowing access to login page:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  // 对其他 /htgl/ 路径进行权限检查
  console.log('Checking admin permissions for:', request.nextUrl.pathname)
  
  // 检查是否有admin权限
  const adminToken = request.cookies.get('adminToken')?.value
  const adminUser = request.cookies.get('adminUser')?.value

  // 如果没有token或用户信息，重定向到登录页
  if (!adminToken || !adminUser) {
    console.log('No admin credentials found, redirecting to login')
    return NextResponse.redirect(new URL('/htgl/login', request.url))
  }

  // 这里可以添加更严格的token验证
  // 比如验证JWT token的有效性等
  try {
    const user = JSON.parse(adminUser)
    
    // 验证是否为admin用户
    if (!user || user.role !== 'admin') {
      console.warn('Non-admin user trying to access admin pages:', user)
      return NextResponse.redirect(new URL('/htgl/login', request.url))
    }
    
    console.log('Admin user accessing admin pages:', user.email)
  } catch (error) {
    // 如果解析用户信息失败，重定向到登录页
    console.log('Failed to parse admin user info, redirecting to login')
    return NextResponse.redirect(new URL('/htgl/login', request.url))
  }

  return NextResponse.next()
}

// 配置中间件匹配的路径 - 只匹配 /htgl/ 路径
export const config = {
  matcher: [
    '/htgl/:path*'
  ],
}
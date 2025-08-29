"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const router = useRouter()
  const { user, authUser, isLoading } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isLoading && !redirecting) {
      redirectToRoleDashboard()
    }
  }, [isLoading, user, authUser, redirecting])

  const redirectToRoleDashboard = () => {
    if (redirecting) return
    setRedirecting(true)

    // 如果没有认证用户，重定向到登录页面
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    // 如果没有用户资料，重定向到登录页面
    if (!user) {
      router.push('/auth/login')
      return
    }

    const roles = user.roles || []
    
    // Find primary role or default to first role
    const primaryRole = roles.find(role => role.is_primary) || roles[0]
    
    if (primaryRole) {
      // Redirect to appropriate dashboard
      if (primaryRole.role_type === 'tradie') {
        router.push('/dashboard/tradie')
      } else {
        router.push('/dashboard/owner')
      }
    } else {
      // No roles found, redirect to onboarding or default
      router.push('/dashboard/owner')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到您的专属工作台...</p>
        </div>
      </div>
    </div>
  )
}

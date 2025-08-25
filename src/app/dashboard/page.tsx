"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/services/apiClient"
import { authService } from "../../../lib/services/authService"
import type { UserProfileData } from "@/lib/services/apiClient"

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface ExtendedUserProfileData extends UserProfileData {
  roles?: UserRole[]
  activeRole?: 'owner' | 'tradie'
}

interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    redirectToRoleDashboard()
  }, [])

  const redirectToRoleDashboard = async () => {
    try {
      const session = await authService.getCurrentSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      const profileResponse = await apiClient.getUserProfile()
      
      if (profileResponse.success && profileResponse.data) {
        const userProfile = profileResponse.data as ExtendedUserProfileData
        const roles = userProfile.roles || []
        
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
      } else {
        console.error('Failed to fetch user profile:', profileResponse.error)
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/auth/login')
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

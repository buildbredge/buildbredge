"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home, Briefcase, MessageCircle, Star,
  Settings, Plus, Eye, DollarSign,
  Bell, LogOut, CheckCircle, Clock,
  ChevronLeft, ChevronRight, Users
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "../../../../lib/services/apiClient"
import { authService } from "../../../../lib/services/authService"
import { RoleBadges, RoleStats } from "@/components/ui/role-badges"
import { ProgressiveOnboarding } from "@/components/ui/progressive-onboarding"
import { RoleSwitcher } from "@/components/ui/role-switcher"
import { AnonymousProjectClaimNotification } from "@/components/AnonymousProjectClaimNotification"
import { OwnerProjectsList } from "@/components/OwnerProjectsList"
import { OwnerQuotesManagement } from "@/components/OwnerQuotesManagement"
import type { ProjectData, UserProfileData } from "../../../../lib/services/apiClient"

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface DashboardData {
  projectStats: {
    total: number
    published: number
    negotiating: number
    inProgress: number
    completed: number
    reviewed: number
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
  availableCategories: Array<{
    id: string
    name: string
    count: number
  }>
}

interface ExtendedUserProfileData extends UserProfileData {
  roles?: UserRole[]
  activeRole?: 'owner' | 'tradie'
  address?: string
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
  }
}

interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
}

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<ExtendedUserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalProjects, setTotalProjects] = useState(0)
  const [activeTab, setActiveTab] = useState("projects")
  const [tabCounts, setTabCounts] = useState({
    projects: 0,
    quotes: 0,
    messages: 0,
    reviews: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const session = await authService.getCurrentSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      const profileResponse = await apiClient.getUserProfile()
      
      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data as ExtendedUserProfileData
        setUserProfile(profile)
        
        // Check if user has owner role
        const hasOwnerRole = profile.roles?.some((r: UserRole) => r.role_type === 'owner')
        if (!hasOwnerRole) {
          // If user doesn't have owner role, redirect to their appropriate dashboard
          const hasTradieRole = profile.roles?.some((r: UserRole) => r.role_type === 'tradie')
          if (hasTradieRole) {
            router.push('/dashboard/tradie')
          } else {
            router.push('/dashboard')
          }
          return
        }
      } else {
        console.error('Failed to fetch user profile:', profileResponse.error)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    setLoadingProjects(true)
    try {
      const sessionResult = await authService.getCurrentSession()
      const token = sessionResult?.session?.access_token
      
      let dashboardResponse = null
      if (token) {
        dashboardResponse = await fetch('/api/dashboard/data', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
      
      let dashboardData = null
      if (dashboardResponse && dashboardResponse.ok) {
        const dashResult = await dashboardResponse.json()
        if (dashResult.success) {
          dashboardData = dashResult.data
          setDashboardData(dashResult.data)
        }
      }
      
      const projectsResponse = await apiClient.getProjects({ page: currentPage, limit: itemsPerPage })
      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data.projects)
        setTotalProjects(projectsResponse.data.pagination?.total || projectsResponse.data.projects.length)
      } else {
        console.error('Error fetching projects:', projectsResponse.error)
      }
      
      if (!dashboardData) {
        const mockDashboardData: DashboardData = {
          projectStats: {
            total: projectsResponse.data?.projects.length || 0,
            published: projectsResponse.data?.projects.filter(p => p.status === 'published').length || 0,
            negotiating: projectsResponse.data?.projects.filter(p => p.status === 'negotiating').length || 0,
            inProgress: projectsResponse.data?.projects.filter(p => p.status === 'in_progress').length || 0,
            completed: projectsResponse.data?.projects.filter(p => p.status === 'completed').length || 0,
            reviewed: projectsResponse.data?.projects.filter(p => p.status === 'reviewed').length || 0,
            draft: projectsResponse.data?.projects.filter(p => p.status === 'draft').length || 0
          },
          recentProjects: projectsResponse.data?.projects.slice(0, 5).map(p => ({
            id: p.id,
            title: p.category,
            description: p.description,
            status: p.status,
            category: p.category,
            profession: p.profession,
            location: p.location,
            createdAt: p.createdAt
          })) || [],
          availableCategories: []
        }
        setDashboardData(mockDashboardData)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      const fallbackData: DashboardData = {
        projectStats: { total: 0, published: 0, negotiating: 0, inProgress: 0, completed: 0, reviewed: 0, draft: 0 },
        recentProjects: [],
        availableCategories: []
      }
      setDashboardData(fallbackData)
    } finally {
      setLoadingProjects(false)
    }
  }, [user, currentPage, itemsPerPage])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, currentPage, itemsPerPage, fetchDashboardData])

  const handleLogout = async () => {
    await authService.logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-600">获取用户信息失败</p>
            <Button onClick={() => router.push('/auth/login')} className="mt-4">
              返回登录
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const hasTradieRole = userProfile.roles?.some((r: UserRole) => r.role_type === 'tradie') 
  const isMultiRole = (userProfile.roles?.length || 0) > 1
  const displayName = userProfile.name || user.email?.split('@')[0] || '用户'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                业主工作台
              </h1>
              <p className="text-gray-600">欢迎回来，{displayName}</p>
              <div className="flex items-center space-x-2 mt-2">
                <RoleBadges 
                  roles={userProfile.roles || []} 
                  activeRole="owner"
                />
                {user.emailConfirmed ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已验证
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <Clock className="w-3 h-3 mr-1" />
                    待验证邮箱
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RoleSwitcher 
              roles={userProfile.roles || []}
              currentRole="owner"
            />
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              通知
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>

        {/* Email Verification Alert */}
        {!user.emailConfirmed && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800">邮箱尚未验证</h3>
                  <p className="text-sm text-yellow-700">
                    请检查您的邮箱并点击验证链接完成账户激活。
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  重新发送
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anonymous Project Claim Notification */}
        <AnonymousProjectClaimNotification onClaim={() => {
          checkUser()
          fetchDashboardData()
        }} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding */}
            <ProgressiveOnboarding
              userRoles={userProfile.roles || []}
              projectCount={dashboardData?.projectStats.total || 0}
              profileComplete={!!(userProfile.name && userProfile.phone && userProfile.address)}
              emailVerified={user.emailConfirmed}
            />
            
            {/* Primary CTA - Post Job */}
            <Button className="w-full h-20 flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium mb-6" asChild>
              <Link href="/post-job">
                <Plus className="w-8 h-8" />
                <span>发布新项目</span>
              </Link>
            </Button>

            {/* Tabbed Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2 text-blue-600" />
                  业主工作台
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <div className="grid grid-cols-4 gap-3 p-1">
                    <button
                      onClick={() => setActiveTab("projects")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "projects"
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                      }`}
                    >
                      <Briefcase className="w-5 h-5 mb-1 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">我的项目</span>
                      {tabCounts.projects > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.projects}
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("quotes")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "quotes"
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mb-1 text-green-600" />
                      <span className="text-xs font-medium text-gray-700">报价管理</span>
                      {tabCounts.quotes > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.quotes}
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "messages"
                          ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 hover:shadow-md"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mb-1 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">消息中心</span>
                      {tabCounts.messages > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.messages}
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "reviews"
                          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-md"
                      }`}
                    >
                      <Star className="w-5 h-5 mb-1 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">评价管理</span>
                      {tabCounts.reviews > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.reviews}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {activeTab === "projects" && (
                      <OwnerProjectsList 
                        userId={user.id} 
                      />
                    )}

                    {activeTab === "quotes" && (
                      <OwnerQuotesManagement 
                        userId={user.id}
                      />
                    )}

                    {activeTab === "messages" && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">暂无新消息</p>
                            <p className="text-sm text-gray-400">
                              当技师联系您时，消息会显示在这里
                            </p>
                            <Button className="mt-4" variant="outline" asChild>
                              <Link href="/messages">
                                查看所有消息
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {activeTab === "reviews" && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center py-8">
                            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">暂无评价</p>
                            <p className="text-sm text-gray-400">
                              项目完成后您可以在这里管理对技师的评价
                            </p>
                            <Button className="mt-4" variant="outline" asChild>
                              <Link href="/reviews">
                                查看评价历史
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleStats 
                  ownerData={userProfile.ownerData}
                  tradieData={undefined}
                />
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">联系信息</label>
                    <p className="font-medium text-sm">{userProfile.name || '未填写'}</p>
                    <p className="text-sm text-gray-600">{userProfile.phone || '未填写'}</p>
                    <p className="text-sm text-gray-600">{userProfile.address || userProfile.location || '未填写'}</p>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/profile">
                      <Settings className="w-4 h-4 mr-2" />
                      编辑资料
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>项目统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData?.projectStats.total || 0}</div>
                    <div className="text-xs text-blue-600">项目总数</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardData?.projectStats.published || 0}</div>
                    <div className="text-xs text-green-600">已发布</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{dashboardData?.projectStats.negotiating || 0}</div>
                    <div className="text-xs text-orange-600">协商中</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData?.projectStats.inProgress || 0}</div>
                    <div className="text-xs text-yellow-600">进行中</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{dashboardData?.projectStats.completed || 0}</div>
                    <div className="text-xs text-purple-600">已完成</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{dashboardData?.projectStats.reviewed || 0}</div>
                    <div className="text-xs text-indigo-600">已评价</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>帮助与支持</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start p-0">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  在线客服
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0">
                  <DollarSign className="w-4 h-4 mr-2" />
                  费用说明
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0" asChild>
                  <Link href="/faq">
                    <Briefcase className="w-4 h-4 mr-2" />
                    常见问题
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
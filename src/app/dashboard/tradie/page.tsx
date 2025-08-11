"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wrench, Briefcase, MessageCircle, Star,
  Settings, Eye, DollarSign, TrendingUp,
  Bell, LogOut, CheckCircle, Clock,
  ChevronLeft, ChevronRight, Target, Calendar
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "../../../../lib/services/apiClient"
import { authService } from "../../../../lib/services/authService"
import { RoleBadges, RoleStats } from "@/components/ui/role-badges"
import { ProgressiveOnboarding } from "@/components/ui/progressive-onboarding"
import { RoleSwitcher } from "@/components/ui/role-switcher"
import { TradieProfileCompletion } from "@/components/ui/tradie-profile-completion"
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

interface ExtendedUserProfileData extends UserProfileData {
  roles?: UserRole[]
  activeRole?: 'owner' | 'tradie'
  address?: string
  phone_verified?: boolean
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

export default function TradieDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<ExtendedUserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableJobs, setAvailableJobs] = useState<ProjectData[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalJobs, setTotalJobs] = useState(0)

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
        console.log('Frontend - Received profile data:', {
          phone_verified: profile.phone_verified,
          tradieData: profile.tradieData,
          specialty: profile.tradieData?.specialty
        })
        console.log('API Debug Info:', (profileResponse as any).debug)
        setUserProfile(profile)
        
        // Check if user has tradie role
        const hasTradieRole = profile.roles?.some((r: UserRole) => r.role_type === 'tradie')
        if (!hasTradieRole) {
          // If user doesn't have tradie role, redirect to their appropriate dashboard
          const hasOwnerRole = profile.roles?.some((r: UserRole) => r.role_type === 'owner')
          if (hasOwnerRole) {
            router.push('/dashboard/owner')
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
    
    setLoadingJobs(true)
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
      
      // For tradies, we want to fetch available jobs they can bid on
      // This would typically be different from the owner's getProjects call
      const jobsResponse = await apiClient.getProjects({ page: currentPage, limit: itemsPerPage })
      if (jobsResponse.success && jobsResponse.data) {
        // Filter for published jobs that tradies can bid on
        const availableJobs = jobsResponse.data.projects.filter(p => p.status === 'published')
        setAvailableJobs(availableJobs)
        setTotalJobs(availableJobs.length)
      } else {
        console.error('Error fetching available jobs:', jobsResponse.error)
      }
      
      if (!dashboardData) {
        const mockServiceData: DashboardData = {
          projectStats: {
            total: 0,
            published: 0,
            inProgress: 0,
            completed: 0,
            draft: 0
          },
          recentProjects: [],
          serviceStats: {
            availableJobs: availableJobs.length || 15,
            activeServices: 3,
            pendingQuotes: 5,
            monthlyRevenue: 2800
          },
          availableCategories: []
        }
        setDashboardData(mockServiceData)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      const fallbackData: DashboardData = {
        projectStats: { total: 0, published: 0, inProgress: 0, completed: 0, draft: 0 },
        recentProjects: [],
        serviceStats: { availableJobs: 0, activeServices: 0, pendingQuotes: 0, monthlyRevenue: 0 },
        availableCategories: []
      }
      setDashboardData(fallbackData)
    } finally {
      setLoadingJobs(false)
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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

  const hasOwnerRole = userProfile.roles?.some((r: UserRole) => r.role_type === 'owner')
  const isMultiRole = (userProfile.roles?.length || 0) > 1
  const displayName = userProfile.name || user.email?.split('@')[0] || '用户'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg bg-green-100 text-green-800">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                技师工作台
              </h1>
              <p className="text-gray-600">欢迎回来，{displayName}</p>
              {userProfile.tradieData && (
                <p className="text-sm text-green-600 font-medium">
                  {userProfile.tradieData.company} • {userProfile.tradieData.specialty}
                  {userProfile.tradieData.rating > 0 && (
                    <span className="ml-2">
                      ⭐ {userProfile.tradieData.rating.toFixed(1)} ({userProfile.tradieData.reviewCount} 评价)
                    </span>
                  )}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <RoleBadges 
                  roles={userProfile.roles || []} 
                  activeRole="tradie"
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
              currentRole="tradie"
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tradie Profile Completion */}
            <TradieProfileCompletion
              userProfile={userProfile}
              emailVerified={user.emailConfirmed}
              onProfileUpdate={() => checkUser()}
            />
            
            {/* Onboarding */}
            <ProgressiveOnboarding
              userRoles={userProfile.roles || []}
              projectCount={0} // Tradies don't have projects, they have services
              profileComplete={!!(userProfile.name && userProfile.phone && userProfile.tradieData?.company)}
              emailVerified={user.emailConfirmed}
            />
            
            {/* Quick Actions - Tradie Focused */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-green-600" />
                  技师专属功能
                  <Badge className="ml-2 text-xs bg-green-100 text-green-800">专业服务</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Primary CTA - Browse Jobs */}
                  <Button className="w-full h-20 flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white text-xl font-medium" asChild>
                    <Link href="/browse-jobs">
                      <Target className="w-8 h-8" />
                      <span>浏览最新项目</span>
                    </Link>
                  </Button>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button className="h-16 flex flex-col items-center space-y-1 border-green-200 text-green-700 hover:bg-green-50" variant="outline">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-xs">我的服务</span>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-green-200 text-green-700 hover:bg-green-50" variant="outline" asChild>
                      <Link href="/messages">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs">客户沟通</span>
                      </Link>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-green-200 text-green-700 hover:bg-green-50" variant="outline">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-xs">我的报价</span>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-green-200 text-green-700 hover:bg-green-50" variant="outline">
                      <Calendar className="w-5 h-5" />
                      <span className="text-xs">日程管理</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>可接项目</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">每页显示:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loadingJobs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                  </div>
                ) : (
                  <>
                    {availableJobs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm mb-4">暂时没有符合条件的项目</p>
                        <Button variant="outline">
                          调整服务范围
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {availableJobs.slice(0, 5).map((job: any) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 cursor-pointer transition-colors border-green-100"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-medium text-gray-900">
                                    {job.category || '未分类'}
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-600">
                                    {job.profession || '未指定专业'}
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(job.createdAt).toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                  <Badge className="text-xs bg-green-100 text-green-800">
                                    新项目
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                  {job.location || '位置未指定'}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {job.description || '暂无详细描述'}
                                </div>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  报价
                                </Button>
                                <Eye className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalJobs > itemsPerPage && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalJobs)} 共 {totalJobs} 条
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                                上一页
                              </Button>
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.ceil(totalJobs / itemsPerPage) }, (_, i) => i + 1)
                                  .filter(page => {
                                    const totalPages = Math.ceil(totalJobs / itemsPerPage)
                                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                                  })
                                  .map((page, index, array) => {
                                    const showEllipsis = index > 0 && page - array[index - 1] > 1
                                    return (
                                      <div key={page} className="flex items-center">
                                        {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                        <Button
                                          variant={currentPage === page ? "default" : "outline"}
                                          size="sm"
                                          className="w-8 h-8 p-0"
                                          onClick={() => setCurrentPage(page)}
                                        >
                                          {page}
                                        </Button>
                                      </div>
                                    )
                                  })}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalJobs / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalJobs / itemsPerPage)}
                              >
                                下一页
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Stats */}
            <Card>
              <CardHeader>
                <CardTitle>服务概览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardData?.serviceStats?.availableJobs || 0}</div>
                    <div className="text-xs text-green-600">可接项目</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData?.serviceStats?.activeServices || 0}</div>
                    <div className="text-xs text-blue-600">活跃服务</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData?.serviceStats?.pendingQuotes || 0}</div>
                    <div className="text-xs text-yellow-600">待处理报价</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">${dashboardData?.serviceStats?.monthlyRevenue || 0}</div>
                    <div className="text-xs text-purple-600">本月收入</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleStats 
                  ownerData={undefined}
                  tradieData={userProfile.tradieData}
                />
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">联系信息</label>
                    <p className="font-medium text-sm">{userProfile.name || '未填写'}</p>
                    <p className="text-sm text-gray-600">{userProfile.phone || '未填写'}</p>
                    {userProfile.tradieData && (
                      <p className="text-sm text-gray-600">{userProfile.tradieData.company || '未填写公司'}</p>
                    )}
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

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  服务表现
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">服务评分</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {userProfile.tradieData?.rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完成项目</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">客户好评率</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
                <Button className="w-full mt-3" variant="outline" size="sm">
                  查看详细报告
                </Button>
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
                  <TrendingUp className="w-4 h-4 mr-2" />
                  提升技巧
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
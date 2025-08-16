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
            
            {/* Quick Actions - Owner Focused */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2 text-blue-600" />
                  业主专属功能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Primary CTA - Post Job */}
                  <Button className="w-full h-20 flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium" asChild>
                    <Link href="/post-job">
                      <Plus className="w-8 h-8" />
                      <span>发布新项目</span>
                    </Link>
                  </Button>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button className="h-16 flex flex-col items-center space-y-1 border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" asChild>
                      <Link href="/my-projects">
                        <Briefcase className="w-5 h-5" />
                        <span className="text-xs">我的项目</span>
                      </Link>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" asChild>
                      <Link href="/browse-tradies">
                        <Users className="w-5 h-5" />
                        <span className="text-xs">寻找技师</span>
                      </Link>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" asChild>
                      <Link href="/messages">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs">消息中心</span>
                      </Link>
                    </Button>
                    <Button className="h-16 flex flex-col items-center space-y-1 border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" asChild>
                      <Link href="/reviews">
                        <Star className="w-5 h-5" />
                        <span className="text-xs">评价管理</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>我的项目</CardTitle>
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
                {loadingProjects ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                  </div>
                ) : (
                  <>
                    {projects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm mb-4">您还没有发布任何项目</p>
                        <Button asChild>
                          <Link href="/post-job">
                            <Plus className="w-4 h-4 mr-2" />
                            发布第一个项目
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {(dashboardData?.recentProjects || projects).slice(0, 5).map((project: any) => (
                            <div
                              key={project.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/projects/${project.id}`)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-medium text-gray-900">
                                    {project.category || '未分类'}
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-600">
                                    {project.profession || '未指定专业'}
                                  </span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(project.createdAt).toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                  <Badge 
                                    variant={
                                      project.status === 'published' ? 'default' :
                                      project.status === 'negotiating' ? 'secondary' :
                                      project.status === 'in_progress' ? 'secondary' :
                                      project.status === 'completed' ? 'outline' :
                                      project.status === 'reviewed' ? 'outline' : 'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {project.status === 'published' && '已发布'}
                                    {project.status === 'draft' && '草稿'}
                                    {project.status === 'negotiating' && '协商中'}
                                    {project.status === 'in_progress' && '进行中'}
                                    {project.status === 'completed' && '已完成'}
                                    {project.status === 'reviewed' && '已评价'}
                                    {project.status === 'cancelled' && '已取消'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {project.location || '位置未指定'}
                                </div>
                              </div>
                              <div className="ml-4">
                                <Eye className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalProjects > itemsPerPage && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalProjects)} 共 {totalProjects} 条
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
                                {Array.from({ length: Math.ceil(totalProjects / itemsPerPage) }, (_, i) => i + 1)
                                  .filter(page => {
                                    const totalPages = Math.ceil(totalProjects / itemsPerPage)
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
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalProjects / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalProjects / itemsPerPage)}
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
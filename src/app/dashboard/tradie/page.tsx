"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Wrench, Briefcase, MessageCircle, Star,
  Settings, DollarSign, TrendingUp,
  Bell, LogOut, CheckCircle, Clock,
  Target, Calendar
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/services/apiClient"
import { authService } from "@/lib/services/authService"
import { RoleBadges, RoleStats } from "@/components/ui/role-badges"
import { RoleSwitcher } from "@/components/ui/role-switcher"
import { TradieProfileCompletion } from "@/components/ui/tradie-profile-completion"
import { AnonymousProjectClaimNotification } from "@/components/AnonymousProjectClaimNotification"
import { MatchedProjectsList } from "@/components/MatchedProjectsList"
import { TradieQuotesList } from "@/components/TradieQuotesList"
import { TradieProjectsList } from "@/components/TradieProjectsList"
import SubordinateTradiesList from "@/components/SubordinateTradiesList"
import ParentTradieDisplay from "@/components/ParentTradieDisplay"
import type { ProjectData, UserProfileData } from "@/lib/services/apiClient"

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
  // All properties are already defined in UserProfileData
  parent_tradie_id?: string | null
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState("matched")
  const [tabCounts, setTabCounts] = useState({
    matched: 0,
    projects: 0,
    quotes: 0,
    messages: 0
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
      
      if (dashboardResponse && dashboardResponse.ok) {
        const dashResult = await dashboardResponse.json()
        if (dashResult.success) {
          setDashboardData(dashResult.data)
        }
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
            availableJobs: 15,
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
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

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
              {userProfile.language && (
                <p className="text-sm text-blue-600 font-medium">
                  🌐 {userProfile.language}
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

        {/* Anonymous Project Claim Notification */}
        <AnonymousProjectClaimNotification />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tradie Profile Completion */}
            <TradieProfileCompletion
              userProfile={userProfile}
              emailVerified={user.emailConfirmed}
              onProfileUpdate={() => checkUser()}
            />
            
            {/* Primary CTA - Browse Jobs */}
            <Button className="w-full h-20 flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white text-xl font-medium mb-6" asChild>
              <Link href="/browse-jobs">
                <Target className="w-8 h-8" />
                <span>浏览最新项目</span>
              </Link>
            </Button>

            {/* Tabbed Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-green-600" />
                  技师工作台
                  <Badge className="ml-2 text-xs bg-green-100 text-green-800">专业服务</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <div className="grid grid-cols-5 gap-3 p-1">
                    <button
                      onClick={() => setActiveTab("matched")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "matched"
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                      }`}
                    >
                      <Target className="w-5 h-5 mb-1 text-green-600" />
                      <span className="text-xs font-medium text-gray-700">匹配项目</span>
                      {tabCounts.matched > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.matched}
                        </div>
                      )}
                    </button>
                    
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
                          ? "border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-md"
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mb-1 text-yellow-600" />
                      <span className="text-xs font-medium text-gray-700">我的报价</span>
                      {tabCounts.quotes > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
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
                      <span className="text-xs font-medium text-gray-700">客户沟通</span>
                      {tabCounts.messages > 0 && (
                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm">
                          {tabCounts.messages}
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200 ${
                        activeTab === "schedule"
                          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-md"
                      }`}
                    >
                      <Calendar className="w-5 h-5 mb-1 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">日程管理</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {activeTab === "matched" && (
                      <MatchedProjectsList 
                        tradieId={user.id} 
                        onCountChange={(count) => setTabCounts(prev => ({ ...prev, matched: count }))}
                      />
                    )}

                    {activeTab === "projects" && (
                      <TradieProjectsList 
                        tradieId={user.id}
                        onCountChange={(count) => setTabCounts(prev => ({ ...prev, projects: count }))}
                      />
                    )}

                    {activeTab === "quotes" && (
                      <TradieQuotesList 
                        tradieId={user.id}
                        onCountChange={(count) => setTabCounts(prev => ({ ...prev, quotes: count }))}
                      />
                    )}

                    {activeTab === "messages" && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">暂无客户消息</p>
                            <p className="text-sm text-gray-400">
                              当有客户联系您时，消息会显示在这里
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

                    {activeTab === "schedule" && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">日程管理功能即将推出</p>
                            <p className="text-sm text-gray-400">
                              您将能够在这里管理工作日程和客户预约
                            </p>
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

            {/* Parent Tradie Display */}
            <ParentTradieDisplay childTradieId={user.id} />

            {/* Team Management - Only show for main tradies (not subordinate tradies) */}
            {!userProfile.parent_tradie_id && (
              <SubordinateTradiesList 
                parentTradieId={user.id} 
                parentCompany={userProfile.tradieData?.company}
                onRefresh={() => checkUser()}
              />
            )}

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
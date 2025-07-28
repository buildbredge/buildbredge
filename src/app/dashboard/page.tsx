"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User, Home, Briefcase, MessageCircle, Star,
  Settings, Plus, Eye, Calendar, DollarSign,
  Bell, LogOut, Shield, CheckCircle, Clock
} from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import { apiClient } from "../../../lib/services/apiClient"
import { authService } from "../../../lib/services/authService"
import type { ProjectData, UserProfileData } from "../../../lib/services/apiClient"

interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [showProjects, setShowProjects] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)

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

      // 使用安全API获取用户资料
      const profileResponse = await apiClient.getUserProfile()
      
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data)
      } else {
        console.error('Failed to fetch user profile:', profileResponse.error)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    if (!user) return
    
    setLoadingProjects(true)
    try {
      const response = await apiClient.getProjects({ page: 1, limit: 10 })
      
      if (response.success && response.data) {
        setProjects(response.data.projects)
      } else {
        console.error('Error fetching projects:', response.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleShowProjects = () => {
    setShowProjects(true)
    fetchUserProjects()
  }

  const handleLogout = async () => {
    await authService.logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
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
        <Navigation />
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

  const isTradie = userProfile.userType === 'tradie'
  const displayName = userProfile.name || user.email?.split('@')[0] || '用户'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                欢迎回来，{displayName}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant={isTradie ? "default" : "secondary"}>
                  {isTradie ? '技师账户' : '房主账户'}
                </Badge>
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
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isTradie ? (
                    <>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline">
                        <Eye className="w-6 h-6" />
                        <span className="text-sm">查看项目</span>
                      </Button>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm">客户消息</span>
                      </Button>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline">
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm">日程安排</span>
                      </Button>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline">
                        <DollarSign className="w-6 h-6" />
                        <span className="text-sm">收入统计</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="h-20 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700 text-white" asChild>
                        <Link href="/post-job">
                          <Plus className="w-6 h-6" />
                          <span className="text-sm">发布项目</span>
                        </Link>
                      </Button>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline" asChild>
                        <Link href="/browse-tradies">
                          <User className="w-6 h-6" />
                          <span className="text-sm">找技师</span>
                        </Link>
                      </Button>
                      <Button className="h-20 flex flex-col items-center space-y-2" variant="outline">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm">消息</span>
                      </Button>
                      <Button 
                        className="h-20 flex flex-col items-center space-y-2" 
                        variant="outline"
                        onClick={handleShowProjects}
                      >
                        <Briefcase className="w-6 h-6" />
                        <span className="text-sm">我的项目</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects List or Recent Activity */}
            {showProjects ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>我的项目</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProjects(false)}
                  >
                    返回
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingProjects ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">加载中...</p>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无项目记录</p>
                      <Button className="mt-4" asChild>
                        <Link href="/post-job">
                          <Plus className="w-4 h-4 mr-2" />
                          发布第一个项目
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project) => (
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
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.description.length > 60 
                                ? `${project.description.substring(0, 60)}...` 
                                : project.description}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>
                                {new Date(project.createdAt).toLocaleDateString('zh-CN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <Badge 
                                variant={
                                  project.status === 'published' ? 'default' :
                                  project.status === 'in_progress' ? 'secondary' :
                                  project.status === 'completed' ? 'outline' : 'destructive'
                                }
                                className="text-xs"
                              >
                                {project.status === 'published' && '已发布'}
                                {project.status === 'draft' && '草稿'}
                                {project.status === 'in_progress' && '进行中'}
                                {project.status === 'completed' && '已完成'}
                                {project.status === 'cancelled' && '已取消'}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Eye className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">账户创建成功</p>
                        <p className="text-xs text-gray-500">
                          {new Date(userProfile.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>

                    {!user.emailConfirmed && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">等待邮箱验证</p>
                          <p className="text-xs text-gray-500">请检查您的邮箱</p>
                        </div>
                      </div>
                    )}

                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无更多活动记录</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">姓名</Label>
                  <p className="font-medium">{userProfile.name || '未填写'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">邮箱</Label>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">电话</Label>
                  <p className="font-medium">{userProfile.phone || '未填写'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">地址</Label>
                  <p className="font-medium">{userProfile.location || '未填写'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">状态</Label>
                  <Badge variant={userProfile.status === 'approved' ? 'default' : 'secondary'}>
                    {userProfile.status === 'approved' ? '已认证' : userProfile.status === 'pending' ? '待审核' : '已关闭'}
                  </Badge>
                </div>

                {/* Tradie specific info */}
                {isTradie && userProfile.company && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-500">公司名称</Label>
                      <p className="font-medium">{userProfile.company || '未填写'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">专业技能</Label>
                      <p className="font-medium">{userProfile.specialty || '未填写'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">服务半径</Label>
                      <p className="font-medium">{userProfile.serviceRadius || 25}公里</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">评分</Label>
                      <p className="font-medium flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {userProfile.rating || '暂无'} ({userProfile.reviewCount || 0} 评价)
                      </p>
                    </div>
                  </>
                )}

                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    编辑资料
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>统计信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTradie ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">完成项目</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">客户评价</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均评分</span>
                      <span className="font-medium flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        暂无
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">发布项目</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">进行中</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">已完成</span>
                      <span className="font-medium">0</span>
                    </div>
                  </>
                )}
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
                  <Shield className="w-4 h-4 mr-2" />
                  安全中心
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

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={className}>{children}</label>
}

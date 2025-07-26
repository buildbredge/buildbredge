"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Bell,
  Mail,
  MessageSquare,
  DollarSign,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Archive,
  Filter,
  Search
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "message" | "payment" | "project" | "review" | "system" | "reminder"
  priority: "low" | "medium" | "high" | "urgent"
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    projectId?: string
    tradieId?: string
    amount?: number
    rating?: number
  }
}

interface NotificationSettings {
  email: {
    newMessages: boolean
    projectUpdates: boolean
    paymentAlerts: boolean
    reviewRequests: boolean
    systemUpdates: boolean
    marketingEmails: boolean
  }
  push: {
    newMessages: boolean
    projectUpdates: boolean
    paymentAlerts: boolean
    reviewRequests: boolean
    urgentAlerts: boolean
  }
  sms: {
    urgentOnly: boolean
    paymentAlerts: boolean
    projectDeadlines: boolean
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "新消息来自张建国",
      message: "关于厨房翻新项目的材料清单已经准备好了",
      type: "message",
      priority: "medium",
      timestamp: "5分钟前",
      read: false,
      actionUrl: "/messages",
      actionLabel: "查看消息",
      metadata: {
        projectId: "proj-001",
        tradieId: "tradie-001"
      }
    },
    {
      id: "2",
      title: "支付确认",
      message: "您的托管资金 $8,500 已成功存入项目账户",
      type: "payment",
      priority: "high",
      timestamp: "1小时前",
      read: false,
      actionUrl: "/payment",
      actionLabel: "查看详情",
      metadata: {
        amount: 8500,
        projectId: "proj-001"
      }
    },
    {
      id: "3",
      title: "项目里程碑完成",
      message: "厨房翻新项目的第一阶段(拆除工作)已完成，请确认验收",
      type: "project",
      priority: "high",
      timestamp: "3小时前",
      read: true,
      actionUrl: "/dashboard",
      actionLabel: "验收确认",
      metadata: {
        projectId: "proj-001"
      }
    },
    {
      id: "4",
      title: "请为技师评分",
      message: "您的卫生间漏水维修项目已完成，请为李师傅的服务评分",
      type: "review",
      priority: "medium",
      timestamp: "1天前",
      read: true,
      actionUrl: "/reviews",
      actionLabel: "立即评分",
      metadata: {
        tradieId: "tradie-002",
        projectId: "proj-002"
      }
    },
    {
      id: "5",
      title: "系统维护通知",
      message: "平台将于今晚11点进行系统维护，预计持续2小时",
      type: "system",
      priority: "low",
      timestamp: "2天前",
      read: true,
      metadata: {}
    },
    {
      id: "6",
      title: "项目报价提醒",
      message: "您发布的'客厅电路升级'项目已收到5个技师报价",
      type: "reminder",
      priority: "medium",
      timestamp: "3天前",
      read: true,
      actionUrl: "/dashboard",
      actionLabel: "查看报价"
    }
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newMessages: true,
      projectUpdates: true,
      paymentAlerts: true,
      reviewRequests: true,
      systemUpdates: false,
      marketingEmails: false
    },
    push: {
      newMessages: true,
      projectUpdates: true,
      paymentAlerts: true,
      reviewRequests: true,
      urgentAlerts: true
    },
    sms: {
      urgentOnly: true,
      paymentAlerts: true,
      projectDeadlines: true
    }
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="w-5 h-5 text-blue-600" />
      case "payment": return <DollarSign className="w-5 h-5 text-green-600" />
      case "project": return <Calendar className="w-5 h-5 text-purple-600" />
      case "review": return <Star className="w-5 h-5 text-yellow-600" />
      case "system": return <Settings className="w-5 h-5 text-gray-600" />
      case "reminder": return <Bell className="w-5 h-5 text-orange-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-l-red-500 bg-red-50"
      case "high": return "border-l-orange-500 bg-orange-50"
      case "medium": return "border-l-blue-500 bg-blue-50"
      case "low": return "border-l-gray-500 bg-gray-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case "unread": return !notification.read
      case "messages": return notification.type === "message"
      case "projects": return notification.type === "project" || notification.type === "reminder"
      case "payments": return notification.type === "payment"
      default: return true
    }
  })

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const updateSettings = (category: keyof NotificationSettings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">BuildBridge</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                返回通知
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">通知设置</h1>
              <p className="text-gray-600">管理您接收通知的方式和频率</p>
            </div>

            <div className="space-y-6">
              {/* 邮件通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>邮件通知</span>
                  </CardTitle>
                  <CardDescription>
                    选择您希望通过邮件接收的通知类型
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {key === 'newMessages' ? '新消息' :
                           key === 'projectUpdates' ? '项目更新' :
                           key === 'paymentAlerts' ? '支付提醒' :
                           key === 'reviewRequests' ? '评价请求' :
                           key === 'systemUpdates' ? '系统更新' :
                           key === 'marketingEmails' ? '营销邮件' : key}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'newMessages' ? '收到新消息时发送邮件' :
                           key === 'projectUpdates' ? '项目状态变化时通知' :
                           key === 'paymentAlerts' ? '支付相关的重要提醒' :
                           key === 'reviewRequests' ? '项目完成后的评价邀请' :
                           key === 'systemUpdates' ? '系统维护和更新通知' :
                           key === 'marketingEmails' ? '产品更新和推广信息' : ''}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateSettings('email', key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 推送通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>推送通知</span>
                  </CardTitle>
                  <CardDescription>
                    管理浏览器和移动设备的推送通知
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {key === 'newMessages' ? '新消息' :
                           key === 'projectUpdates' ? '项目更新' :
                           key === 'paymentAlerts' ? '支付提醒' :
                           key === 'reviewRequests' ? '评价请求' :
                           key === 'urgentAlerts' ? '紧急提醒' : key}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'urgentAlerts' ? '紧急情况的即时推送' : '实时推送通知'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateSettings('push', key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 短信通知 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>短信通知</span>
                  </CardTitle>
                  <CardDescription>
                    重要事件的短信提醒
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.sms).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {key === 'urgentOnly' ? '仅紧急情况' :
                           key === 'paymentAlerts' ? '支付提醒' :
                           key === 'projectDeadlines' ? '项目截止日期' : key}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'urgentOnly' ? '只在紧急情况下发送短信' :
                           key === 'paymentAlerts' ? '支付成功或失败的短信确认' :
                           key === 'projectDeadlines' ? '项目重要节点提醒' : ''}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateSettings('sms', key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">
                  保存设置
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">BuildBridge</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <Bell className="w-3 h-3 mr-1" />
              通知中心 {unreadCount > 0 && `(${unreadCount})`}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">返回控制台</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">通知中心</h1>
              <p className="text-gray-600">管理您的所有通知和提醒</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  全部标记为已读
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="unread">
                      未读 {unreadCount > 0 && `(${unreadCount})`}
                    </TabsTrigger>
                    <TabsTrigger value="messages">消息</TabsTrigger>
                    <TabsTrigger value="projects">项目</TabsTrigger>
                    <TabsTrigger value="payments">支付</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="m-0">
                  <ScrollArea className="h-[600px]">
                    <div className="p-6 space-y-4">
                      {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
                          <p className="text-gray-600">所有通知都会显示在这里</p>
                        </div>
                      ) : (
                        filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`border-l-4 rounded-lg p-4 transition-colors hover:bg-gray-50 ${
                              getPriorityColor(notification.priority)
                            } ${!notification.read ? 'ring-1 ring-blue-200' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    )}
                                    <Badge className={`text-xs ${
                                      notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                      notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                      notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {notification.priority === 'urgent' ? '紧急' :
                                       notification.priority === 'high' ? '重要' :
                                       notification.priority === 'medium' ? '中等' : '一般'}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 mt-1">{notification.message}</p>
                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-sm text-gray-500">{notification.timestamp}</span>
                                    <div className="flex items-center space-x-2">
                                      {notification.actionUrl && (
                                        <Button size="sm" variant="outline" asChild>
                                          <Link href={notification.actionUrl}>
                                            {notification.actionLabel}
                                          </Link>
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    title="标记为已读"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

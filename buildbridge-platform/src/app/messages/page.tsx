"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Star,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  File,
  Plus,
  Archive,
  Trash2,
  Pin,
  Smile
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  type: "text" | "image" | "file"
  status: "sent" | "delivered" | "read"
  attachments?: {
    type: string
    name: string
    url: string
    size?: string
  }[]
}

interface Participant {
  id: string
  name: string
  avatar: string
  role: "homeowner" | "tradie" | "supplier"
  online: boolean
  lastSeen?: string
}

interface Chat {
  id: string
  participants: Participant[]
  projectId?: string
  projectTitle?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  pinned: boolean
  archived: boolean
}

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 模拟聊天数据
  const chats: Chat[] = useMemo(() => [
    {
      id: "1",
      participants: [
        {
          id: "user1",
          name: "张三",
          avatar: "ZS",
          role: "homeowner",
          online: true
        },
        {
          id: "tradie1",
          name: "张建国",
          avatar: "ZJG",
          role: "tradie",
          online: true
        }
      ],
      projectId: "proj-001",
      projectTitle: "厨房翻新改造",
      lastMessage: "好的，我明天上午过来查看现场",
      lastMessageTime: "2分钟前",
      unreadCount: 2,
      pinned: true,
      archived: false
    }
  ], [])

  // 模拟消息数据
  const messages: Record<string, Message[]> = useMemo(() => ({
    "1": [
      {
        id: "msg1",
        senderId: "user1",
        senderName: "张三",
        senderAvatar: "ZS",
        content: "你好，我想咨询一下厨房翻新的事情",
        timestamp: "上午 10:30",
        type: "text",
        status: "read"
      }
    ]
  }), [])

  const currentChat = chats.find((chat: Chat) => chat.id === selectedChat)
  const currentMessages = useMemo(() => {
    return selectedChat ? messages[selectedChat] || [] : []
  }, [selectedChat, messages])
  const otherParticipant = currentChat?.participants.find((p: Participant) => p.id !== "user1")

  const sendMessage = () => {
    if (!message.trim() || !selectedChat) return
    console.log("发送消息:", message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentMessages])

  const filteredChats = chats.filter((chat: Chat) => {
    const matchesSearch = chat.participants.some((p: Participant) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || (chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab = activeTab === "all" ||
                      (activeTab === "unread" && chat.unreadCount > 0) ||
                      (activeTab === "pinned" && chat.pinned) ||
                      (activeTab === "archived" && chat.archived)

    return matchesSearch && matchesTab && !chat.archived
  })

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
              消息中心
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">返回控制台</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* 聊天列表 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>消息</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索对话..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-340px)]">
                <div className="space-y-1 px-4 pb-4">
                  {filteredChats.map((chat) => {
                    const otherUser = chat.participants.find((p: Participant) => p.id !== "user1")
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedChat === chat.id ? 'bg-green-50 border border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {otherUser?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherUser?.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 聊天窗口 */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">开始对话</h3>
                <p className="text-gray-600">选择的对话将显示在这里</p>
              </CardContent>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个对话</h3>
                  <p className="text-gray-600">选择左侧的对话开始聊天</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

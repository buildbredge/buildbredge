"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TradieModal } from "@/components/TradieModal"
import { 
  Users, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Building,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react"

interface TradieData {
  id: string
  name: string
  phone: string
  email: string
  address: string
  company?: string
  experience_years?: number
  bio?: string
  rating: number
  review_count: number
  distance?: number
  professions: Array<{
    id: string
    name_en: string
    name_zh: string
    category_id: string
  }>
  primary_profession?: {
    id: string
    name_en: string
    name_zh: string
    category_id: string
  }
}

interface TradieRecommendationsProps {
  projectId: string
}

export function TradieRecommendations({ projectId }: TradieRecommendationsProps) {
  const [tradies, setTradies] = useState<TradieData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedTradie, setSelectedTradie] = useState<TradieData | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchRecommendedTradies = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${projectId}/recommended-tradies`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch recommended tradies")
        }
        
        const data = await response.json()
        setTradies(data.tradies || [])
      } catch (err) {
        console.error("Error fetching recommended tradies:", err)
        setError("无法获取推荐技师，请稍后再试")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchRecommendedTradies()
    }
  }, [projectId])

  const handleTradieClick = (tradie: TradieData) => {
    setSelectedTradie(tradie)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedTradie(null)
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1) {
      return `${Math.round(distance * 1000)}米`
    }
    return `${distance.toFixed(1)}公里`
  }

  const handleQuickContact = (tradie: TradieData, method: 'phone' | 'email', e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal
    if (method === 'phone' && tradie.phone) {
      window.open(`tel:${tradie.phone}`)
    } else if (method === 'email' && tradie.email) {
      window.open(`mailto:${tradie.email}`)
    }
  }

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            推荐技师
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">正在匹配合适的技师...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            推荐技师
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mr-3" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tradies.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            推荐技师
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 mb-2">暂时没有找到匹配的技师</p>
            <p className="text-sm text-gray-400">
              系统会持续为您寻找合适的专业技师，请稍后再查看
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              推荐技师
            </div>
            <Badge className="bg-green-100 text-green-800">
              找到 {tradies.length} 位匹配技师
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            基于项目需求为您推荐的专业技师，点击查看详细信息
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradies.map((tradie) => (
              <div
                key={tradie.id}
                className="p-4 border rounded-lg hover:border-green-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                onClick={() => handleTradieClick(tradie)}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-green-100 text-green-800">
                      {tradie.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {tradie.name}
                    </h4>
                    {tradie.company && (
                      <p className="text-sm text-gray-600 truncate">
                        {tradie.company}
                      </p>
                    )}
                    {tradie.rating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {tradie.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tradie.review_count})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {tradie.primary_profession && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {tradie.primary_profession.name_zh || tradie.primary_profession.name_en}
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {tradie.experience_years && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{tradie.experience_years}年经验</span>
                      </div>
                    )}
                    {tradie.distance && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{formatDistance(tradie.distance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => handleQuickContact(tradie, 'phone', e)}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    电话
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => handleQuickContact(tradie, 'email', e)}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    邮件
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* More Options */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600 mb-3">
              没有找到合适的技师？
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                扩大搜索范围
              </Button>
              <Button variant="outline" size="sm">
                发布到更多类别
              </Button>
              <Button variant="outline" size="sm">
                联系客服协助
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tradie Detail Modal */}
      <TradieModal
        tradie={selectedTradie}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  )
}
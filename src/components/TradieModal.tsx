"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase,
  Star,
  Calendar,
  MessageCircle,
  X
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

interface TradieModalProps {
  tradie: TradieData | null
  isOpen: boolean
  onClose: () => void
}

export function TradieModal({ tradie, isOpen, onClose }: TradieModalProps) {
  if (!tradie) return null

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1) {
      return `${Math.round(distance * 1000)}米`
    }
    return `${distance.toFixed(1)}公里`
  }

  const handleContact = (method: 'phone' | 'email') => {
    if (method === 'phone' && tradie.phone) {
      window.open(`tel:${tradie.phone}`)
    } else if (method === 'email' && tradie.email) {
      window.open(`mailto:${tradie.email}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">技师详情</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tradie Header */}
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl bg-green-100 text-green-800">
                {tradie.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{tradie.name}</h3>
                {tradie.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">
                      {tradie.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({tradie.review_count} 评价)
                    </span>
                  </div>
                )}
              </div>
              
              {tradie.company && (
                <p className="text-gray-700 font-medium mb-1">{tradie.company}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {tradie.primary_profession && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {tradie.primary_profession.name_zh || tradie.primary_profession.name_en}
                  </Badge>
                )}
                {tradie.experience_years && (
                  <Badge variant="secondary" className="text-xs">
                    {tradie.experience_years}年经验
                  </Badge>
                )}
                {tradie.distance && (
                  <Badge variant="outline" className="text-xs">
                    距离 {formatDistance(tradie.distance)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                基本信息
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">电话号码</p>
                    <p className="font-medium">{tradie.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">邮箱地址</p>
                    <p className="font-medium text-sm break-all">{tradie.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">服务地址</p>
                    <p className="font-medium text-sm">{tradie.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                专业技能
              </h4>
              
              <div className="space-y-3">
                {tradie.professions.map((profession, index) => (
                  <div key={profession.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800">
                      {profession.name_zh || profession.name_en}
                    </p>
                  </div>
                ))}
              </div>
              
              {tradie.experience_years && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">工作经验</p>
                    <p className="font-medium">{tradie.experience_years} 年</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {tradie.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">个人简介</h4>
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {tradie.bio}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => handleContact('phone')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              立即致电
            </Button>
            <Button
              onClick={() => handleContact('email')}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              平台消息
            </Button>
          </div>
          
          {/* Trust Badge */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-blue-700">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>平台认证</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>身份验证</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>服务保障</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
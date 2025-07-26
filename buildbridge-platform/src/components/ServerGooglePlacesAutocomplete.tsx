"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { MapPin, Loader2, CheckCircle } from 'lucide-react'

// 地址结果类型
export interface PlaceResult {
  address: string
  placeId: string
  country: string
  state: string
  city: string
  district: string
  postalCode: string
}

// 自动完成建议类型
interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface ServerGooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function ServerGooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "输入地址...",
  label = "地址",
  className = ""
}: ServerGooglePlacesAutocompleteProps) {
  const [input, setInput] = useState("")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // 调用服务器端API获取自动完成建议
  const fetchPredictions = async (query: string) => {
    if (query.length < 2) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('🔍 搜索地址:', query)

      const response = await fetch(`/api/autocomplete?input=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API请求失败')
      }

      if (data.status === 'OK' && data.predictions) {
        console.log('✅ 获得', data.predictions.length, '个地址建议')
        setPredictions(data.predictions)
        setShowSuggestions(true)
      } else {
        console.warn('⚠️ API返回状态:', data.status)
        setPredictions([])
      }
    } catch (err) {
      console.error('❌ 获取地址建议失败:', err)
      setError(err instanceof Error ? err.message : '获取地址建议失败')
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }

  // 防抖处理输入
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (input.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchPredictions(input.trim())
      }, 300)
    } else {
      setPredictions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [input])

  // 处理地址选择
  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    console.log('📍 选择地址:', prediction.description)

    setInput(prediction.description)
    setShowSuggestions(false)

    // 创建地址结果
    const placeResult: PlaceResult = {
      address: prediction.description,
      placeId: prediction.place_id,
      country: extractFromDescription(prediction.description, 'country'),
      state: extractFromDescription(prediction.description, 'state'),
      city: extractFromDescription(prediction.description, 'city'),
      district: "",
      postalCode: ""
    }

    setSelectedPlace(placeResult)
    onPlaceSelect(placeResult)
  }

  // 简单的地址解析
  const extractFromDescription = (description: string, type: string): string => {
    const parts = description.split(', ')

    switch (type) {
      case 'country':
        return parts[parts.length - 1] || ""
      case 'state':
        return parts[parts.length - 2] || ""
      case 'city':
        return parts[1] || ""
      default:
        return ""
    }
  }

  // 重新选择地址
  const handleReset = () => {
    setSelectedPlace(null)
    setInput("")
    setPredictions([])
    setShowSuggestions(false)
    setError("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 如果已选择地址，显示选中状态
  if (selectedPlace) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-green-600">{label}</Label>}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-800 mb-1">已选择地址</p>
                <p className="text-sm text-gray-700">{selectedPlace.address}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-green-600 hover:text-green-700 underline"
              >
                重新选择
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-2 relative">
      {label && <Label>{label}</Label>}

      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={className}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          ❌ {error}
        </div>
      )}

      {/* 自动完成建议 */}
      {showSuggestions && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 shadow-lg border">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePlaceSelect(prediction)}
                  className="w-full text-left p-3 hover:bg-gray-50 flex items-start space-x-2 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 无结果提示 */}
      {showSuggestions && !isLoading && predictions.length === 0 && input.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 shadow-lg border">
          <CardContent className="p-4 text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">未找到地址建议</p>
            <p className="text-xs text-gray-400 mt-1">请尝试输入更具体的地址</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 显示选中地址的组件
interface SelectedAddressDisplayProps {
  place: PlaceResult | null
  onEdit: () => void
}

export function SelectedAddressDisplay({ place, onEdit }: SelectedAddressDisplayProps) {
  if (!place) return null

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">已选择地址</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">{place.address}</p>
            <div className="text-xs text-gray-600 space-y-1">
              {place.country && <p><strong>国家:</strong> {place.country}</p>}
              {place.state && <p><strong>州/省:</strong> {place.state}</p>}
              {place.city && <p><strong>城市:</strong> {place.city}</p>}
              {place.district && <p><strong>区域:</strong> {place.district}</p>}
              {place.postalCode && <p><strong>邮编:</strong> {place.postalCode}</p>}
            </div>
          </div>
          <button
            onClick={onEdit}
            className="text-sm text-green-600 hover:text-green-700 underline"
          >
            重新选择
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

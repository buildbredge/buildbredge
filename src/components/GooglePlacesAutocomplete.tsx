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
  coordinates?: {
    lat: number
    lng: number
  }
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

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void
  placeholder?: string
  label?: string
  className?: string
  countries?: string[]
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "输入地址...",
  label = "地址",
  className = "",
  countries = ['nz', 'au', 'us', 'ca']
}: GooglePlacesAutocompleteProps) {
  const [input, setInput] = useState("")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

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
        setHighlightedIndex(0)
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('ℹ️ 没有找到匹配的地址')
        setPredictions([])
        setShowSuggestions(true) // 仍然显示建议区域，但会显示"未找到"消息
      } else {
        console.warn('⚠️ API返回状态:', data.status)
        setPredictions([])
        setShowSuggestions(false)
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
      setHighlightedIndex(0)
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

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || predictions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
          handlePlaceSelect(predictions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setHighlightedIndex(0)
        break
    }
  }

  // 重新选择地址
  const handleReset = () => {
    setSelectedPlace(null)
    setInput("")
    setPredictions([])
    setShowSuggestions(false)
    setError("")
    setHighlightedIndex(0)
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
          onKeyDown={handleKeyDown}
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
              {predictions.map((prediction, index) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePlaceSelect(prediction)}
                  className={`w-full text-left p-3 flex items-start space-x-2 border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      index === highlightedIndex ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className={`text-xs truncate ${
                      index === highlightedIndex ? 'text-blue-600' : 'text-gray-500'
                    }`}>
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

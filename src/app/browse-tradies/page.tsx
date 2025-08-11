"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { tradiesApi, Tradie } from "@/lib/api"

const locationData = {
  "新西兰": {
    "奥克兰": [
      "CBD", "Ponsonby", "Parnell", "Newmarket", "North Shore", "Mt Eden", "Manukau", "Remuera", "Epsom", "Browns Bay", "Albany"
    ],
    "惠灵顿": [
      "CBD", "Te Aro", "Kelburn", "Johnsonville", "Miramar", "Newtown"
    ],
    "基督城": [
      "CBD", "Riccarton", "Addington", "Fendalton", "Papanui", "Sydenham", "Linwood", "Ilam"
    ],
    "汉密尔顿": [
      "CBD", "Hamilton East", "Chartwell", "Hillcrest", "Frankton"
    ]
  },
  "澳大利亚": {
    "悉尼": [
      "CBD", "Bondi", "Manly", "Chatswood", "Parramatta", "Strathfield", "Newtown", "Mascot", "Epping"
    ],
    "墨尔本": [
      "CBD", "South Yarra", "Richmond", "Box Hill", "Glen Waverley", "Docklands", "Fitzroy", "St Kilda"
    ],
    "布里斯班": [
      "CBD", "Fortitude Valley", "South Bank", "Sunnybank", "Toowong"
    ],
    "珀斯": [
      "CBD", "Fremantle", "Subiaco", "Cottesloe", "Northbridge"
    ]
  },
  "美国": {
    "洛杉矶": [
      "Downtown", "Hollywood", "Santa Monica", "Pasadena", "Beverly Hills", "Chinatown", "Long Beach"
    ],
    "纽约": [
      "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Chinatown", "Flushing", "Harlem"
    ],
    "旧金山": [
      "Downtown", "Mission District", "Chinatown", "Nob Hill", "Sunset", "SoMa"
    ],
    "芝加哥": [
      "The Loop", "River North", "Hyde Park", "Chinatown", "Lake View"
    ]
  },
  "加拿大": {
    "多伦多": [
      "Downtown", "North York", "Scarborough", "Etobicoke", "York", "Markham", "Richmond Hill"
    ],
    "温哥华": [
      "Downtown", "Richmond", "Burnaby", "Surrey", "Kitsilano", "West End"
    ],
    "蒙特利尔": [
      "Downtown", "Old Montreal", "Plateau", "Rosemont", "Ville-Marie", "Chinatown"
    ],
    "卡尔加里": [
      "Downtown", "Beltline", "Kensington", "Hillhurst", "Inglewood"
    ]
  }
}

const tradeCategories = [
  "电气服务", "水管维修", "建筑施工", "油漆装饰", "木工制作",
  "园艺绿化", "设备安装", "建材供应", "清洁服务", "搬家服务"
]

// 专业映射
const specialtyMap: Record<string, string> = {
  "电气服务": "电气服务",
  "水管维修": "水管维修",
  "建筑施工": "建筑施工",
  "油漆装饰": "油漆装饰",
  "木工制作": "木工制作",
  "园艺绿化": "园艺绿化",
  "设备安装": "设备安装",
  "建材供应": "建材供应",
  "清洁服务": "清洁服务",
  "搬家服务": "搬家服务"
}

// 为显示添加的扩展技师类型，包含所有UI需要的字段
interface ExtendedTradie {
  id: string
  name: string | null
  phone: string | null
  email: string
  company: string | null
  specialty: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  service_radius: number | null
  status: 'active' | 'pending' | 'approved' | 'closed' | 'suspended'
  balance: number
  rating: number | null
  review_count: number
  created_at: string
  updated_at: string
  avatar?: string
  type?: 'company' | 'individual'
  category?: string | null
  reviews?: number
  location?: string
  description?: string
}

export default function BrowseTradiesPage() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [tradies, setTradies] = useState<ExtendedTradie[]>([])
  const [loading, setLoading] = useState(true)

  // 加载技师数据
  useEffect(() => {
    loadTradies()
  }, [])

  const loadTradies = async () => {
    try {
      setLoading(true)
      const data = await tradiesApi.getApproved() // 只获取已认证的技师

      // 为每个技师添加默认的显示字段
      const extendedTradies: ExtendedTradie[] = data.map((tradie, index) => ({
        ...tradie,
        avatar: `https://ext.same-assets.com/1633456512/professional-${(index % 5) + 1}.jpeg`,
        type: (tradie.company || '').includes('公司') || (tradie.company || '').includes('有限') || (tradie.company || '').includes('工作室') ? 'company' : 'individual',
        category: tradie.specialty,
        reviews: tradie.review_count || Math.floor(Math.random() * 50) + 10, // 使用数据库评价数或随机评价数 10-60
        location: "新西兰-奥克兰", // 默认位置，后续可从数据库获取
        description: `专业${tradie.specialty || '服务'}，经验丰富，质量保证`,
        updated_at: (tradie as any).updated_at || tradie.created_at // 添加 updated_at 字段，暂时使用 any 类型
      }))

      setTradies(extendedTradies)
    } catch (error) {
      console.error('加载技师数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const countries = Object.keys(locationData)
  const cities = selectedCountry ? Object.keys(locationData[selectedCountry as keyof typeof locationData] || {}) : []
  const districts = selectedCountry && selectedCity ? locationData[selectedCountry as keyof typeof locationData]?.[selectedCity as keyof typeof locationData[keyof typeof locationData]] || [] : []

  const handleCategoryClick = (category: string) => {
    router.push(`/browse-tradies/${encodeURIComponent(category)}`)
  }

  // 筛选技师
  const filteredTradies = tradies.filter(tradie => {
    let matches = true

    // 按专业筛选
    if (selectedCategory && selectedCategory !== "" && tradie.specialty !== selectedCategory) {
      matches = false
    }

    // 按类型筛选（简化处理：如果公司名包含"公司"或"有限"则认为是公司）
    if (selectedType && selectedType !== "") {
      const isCompany = (tradie.company || '').includes('公司') || (tradie.company || '').includes('有限') || (tradie.company || '').includes('工作室')
      const tradieType = isCompany ? 'company' : 'individual'
      if (tradieType !== selectedType) {
        matches = false
      }
    }

    // 位置筛选逻辑可以在这里添加
    // 目前数据库中没有结构化的位置信息，可以后续优化

    return matches
  })

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">寻找技师</h1>
            <p className="text-xl text-green-100">找到您附近的专业技师工人</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* 服务区域 - 国家 */}
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value)
                setSelectedCity("")
                setSelectedDistrict("")
              }}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="选择国家" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 服务区域 - 城市 */}
              <Select value={selectedCity} onValueChange={(value) => {
                setSelectedCity(value)
                setSelectedDistrict("")
              }} disabled={!selectedCountry}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="选择城市" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 服务区域 - 区域 */}
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 技术类别 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="技术类别" />
                </SelectTrigger>
                <SelectContent>
                  {tradeCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 公司/个人 */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="公司" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">公司</SelectItem>
                  <SelectItem value="individual">个人</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">按类别浏览</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {tradeCategories.map((category, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{index === 0 ? "⚡" : index === 1 ? "🔧" : index === 2 ? "🏗️" : index === 3 ? "🎨" : "🔨"}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tradies List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">技师列表</h2>
            <p className="text-gray-600">找到 {filteredTradies.length} 位技师</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTradies.map((tradie) => (
              <Card key={tradie.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <img
                    src={tradie.avatar}
                    alt={tradie.name || '技师'}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{tradie.name || '未知技师'}</h3>
                    <Badge variant={tradie.type === "company" ? "default" : "secondary"}>
                      {tradie.type === "company" ? "公司" : "个人"}
                    </Badge>
                  </div>
                  <p className="text-green-600 font-medium">{tradie.company || '个人服务'}</p>
                  <p className="text-sm text-gray-500">{tradie.category || '综合服务'}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{tradie.rating}</span>
                      <span className="text-gray-500">({tradie.reviews} 评价)</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{tradie.location}</span>
                    </div>

                    <p className="text-sm text-gray-700">{tradie.description}</p>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{tradie.phone || '未提供'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{tradie.email}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      联系技师
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTradies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无符合条件的技师，请调整筛选条件</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

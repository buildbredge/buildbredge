import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Award,
  Camera,
  MessageCircle,
  Share2,
  Heart,
  ExternalLink,
  Clock,
  DollarSign,
  Users
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

// 技师数据接口
interface TradieData {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  rating: number
  review_count: number
  status: string
  created_at: string
  bio?: string
  experience_years?: number
  hourly_rate?: number
  phone_verified?: boolean
}

interface ReviewData {
  id: string
  clientName: string
  project: string
  date: string
  rating: number
  comment: string
  ratings: {
    workmanship: number
    communication: number
    punctuality: number
    cleanliness: number
  }
}

// 从数据库获取技师数据
async function getTradieData(tradieId: string): Promise<TradieData | null> {
  try {
    console.log('Fetching tradie data for ID:', tradieId)
    
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        company,
        address,
        rating,
        review_count,
        status,
        created_at,
        bio,
        experience_years,
        hourly_rate
      `)
      .eq('id', tradieId)
      .single()

    if (error) {
      console.error('Error fetching tradie data:', error)
      return null
    }

    console.log('Found user data:', userData)
    return userData
  } catch (error) {
    console.error('Error in getTradieData:', error)
    return null
  }
}

// 获取技师的专业类别
async function getTradieCategories(tradieId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tradie_professions')
      .select(`
        categories!inner(
          name_zh,
          name_en
        )
      `)
      .eq('tradie_id', tradieId)

    if (error) {
      console.error('Error fetching tradie categories:', error)
      return []
    }

    return data?.map((item: any) => item.categories.name_zh) || []
  } catch (error) {
    console.error('Error in getTradieCategories:', error)
    return []
  }
}

// 获取技师的项目历史
async function getTradiePortfolio(tradieId: string) {
  try {
    const { data, error } = await supabase
      .from('tradie_portfolios')
      .select('*')
      .eq('tradie_id', tradieId)
      .order('completed_date', { ascending: false })

    if (error) {
      console.error('Error fetching tradie portfolio:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTradiePortfolio:', error)
    return []
  }
}

export default async function TradieProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 获取技师数据
  const tradieData = await getTradieData(id)
  const categories = await getTradieCategories(id)
  const portfolioProjects = await getTradiePortfolio(id)
  
  if (!tradieData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">技师不存在</h1>
            <p className="text-gray-600 mb-8">您访问的技师资料不存在或已被删除</p>
            <Button asChild>
              <Link href="/browse-tradies">返回技师目录</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const tradie = {
    id: tradieData.id,
    name: tradieData.name || "未设置姓名",
    companyName: tradieData.company || "个人技师",
    avatar: "/api/placeholder/150/150",
    rating: tradieData.rating || 5.0,
    reviewCount: tradieData.review_count || 0,
    jobsCompleted: Math.floor((tradieData.review_count || 0) * 1.5), // 估算完成项目数
    yearsExperience: tradieData.experience_years || 0,
    location: tradieData.address || "未设置地址",
    category: categories.join(", ") || "未设置专业",
    verified: tradieData.status === 'approved',
    memberSince: new Date(tradieData.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
    responseTime: "24小时内",
    bio: tradieData.bio || "这位技师还没有添加个人简介。",
    skills: categories.length > 0 ? categories : ["专业服务"],
    serviceAreas: [tradieData.address || "服务地区"].filter(Boolean),
    insurance: true,
    backgroundCheck: true,
    hourlyRate: tradieData.hourly_rate,
    phone: tradieData.phone,
    email: tradieData.email,
    projects: portfolioProjects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description || "",
      completedDate: project.completed_date ? new Date(project.completed_date).toLocaleDateString('zh-CN') : "",
      location: project.location || "",
      budget: project.budget || "",
      images: project.images || []
    })),
    reviews: [] as ReviewData[] // 暂时为空，可以后续从数据库获取
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={tradie.avatar} alt={tradie.name} />
                <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                  {tradie.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tradie.name}</h1>
                  {tradie.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      已认证
                    </Badge>
                  )}
                </div>
                
                <div className="text-lg text-gray-600 mb-2">{tradie.companyName}</div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(tradie.rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{tradie.rating}</span>
                    <span className="text-gray-500">({tradie.reviewCount}评价)</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{tradie.jobsCompleted}个完成项目</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{tradie.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{tradie.category}</Badge>
                  <Badge variant="outline">{tradie.yearsExperience}年经验</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {tradie.responseTime}回复
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:ml-auto">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                联系技师
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                收藏
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>关于我们</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">{tradie.bio}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">专业技能</h4>
                    <div className="flex flex-wrap gap-2">
                      {tradie.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">服务区域</h4>
                    <div className="space-y-1">
                      {tradie.serviceAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  历史项目 ({tradie.projects.length})
                </CardTitle>
                <CardDescription>查看我们完成的项目案例</CardDescription>
              </CardHeader>
              <CardContent>
                {tradie.projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无项目案例</h3>
                    <p className="text-gray-600">
                      该技师还没有上传项目案例，您可以直接联系了解更多信息
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {tradie.projects.map((project) => (
                      <div key={project.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/3">
                            <div className="grid grid-cols-2 gap-2">
                              {project.images.slice(0, 4).map((image: string, index: number) => (
                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                                  <Image
                                    src={image}
                                    alt={`${project.title} - 图片 ${index + 1}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                  />
                                  {index === 3 && project.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                                      +{project.images.length - 4}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="md:w-2/3">
                            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{project.completedDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{project.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{project.budget}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  用户评价 ({tradie.reviewCount})
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(tradie.rating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg">{tradie.rating}/5</span>
                    </div>
                    <span className="text-gray-500">基于 {tradie.reviewCount} 条评价</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tradie.reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无用户评价</h3>
                    <p className="text-gray-600">
                      该技师还没有收到评价，成为第一个评价的客户吧！
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {tradie.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {review.clientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.clientName}</h4>
                                  <p className="text-sm text-gray-500">{review.project} · {review.date}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-500 fill-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4">{review.comment}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="text-center">
                                  <div className="text-gray-500 mb-1">工艺质量</div>
                                  <div className="flex items-center justify-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.ratings.workmanship
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500 mb-1">沟通交流</div>
                                  <div className="flex items-center justify-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.ratings.communication
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500 mb-1">守时程度</div>
                                  <div className="flex items-center justify-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.ratings.punctuality
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500 mb-1">整洁度</div>
                                  <div className="flex items-center justify-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.ratings.cleanliness
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline">
                        查看所有评价
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">联系信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  发送消息
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  查看电话
                </Button>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>通常在{tradie.responseTime}回复</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>加入时间: {tradie.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{tradie.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credentials Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">资质认证</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tradie.verified && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">身份已验证</span>
                    </div>
                  )}
                  {tradie.insurance && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">商业保险</span>
                    </div>
                  )}
                  {tradie.backgroundCheck && (
                    <div className="flex items-center gap-2 text-purple-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">背景调查</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">统计信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">完成项目</span>
                    <span className="font-semibold">{tradie.jobsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">用户评价</span>
                    <span className="font-semibold">{tradie.reviewCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">工作经验</span>
                    <span className="font-semibold">{tradie.yearsExperience}年</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">平均评分</span>
                    <span className="font-semibold flex items-center gap-1">
                      {tradie.rating}
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </span>
                  </div>
                  {tradie.hourlyRate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">时薪</span>
                      <span className="font-semibold">${tradie.hourlyRate}/小时</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Similar Tradies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">相似技师</CardTitle>
                <CardDescription>同类型的其他专业技师</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          李
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">李师傅</h4>
                        <p className="text-xs text-gray-500">水电工程 · 4.7⭐</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
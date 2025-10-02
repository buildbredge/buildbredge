import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, ArrowLeft, Users, Briefcase, Mail } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// 技师信息接口（从 tradie_professions 关联查询）
interface TradieWithProfession {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  rating: number
  review_count: number
  status: string
  created_at: string
  bio: string | null
  experience_years: number | null
  hourly_rate: number | null
}

async function loadTradiesForProfession(professionId: string) {
  console.log('Loading tradies for profession ID:', professionId)

  const { data: professionRows, error: professionError } = await supabase
    .from('professions')
    .select(`
      id,
      name_zh,
      name_en,
      category_id,
      categories(id, name_zh, name_en)
    `)
    .eq('id', professionId)

  if (professionError) {
    console.error('Error loading profession:', professionError)
    return { profession: null, tradies: [] }
  }

  const professionData = professionRows?.[0]
  if (!professionData) {
    console.warn('Profession not found:', professionId)
    return { profession: null, tradies: [] }
  }

  const { data: tradieData, error } = await supabase
    .from('tradie_professions')
    .select(`
      tradie_id,
      profession_id,
      users!inner(
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
      )
    `)
    .eq('profession_id', professionId)

  if (error) {
    console.error('Error loading tradies:', error)
    return {
      profession: {
        id: professionData.id,
        name_zh: professionData.name_zh,
        name_en: professionData.name_en,
        category_id: professionData.category_id,
        category: professionData.categories || null
      },
      tradies: []
    }
  }

  const uniqueTradies = new Map<string, TradieWithProfession>()
  tradieData?.forEach((item: any) => {
    const user = item.users as TradieWithProfession | undefined
    const isUserApproved = user && (user.status === 'approved' || user.status === 'active')

    if (user && isUserApproved) {
      uniqueTradies.set(user.id, user)
    }
  })

  return {
    profession: {
      id: professionData.id,
      name_zh: professionData.name_zh,
      name_en: professionData.name_en,
      category_id: professionData.category_id,
      category: professionData.categories || null
    },
    tradies: Array.from(uniqueTradies.values())
  }
}

export const dynamic = 'force-dynamic'

export default async function ProfessionPage({ params }: { params: Promise<{ professionId: string }> }) {
  const { professionId } = await params

  // 服务端数据加载
  const { profession: professionData, tradies } = await loadTradiesForProfession(professionId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航和标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button size="sm" variant="outline" asChild>
              <Link href="/browse-tradies" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {professionData ? `${professionData.name_zh}技师` : '技师列表'}
            </h1>
            <p className="text-gray-600">
              {professionData ? `专业的${professionData.name_zh}技师为您服务` : '专业技师为您服务'}
            </p>
          </div>
        </div>

        {/* 技师列表 */}
        <div className="space-y-6">
          {tradies.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无技师</h3>
              <p className="text-gray-600 mb-6">
                该专业下暂时还没有技师注册，请尝试其他类别或稍后再来查看
              </p>
              <Button asChild>
                <Link href="/browse-tradies">浏览其他专业</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  找到 <span className="font-semibold text-gray-900">{tradies.length}</span> 位技师
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradies.map((tradie: TradieWithProfession) => (
                  <Card key={tradie.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/api/placeholder/100/100`} alt={tradie.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {tradie.name ? tradie.name.charAt(0) : 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {tradie.name || '未设置姓名'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {tradie.company || '个人技师'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tradie.status === 'approved' || tradie.status === 'active' ? '已认证' : '待审核'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* 评分信息 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(tradie.rating || 5)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{tradie.rating || 5.0}</span>
                        <span className="text-sm text-gray-500">
                          ({tradie.review_count || 0} 评价)
                        </span>
                      </div>
                      
                      {/* 地址信息 */}
                      {tradie.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{tradie.address}</span>
                        </div>
                      )}
                      
                      {/* 时薪信息 */}
                      {tradie.hourly_rate && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">时薪:</span>
                          <span className="font-semibold text-green-600">
                            ${tradie.hourly_rate}/小时
                          </span>
                        </div>
                      )}
                      
                      {/* 经验年限 */}
                      {tradie.experience_years && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {tradie.experience_years}年经验
                          </span>
                        </div>
                      )}
                      
                      {/* 个人简介 */}
                      {tradie.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {tradie.bio}
                        </p>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                          <Link href={`/tradies/${tradie.id}`}>
                            查看详情
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

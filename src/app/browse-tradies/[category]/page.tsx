import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Mail, ArrowLeft, Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { professionsApi, Profession } from "@/lib/api"
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

export async function generateStaticParams() {
  try {
    // 从数据库获取所有类别ID来生成静态路径
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id')
    
    if (error) {
      console.error('Error generating static params:', error)
      // fallback 路径
      return [
        { category: "1" },
        { category: "2" }
      ]
    }

    return (categories || []).map((category) => ({
      category: category.id.toString(),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // fallback 路径
    return [
      { category: "1" },
      { category: "2" }
    ]
  }
}

interface PageProps {
  params: Promise<{
    category: string // This will be the category_id
  }>
}

async function loadTradiesForCategory(categoryId: string) {
  try {
    console.log('Loading tradies for category ID:', categoryId)
    
    // 首先查找类别信息
    const { data: categoriesData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)

    if (categoryError) {
      console.error('Error loading category:', categoryError)
      return { category: null, tradies: [] }
    }

    // 获取类别数据
    const categoryData = categoriesData?.[0]
    if (!categoryData) {
      console.log('Category not found:', categoryId)
      return { category: null, tradies: [] }
    }
    console.log('Category found:', categoryData)

    // 通过 tradie_professions 表查找该类别的技师
    // 假设 tradie_professions 表中存储的是 category_id
    const { data: tradieData, error } = await supabase
      .from('tradie_professions')
      .select(`
        tradie_id,
        category_id,
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
      .eq('category_id', categoryId)
      .eq('users.status', 'approved')

    console.log('Tradie query result:', { data: tradieData, error })

    if (error) {
      console.error('Error loading tradies:', error)
      return { category: categoryData, tradies: [] }
    }

    // 转换数据格式并去重（一个技师可能有多个记录）
    const uniqueTradies = new Map()
    tradieData?.forEach((item: any) => {
      if (!uniqueTradies.has(item.users.id)) {
        uniqueTradies.set(item.users.id, {
          ...item.users,
          tradie_profession_id: item.tradie_id
        })
      }
    })

    const formattedTradies: TradieWithProfession[] = Array.from(uniqueTradies.values())
    console.log('Formatted tradies:', formattedTradies)

    return { category: categoryData, tradies: formattedTradies }
  } catch (error) {
    console.error('Error loading tradies for category:', error)
    return { category: null, tradies: [] }
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const categoryId = category // Now this is the category ID
  
  // 服务端数据加载
  const { category: categoryData, tradies } = await loadTradiesForCategory(categoryId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航和标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button size="sm" variant="outline" asChild>
              <Link href="/browse-tradies" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回专业目录
              </Link>
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {categoryData?.name_zh || '未知类别'} 专业技师
            </h1>
            {categoryData && (
              <p className="text-gray-600 mb-4">{categoryData.name_en}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>共 {tradies.length} 位认证技师</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>专业 {categoryData?.name_zh || '未知类别'} 服务</span>
              </div>
            </div>
          </div>
        </div>

        {/* 发布需求横幅 */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-green-900 mb-2">需要 {categoryData?.name_zh || '专业'} 服务？</h3>
              <p className="text-green-700 text-sm">发布您的需求，获得多个专业技师报价，选择最合适的服务方案</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 flex-shrink-0" asChild>
              <Link href="/post-job">发布需求</Link>
            </Button>
          </div>
        </div>

        {/* 技师列表 */}
        {tradies.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无 {categoryData?.name_zh || '该类别'} 技师</h3>
            <p className="text-gray-600 mb-6">
              我们正在积极招募该专业的技师，您可以先发布需求，我们会尽快为您匹配合适的专业人员。
            </p>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/post-job">发布需求</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradies.map((tradie) => (
              <Card key={tradie.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={`https://ext.same-assets.com/1633456512/professional-${Math.abs(tradie.id.length) % 5 + 1}.jpeg`} 
                        alt={tradie.name} 
                      />
                      <AvatarFallback className="text-lg font-bold bg-green-100 text-green-700">
                        {tradie.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{tradie.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {tradie.company ? "公司" : "个人"}
                        </Badge>
                      </div>
                      
                      {tradie.company && (
                        <p className="text-sm text-gray-600 mb-2">{tradie.company}</p>
                      )}
                      
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(tradie.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {tradie.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tradie.review_count} 评价)
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        {tradie.experience_years && (
                          <div>{tradie.experience_years} 年经验</div>
                        )}
                        {tradie.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tradie.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {tradie.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tradie.bio}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                      <Link href={`/tradies/${tradie.id}`}>
                        查看详情
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      联系
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 相关专业推荐 */}
        {tradies.length > 0 && categoryData && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">相关服务</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                电气维修
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                电路安装
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                故障排除
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

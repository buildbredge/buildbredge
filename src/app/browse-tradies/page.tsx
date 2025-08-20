"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Users, Wrench } from "lucide-react"
import Link from "next/link"
import { categoriesApi, professionsApi, Category, Profession } from "@/lib/api"

// 按分类组织的专业数据
interface CategoryWithProfessions extends Category {
  professions: Profession[]
  tradieCount?: number
}

export default function BrowseTradiesPage() {
  const [categories, setCategories] = useState<CategoryWithProfessions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategoriesAndProfessions()
  }, [])

  const loadCategoriesAndProfessions = async () => {
    try {
      setLoading(true)
      
      // 并发加载分类和专业数据
      const [categoriesData, professionsData] = await Promise.all([
        categoriesApi.getAll(),
        professionsApi.getAll()
      ])

      // 按分类组织专业数据
      const categoriesWithProfessions: CategoryWithProfessions[] = categoriesData.map(category => ({
        ...category,
        professions: professionsData.filter(profession => profession.category_id === category.id),
        tradieCount: 0 // 可以后续添加技师数量统计
      }))

      setCategories(categoriesWithProfessions)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfessionClick = (profession: Profession) => {
    // 跳转到类别页面显示该类别下所有技师
    window.location.href = `/browse-tradies/${profession.category_id}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在加载专业技师目录...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">专业技师目录</h1>
            <p className="text-xl text-green-100 mb-8">
              按专业分类查找合适的技师，点击查看该领域的专业人员
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-green-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>1,500+ 认证技师</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>覆盖 {categories.reduce((sum, cat) => sum + cat.professions.length, 0)} 个专业</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Professions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">专业分类</h2>
            <p className="text-gray-600">选择您需要的专业服务类别，查看相关技师</p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无专业分类数据</p>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{category.name_zh}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.name_en}</p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {category.professions.length} 个专业
                      </Badge>
                    </div>
                  </div>

                  {/* Professions Grid */}
                  <div className="p-6">
                    {category.professions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        该分类下暂无专业
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {category.professions.map((profession) => (
                          <Card 
                            key={profession.id} 
                            className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-green-300"
                            onClick={() => handleProfessionClick(profession)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{profession.name_zh}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{profession.name_en}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-green-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">找不到合适的专业？</h2>
            <p className="text-green-100 mb-6">
              我们正在不断扩展专业技师网络，如果您找不到需要的服务，可以直接发布需求。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                <Link href="/post-job">发布需求</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" asChild>
                <Link href="/contact">联系我们</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

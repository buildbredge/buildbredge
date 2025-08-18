"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getIcon } from "@/lib/iconMap"

// Database types
interface Profession {
  id: string
  name_en: string
  name_zh: string
  icon: string
  description: string
}

interface Category {
  id: string
  name_en: string
  name_zh: string
  description: string
  professions: Profession[]
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/services/')
        
        if (!response.ok) {
          throw new Error('Failed to fetch services')
        }
        
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">加载服务类别中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="text-2xl font-bold text-green-600">BuildBridge</Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/post-job" className="text-gray-600 hover:text-green-600">发布需求</Link>
            <Link href="/browse-tradies" className="text-gray-600 hover:text-green-600">行业目录</Link>
            <Link href="/suppliers" className="text-gray-600 hover:text-green-600">会员折扣</Link>
            <Link href="/cost-estimator" className="text-gray-600 hover:text-green-600">费用估算</Link>
            <Link href="/blog" className="text-gray-600 hover:text-green-600">案例分享</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth/login">登录</Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/auth/register">注册</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">全部服务类别</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            BuildBridge为您提供全方位的生活服务，涵盖住房维护、生活照护、教育培训等各个领域
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12">
            {categories.map((category) => (
              <div key={category.id}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.name_zh}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.professions.map((profession) => {
                  const ProfessionIcon = getIcon(profession.icon)
                  
                  return (
                    <Card key={profession.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                          <ProfessionIcon className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                          {profession.name_zh}
                          {profession.name_en && (
                            <span className="block text-sm font-normal text-gray-500 mt-1">
                              ({profession.name_en})
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center text-gray-600">
                          {profession.description}
                        </CardDescription>
                        <div className="text-center mt-4">
                          <Button variant="outline" size="sm" className="group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all" asChild>
                            <Link href="/browse-tradies">找技师</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">找不到您需要的服务？</h2>
          <p className="text-xl mb-8 text-green-100">
            联系我们，我们将为您匹配最适合的专业技师
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <Link href="/post-job">发布自定义需求</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" asChild>
              <Link href="/contact">联系客服</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">BuildBridge</span>
              </div>
              <p className="text-gray-400">海外华人专属生活服务平台</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">生活服务</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/post-job" className="hover:text-white">发布需求</Link></li>
                <li><Link href="/cost-estimator" className="hover:text-white">费用估算</Link></li>
                <li><Link href="/browse-tradies" className="hover:text-white">找技师</Link></li>
                <li><Link href="/blog" className="hover:text-white">常见问题</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">服务提供者</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register-tradie" className="hover:text-white">接单赚钱</Link></li>
                <li><Link href="/register-tradie" className="hover:text-white">认证注册</Link></li>
                <li><Link href="/pricing" className="hover:text-white">收费标准</Link></li>
                <li><Link href="/guide" className="hover:text-white">服务指南</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">公司介绍</Link></li>
                <li><Link href="/contact" className="hover:text-white">联系我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">服务条款</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 BuildBridge. 专为海外华人打造的生活服务平台。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

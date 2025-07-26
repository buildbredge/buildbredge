import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Link from "next/link"

interface Tradie {
  name: string
  company: string
  rating: number
  region: string
  orgType: string
  avatar: string
  desc: string
}

const tradeCategories: Record<string, { trades: Tradie[] }> = {
  "电气服务": {
    trades: [
      { name: "张师傅", company: "奥克兰专业电气公司", rating: 4.9, region: "新西兰-奥克兰-CBD", orgType: "company", avatar: "https://ext.same-assets.com/1633456512/electrician1.jpeg", desc: "20年经验，保障安全高效，承接家庭与商用" },
      { name: "王工", company: "惠灵顿家电电工", rating: 4.8, region: "新西兰-惠灵顿-Te Aro", orgType: "company", avatar: "https://ext.same-assets.com/1633456512/electrician2.jpeg", desc: "新西兰注册，承诺专业服务，全年无休" },
      { name: "电力快修队", company: "专业团队", rating: 4.7, region: "新西兰-基督城-CBD", orgType: "company", avatar: "https://ext.same-assets.com/1633456512/electrician3.jpeg", desc: "团队作业，紧急出动，覆盖整个南岛" }
    ]
  },
  // 可扩展其他类别...
}

export async function generateStaticParams() {
  const categories = ["电气服务", "水管维修", "建筑施工", "油漆装饰", "木工制作", "园艺绿化", "设备安装", "建材供应", "清洁服务", "搬家服务"]

  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }))
}

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const rawCategory = decodeURIComponent(category)
  const categoryKey = Object.keys(tradeCategories).find(key => rawCategory.includes(key) || key.includes(rawCategory)) || rawCategory
  const trades = tradeCategories[categoryKey]?.trades || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        {/* 顶部返回与类别标题 */}
        <div className="mb-8 flex items-center gap-4">
          <Button size="sm" variant="outline" asChild>
            <Link href="/browse-tradies">返回全部类别</Link>
          </Button>
          <h1 className="text-3xl font-bold text-green-700">{categoryKey} 注册技师</h1>
        </div>

        {/* 发布需求横幅 */}
        <div className="mb-10 bg-green-100 border-l-4 border-green-500 px-6 py-4 rounded flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800 mb-2">需要{categoryKey}服务？</h3>
            <p className="text-green-700">发布您的需求，获得多个专业技师报价对比选择</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" asChild>
            <Link href="/post-job">发布需求</Link>
          </Button>
        </div>

        {/* 技师列表 */}
        {trades.length === 0 ? (
          <div className="p-8 bg-white text-center text-gray-500 rounded shadow">当前暂无{categoryKey}技师，请稍后再试或切换到其它类别！</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trades.map((t: Tradie, idx: number) => (
              <Card key={idx} className="h-full shadow group border hover:border-green-300 transition">
                <CardHeader className="text-center flex flex-col items-center">
                  <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full object-cover mb-3 border border-gray-200" />
                  <div className="flex items-center justify-center mb-2">
                    <span className="font-bold text-lg text-gray-900 mr-2">{t.name}</span>
                    <Badge variant="secondary">{t.orgType === "company" ? "公司" : "个人"}</Badge>
                  </div>
                  <div className="text-green-700 font-medium mb-1">{t.company}</div>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-base">{t.rating}</span>
                  </div>
                  <div className="text-gray-500 text-xs mb-1">服务区域：{t.region}</div>
                  <div className="text-gray-700 text-sm mb-2">{t.desc}</div>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

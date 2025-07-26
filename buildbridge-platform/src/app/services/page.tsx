import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Hammer,
  Home,
  Zap,
  Paintbrush,
  Settings,
  Leaf,
  Wrench,
  Phone,
  Car,
  Droplet,
  Building,
  Drill,
  TreePine,
  Wind,
  Flame,
  Package,
  Truck,
  HardHat,
  Bath,
  DoorOpen,
  Lightbulb,
  Shield,
  Wifi,
  Camera,
  Thermometer,
  Heart,
  Bug,
  Ship
} from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const serviceCategories = [
    {
      category: "建筑施工",
      description: "专业建筑和设计服务",
      services: [
        { icon: Building, name: "建筑商 (Builders)", desc: "新房建设、扩建工程" },
        { icon: HardHat, name: "建筑师和设计师 (Architects)", desc: "建筑设计、规划服务" },
        { icon: Hammer, name: "装修专家 (Renovation Specialists)", desc: "房屋翻新、改造工程" },
        { icon: Settings, name: "项目经理 (Project Managers)", desc: "工程项目管理、协调" },
        { icon: Building, name: "砌砖工 (Bricklayers)", desc: "砖墙建造、修复" },
        { icon: Drill, name: "基础专家 (Foundation Specialists)", desc: "地基工程、基础建设" }
      ]
    },
    {
      category: "电气服务",
      description: "电力安装和通信服务",
      services: [
        { icon: Zap, name: "电工 (Electricians)", desc: "电路安装、维修服务" },
        { icon: Wifi, name: "天线安装师 (Antenna Installers)", desc: "电视天线、信号接收设备" },
        { icon: Settings, name: "数据网络专家 (Data & Internet)", desc: "网络布线、自动化系统" },
        { icon: Lightbulb, name: "照明专家 (Lighting Specialists)", desc: "灯具设计、安装" },
        { icon: Flame, name: "太阳能专家 (Solar Specialists)", desc: "太阳能系统安装" },
        { icon: Camera, name: "安防专家 (Security Specialists)", desc: "安全系统、监控安装" }
      ]
    },
    {
      category: "水管服务",
      description: "水管和供暖系统",
      services: [
        { icon: Droplet, name: "水管工 (Plumbers)", desc: "水管安装、维修" },
        { icon: Thermometer, name: "供暖专家 (Heating Professionals)", desc: "暖气系统、热水器" },
        { icon: Droplet, name: "灌溉专家 (Irrigation Specialists)", desc: "花园灌溉、喷水系统" },
        { icon: Bath, name: "燃气工 (Gasfitters)", desc: "燃气管道、设备安装" },
        { icon: Settings, name: "废水专家 (Wastewater Specialists)", desc: "污水系统、化粪池" },
        { icon: Shield, name: "防水专家 (Waterproofing)", desc: "防水工程、密封服务" }
      ]
    },
    {
      category: "装修装饰",
      description: "室内外装饰美化",
      services: [
        { icon: Paintbrush, name: "油漆装饰师 (Painters)", desc: "内外墙涂装、装饰" },
        { icon: Package, name: "地板专家 (Flooring Professionals)", desc: "各类地板铺装" },
        { icon: Settings, name: "瓷砖工 (Tilers)", desc: "瓷砖、马赛克铺贴" },
        { icon: Hammer, name: "石膏师 (Plasterers)", desc: "墙面抹灰、石膏板" },
        { icon: Car, name: "地毯铺装师 (Carpet Layers)", desc: "地毯安装、更换" },
        { icon: DoorOpen, name: "窗帘百叶窗专家 (Curtain & Blind)", desc: "窗帘、百叶窗安装" }
      ]
    },
    {
      category: "木工制作",
      description: "定制木工和家具服务",
      services: [
        { icon: Settings, name: "橱柜制作师 (Cabinet Makers)", desc: "定制橱柜、家具" },
        { icon: Hammer, name: "细木工 (Joiners)", desc: "精细木工、装饰木件" },
        { icon: DoorOpen, name: "门窗专家 (Door Specialists)", desc: "门窗制作、安装" },
        { icon: Settings, name: "楼梯专家 (Staircase Specialists)", desc: "楼梯设计、制作" },
        { icon: Package, name: "棚屋安装师 (Shed Installers)", desc: "花园棚屋、车库" },
        { icon: Home, name: "杂工 (Handymen)", desc: "各种小型维修工作" }
      ]
    },
    {
      category: "园艺绿化",
      description: "花园景观和树木护理",
      services: [
        { icon: Leaf, name: "园艺师 (Gardeners)", desc: "花园维护、植物护理" },
        { icon: TreePine, name: "景观设计师 (Landscapers)", desc: "景观设计、施工" },
        { icon: TreePine, name: "树艺师 (Arborists)", desc: "树木修剪、移除" },
        { icon: Settings, name: "铺路专家 (Paving & Driveway)", desc: "车道、人行道铺设" },
        { icon: Package, name: "挖掘承包商 (Excavation)", desc: "土地挖掘、平整" },
        { icon: Hammer, name: "围栏门专家 (Fencing & Gate)", desc: "围栏、大门安装" }
      ]
    },
    {
      category: "屋顶服务",
      description: "屋顶和高空作业",
      services: [
        { icon: Home, name: "屋顶工 (Roofers)", desc: "屋顶安装、维修" },
        { icon: Lightbulb, name: "天窗安装师 (Skylight Installers)", desc: "天窗、采光窗安装" },
        { icon: Settings, name: "遮阳帆安装师 (Shade Sail)", desc: "遮阳设施安装" },
        { icon: Wind, name: "通风专家 (Ventilation Specialists)", desc: "屋顶通风系统" },
        { icon: Settings, name: "脚手架工 (Scaffolders)", desc: "脚手架搭建服务" },
        { icon: Settings, name: "排水沟工 (Guttering)", desc: "排水沟安装、清理" }
      ]
    },
    {
      category: "专业设备",
      description: "专业设备安装维修",
      services: [
        { icon: Settings, name: "家电技师 (Appliance Technicians)", desc: "家电安装、维修" },
        { icon: Car, name: "车库门专家 (Garage Door)", desc: "车库门安装、维修" },
        { icon: Wind, name: "真空管道专家 (Ducted Vacuum)", desc: "中央吸尘系统" },
        { icon: Settings, name: "绝缘专家 (Insulation Professionals)", desc: "房屋保温隔热" },
        { icon: Droplet, name: "游泳池安装师 (Pool Installers)", desc: "游泳池建造、维护" },
        { icon: Shield, name: "锁匠 (Locksmiths)", desc: "锁具安装、开锁服务" }
      ]
    },
    {
      category: "清洁服务",
      description: "专业清洁保洁服务",
      services: [
        { icon: Home, name: "清洁工 (Cleaners)", desc: "室内深度清洁" },
        { icon: Car, name: "外墙清洁师 (Exterior Cleaners)", desc: "外墙、窗户清洗" },
        { icon: Truck, name: "垃圾清除师 (Waste Removalists)", desc: "垃圾清理、运输" },
        { icon: Settings, name: "石棉清除专家 (Asbestos Removers)", desc: "石棉检测、清除" },
        { icon: Bug, name: "害虫防治专家 (Pest Control)", desc: "虫害防治、消杀" },
        { icon: Wind, name: "消防服务专家 (Fire Services)", desc: "消防设备、安全服务" }
      ]
    },
    {
      category: "搬家运输",
      description: "搬家和物流服务",
      services: [
        { icon: Truck, name: "搬家工 (Movers & Removalists)", desc: "搬家、物品运输" },
        { icon: Hammer, name: "拆除专家 (Demolition Experts)", desc: "建筑拆除、清理" },
        { icon: Settings, name: "混凝土工 (Concrete Layers)", desc: "混凝土浇筑、施工" },
        { icon: Package, name: "制造加工师 (Fabricators)", desc: "金属制品加工" },
        { icon: Settings, name: "石匠 (Stonemasons)", desc: "石材加工、安装" },
        { icon: Settings, name: "商铺装修师 (Shopfitters)", desc: "商业空间装修" }
      ]
    },
    {
      category: "玻璃服务",
      description: "玻璃安装和维修",
      services: [
        { icon: Settings, name: "玻璃工 (Glaziers)", desc: "玻璃安装、更换" },
        { icon: Package, name: "内饰设计师 (Interior Designers)", desc: "室内设计、装饰" },
        { icon: Settings, name: "招牌制作师 (Signwriters)", desc: "标识、招牌制作" },
        { icon: Settings, name: "物业检查员 (Property Inspectors)", desc: "房屋检查、评估" },
        { icon: Settings, name: "测量师工程师 (Surveyors & Engineers)", desc: "土地测量、工程咨询" },
        { icon: Ship, name: "船舶专家 (Marine Specialists)", desc: "船舶维修、保养" }
      ]
    }
  ]

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
            <Link href="/browse-tradies" className="text-gray-600 hover:text-green-600">寻找技师</Link>
            <Link href="/suppliers" className="text-gray-600 hover:text-green-600">配件供应商</Link>
            <Link href="/cost-estimator" className="text-gray-600 hover:text-green-600">费用估算</Link>
            <Link href="/blog" className="text-gray-600 hover:text-green-600">案例分享</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth">登录</Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/auth">注册</Link>
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
            {serviceCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.category}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service, serviceIndex) => (
                    <Card key={serviceIndex} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                          <service.icon className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center text-gray-600">
                          {service.desc}
                        </CardDescription>
                        <div className="text-center mt-4">
                          <Button variant="outline" size="sm" className="group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all" asChild>
                            <Link href="/browse-tradies">找技师</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

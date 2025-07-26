"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  User,
  Wrench,
  Building2,
  Mail,
  Phone,
  MapPin,
  Upload,
  Plus,
  X,
  CheckCircle,
  Award,
  Clock,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Camera,
  FileText,
  Shield
} from "lucide-react"

export default function RegisterTradiePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基本信息
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      company: "",
      businessType: "",
      yearsExperience: ""
    },
    // 专业技能
    skills: {
      primaryService: "",
      specialties: [] as string[],
      serviceAreas: [] as string[],
      description: ""
    },
    // 资质认证
    certifications: {
      licenseNumber: "",
      insurance: false,
      bondedInsured: false,
      certificationFiles: [] as string[],
      portfolioImages: [] as string[]
    },
    // 定价和可用性
    pricing: {
      hourlyRate: "",
      projectMinimum: "",
      responseTime: "",
      availability: [] as string[]
    }
  })

  const serviceTypes = [
    "建筑施工", "水管维修", "电工服务", "油漆装饰",
    "木工制作", "园艺绿化", "设备安装", "维护保养",
    "屋顶维修", "地板铺设", "瓷砖铺贴", "门窗安装"
  ]

  const locations = [
    "奥克兰中心", "奥克兰北岸", "奥克兰南区", "奥克兰西区",
    "奥克兰东区", "惠灵顿", "基督城", "汉密尔顿"
  ]

  const businessTypes = [
    { value: "individual", label: "个人技师", description: "独立提供服务" },
    { value: "company", label: "公司团队", description: "拥有多名员工" },
    { value: "partnership", label: "合作伙伴", description: "与其他技师合作" }
  ]

  const availabilityOptions = [
    "周一至周五", "周末可用", "晚间服务", "紧急服务",
    "假期可用", "24小时服务"
  ]

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const addSpecialty = (specialty: string) => {
    if (!formData.skills.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          specialties: [...prev.skills.specialties, specialty]
        }
      }))
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        specialties: prev.skills.specialties.filter(s => s !== specialty)
      }
    }))
  }

  const handleInputChange = (section: string, field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">BuildBridge</span>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <Wrench className="w-3 h-3 mr-1" />
            技师注册
          </Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">加入 BuildBridge 技师网络</h1>
            <p className="text-gray-600">完成注册，开始接收项目机会</p>
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className={step >= 1 ? "text-green-600 font-medium" : "text-gray-400"}>
                1. 基本信息
              </span>
              <span className={step >= 2 ? "text-green-600 font-medium" : "text-gray-400"}>
                2. 专业技能
              </span>
              <span className={step >= 3 ? "text-green-600 font-medium" : "text-gray-400"}>
                3. 资质认证
              </span>
              <span className={step >= 4 ? "text-green-600 font-medium" : "text-gray-400"}>
                4. 定价设置
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>基本信息</span>
                </CardTitle>
                <CardDescription>
                  请提供您的基本信息，这些信息将在您的技师档案中显示
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 *</Label>
                    <Input
                      id="name"
                      placeholder="请输入您的姓名"
                      value={formData.personalInfo.name}
                      onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">电话号码 *</Label>
                    <Input
                      id="phone"
                      placeholder="+64 21 123 4567"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>所在地区 *</Label>
                    <Select onValueChange={(value) => handleInputChange("personalInfo", "location", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择您的主要服务地区" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>从业年限 *</Label>
                    <Select onValueChange={(value) => handleInputChange("personalInfo", "yearsExperience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择您的从业年限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2年</SelectItem>
                        <SelectItem value="3-5">3-5年</SelectItem>
                        <SelectItem value="6-10">6-10年</SelectItem>
                        <SelectItem value="11-15">11-15年</SelectItem>
                        <SelectItem value="16+">16年以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>业务类型 *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {businessTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => handleInputChange("personalInfo", "businessType", type.value)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.personalInfo.businessType === type.value
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <h3 className="font-medium mb-1">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">公司名称 (可选)</Label>
                  <Input
                    id="company"
                    placeholder="如：张师傅装修工作室"
                    value={formData.personalInfo.company}
                    onChange={(e) => handleInputChange("personalInfo", "company", e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                    下一步 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Skills & Services */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5" />
                  <span>专业技能</span>
                </CardTitle>
                <CardDescription>
                  告诉我们您的专业技能和服务范围
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>主要服务类型 *</Label>
                  <Select onValueChange={(value) => handleInputChange("skills", "primaryService", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择您的主要服务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>专业技能 (选择所有适用的)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {serviceTypes.map((service) => (
                      <Button
                        key={service}
                        variant={formData.skills.specialties.includes(service) ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          formData.skills.specialties.includes(service)
                            ? removeSpecialty(service)
                            : addSpecialty(service)
                        }
                        className={formData.skills.specialties.includes(service)
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                        }
                      >
                        {service}
                        {formData.skills.specialties.includes(service) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>服务范围</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={formData.skills.serviceAreas.includes(location)}
                          onCheckedChange={(checked) => {
                            const newAreas = checked
                              ? [...formData.skills.serviceAreas, location]
                              : formData.skills.serviceAreas.filter(l => l !== location)
                            handleInputChange("skills", "serviceAreas", newAreas)
                          }}
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">服务描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="详细描述您的服务，包括特色、经验、服务承诺等..."
                    value={formData.skills.description}
                    onChange={(e) => handleInputChange("skills", "description", e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    这将显示在您的技师档案中，帮助客户了解您的专业能力
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                    下一步 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Certifications */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>资质认证</span>
                </CardTitle>
                <CardDescription>
                  上传您的资质证书和作品集，提升客户信任度
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="license">执业证书编号 (如适用)</Label>
                  <Input
                    id="license"
                    placeholder="请输入您的执业证书编号"
                    value={formData.certifications.licenseNumber}
                    onChange={(e) => handleInputChange("certifications", "licenseNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>保险和担保</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={formData.certifications.insurance}
                        onCheckedChange={(checked) =>
                          handleInputChange("certifications", "insurance", checked)
                        }
                      />
                      <Label htmlFor="insurance">我持有责任保险</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bonded"
                        checked={formData.certifications.bondedInsured}
                        onCheckedChange={(checked) =>
                          handleInputChange("certifications", "bondedInsured", checked)
                        }
                      />
                      <Label htmlFor="bonded">我持有工程担保</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>资质证书上传</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">上传您的资质证书、保险证明等文件</p>
                    <p className="text-sm text-gray-500 mb-4">支持 PDF, JPG, PNG 格式，单个文件不超过5MB</p>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      选择文件
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>作品集照片</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">上传您的工作照片和完成项目</p>
                    <p className="text-sm text-gray-500 mb-4">高质量的作品照片有助于吸引更多客户</p>
                    <Button variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      上传照片
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    建议上传5-10张最佳作品照片，展示您的专业水平
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                    下一步 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Pricing & Availability */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>定价和可用性</span>
                </CardTitle>
                <CardDescription>
                  设置您的服务价格和工作时间
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">小时费率 (NZD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="hourlyRate"
                        placeholder="80"
                        value={formData.pricing.hourlyRate}
                        onChange={(e) => handleInputChange("pricing", "hourlyRate", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500">建议范围: $70-150/小时</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectMinimum">最小项目费用 (NZD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="projectMinimum"
                        placeholder="200"
                        value={formData.pricing.projectMinimum}
                        onChange={(e) => handleInputChange("pricing", "projectMinimum", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>平均响应时间</Label>
                  <Select onValueChange={(value) => handleInputChange("pricing", "responseTime", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择您的平均响应时间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hour">1小时内</SelectItem>
                      <SelectItem value="2hours">2小时内</SelectItem>
                      <SelectItem value="4hours">4小时内</SelectItem>
                      <SelectItem value="1day">24小时内</SelectItem>
                      <SelectItem value="2days">2天内</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>工作时间安排</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availabilityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`availability-${option}`}
                          checked={formData.pricing.availability.includes(option)}
                          onCheckedChange={(checked) => {
                            const newAvailability = checked
                              ? [...formData.pricing.availability, option]
                              : formData.pricing.availability.filter(a => a !== option)
                            handleInputChange("pricing", "availability", newAvailability)
                          }}
                        />
                        <Label htmlFor={`availability-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-3">🎉 注册即将完成！</h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>我们将在24小时内审核您的申请</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>通过审核后即可开始接收项目机会</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>平台仅收取5%的服务费</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>享受专业的中文客服支持</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Award className="w-4 h-4 mr-2" />
                    完成注册
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

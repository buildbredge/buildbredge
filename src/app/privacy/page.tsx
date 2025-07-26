"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  Mail,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react"
import Navigation from "@/components/Navigation"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>最后更新：2025年1月9日</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              生效版本
            </Badge>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
            BuildBridge深知您的隐私对您的重要性，我们承诺保护您的个人信息安全，
            并以透明的方式说明我们如何收集、使用和保护您的数据。
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Overview */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Eye className="w-6 h-6 mr-2" />
                隐私政策概要
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">我们只收集必要的个人信息</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">数据采用银行级加密保护</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">不会向第三方出售您的信息</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">您可以随时访问和删除数据</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">遵循新西兰隐私法规要求</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">透明的数据使用说明</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Information Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-6 h-6 mr-2 text-green-600" />
                1. 我们收集的信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1.1 账户信息</h4>
                <p className="text-gray-700 mb-2">当您注册BuildBridge账户时，我们会收集：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>姓名、邮箱地址、电话号码</li>
                  <li>住址（用于匹配附近的技师）</li>
                  <li>账户密码（加密存储）</li>
                  <li>个人资料照片（可选）</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">1.2 项目信息</h4>
                <p className="text-gray-700 mb-2">当您发布项目或提供服务时：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>项目描述、预算、时间要求</li>
                  <li>项目地址和联系方式</li>
                  <li>上传的照片和文件</li>
                  <li>技师资质证书和工作经验</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">1.3 使用数据</h4>
                <p className="text-gray-700 mb-2">为了改善服务质量，我们会收集：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>网站访问记录和点击行为</li>
                  <li>设备信息（浏览器类型、IP地址）</li>
                  <li>平台使用偏好和设置</li>
                  <li>客服对话记录</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Information Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
                2. 信息使用方式
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 核心服务提供</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>匹配合适的技师和项目需求</li>
                  <li>处理项目报价和沟通</li>
                  <li>提供客服支持和纠纷处理</li>
                  <li>进行身份验证和信用检查</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.2 平台改进</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>分析用户行为以优化匹配算法</li>
                  <li>改善网站功能和用户体验</li>
                  <li>开发新功能和服务</li>
                  <li>进行安全监测和欺诈防范</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 沟通联系</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>发送重要的账户通知</li>
                  <li>提供技师匹配结果</li>
                  <li>发送服务更新和新功能介绍</li>
                  <li>进行客户满意度调查</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-6 h-6 mr-2 text-purple-600" />
                3. 信息共享与披露
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">重要承诺</p>
                    <p className="text-yellow-700 text-sm">
                      BuildBridge绝不会向第三方出售、出租或交易您的个人信息。
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.1 必要的信息共享</h4>
                <p className="text-gray-700 mb-2">仅在以下情况下，我们可能会共享您的信息：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>与匹配的技师分享项目相关信息</li>
                  <li>向合作的第三方服务提供商（如支付处理）</li>
                  <li>遵守法律要求或政府部门要求</li>
                  <li>保护BuildBridge和用户的合法权益</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.2 匿名数据使用</h4>
                <p className="text-gray-700">
                  我们可能会使用去标识化的匿名数据进行行业研究和趋势分析，
                  这些数据无法识别个人身份。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-6 h-6 mr-2 text-red-600" />
                4. 数据安全保护
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 技术安全措施</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>使用SSL/TLS加密传输所有敏感数据</li>
                  <li>采用AES-256加密算法存储敏感信息</li>
                  <li>定期进行安全漏洞扫描和渗透测试</li>
                  <li>实施多层防火墙和入侵检测系统</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 管理安全措施</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>严格限制员工访问用户数据的权限</li>
                  <li>定期进行员工安全培训</li>
                  <li>建立数据泄露应急响应机制</li>
                  <li>与权威安全机构合作进行审计</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.3 您的安全责任</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>使用强密码并定期更换</li>
                  <li>不与他人分享账户信息</li>
                  <li>及时更新联系方式</li>
                  <li>发现异常活动立即联系我们</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-green-600" />
                5. 您的权利
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 数据访问权</h4>
                <p className="text-gray-700">
                  您有权随时查看我们收集的关于您的个人信息，
                  可通过账户设置页面或联系客服获取。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 数据更正权</h4>
                <p className="text-gray-700">
                  如果您发现个人信息有误，可以随时要求我们进行更正或更新。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.3 数据删除权</h4>
                <p className="text-gray-700">
                  您可以要求删除您的个人信息，但某些法律要求保留的信息除外
                  （如税务记录、纠纷记录等）。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.4 数据携带权</h4>
                <p className="text-gray-700">
                  您有权要求以常见格式导出您的个人数据，
                  以便转移到其他服务提供商。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.5 撤回同意权</h4>
                <p className="text-gray-700">
                  对于需要您同意的数据处理活动，您可以随时撤回同意，
                  但这不会影响撤回前的数据处理活动。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-orange-600" />
                6. 数据保留期限
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">6.1 账户数据</h4>
                <p className="text-gray-700">
                  在您的账户有效期间，我们会保留您的基本账户信息。
                  账户注销后，个人识别信息将在30天内删除。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.2 项目数据</h4>
                <p className="text-gray-700">
                  项目相关数据（包括消息、报价、评价）会保留3年，
                  以便处理可能的纠纷和提供客服支持。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.3 财务数据</h4>
                <p className="text-gray-700">
                  为遵循税务法规要求，财务交易记录将保留7年。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.4 日志数据</h4>
                <p className="text-gray-700">
                  系统日志和安全日志通常保留12个月，
                  用于安全监测和系统优化。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7. Contact */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Mail className="w-6 h-6 mr-2" />
                7. 联系我们
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                如果您对我们的隐私政策有任何疑问，或希望行使您的数据权利，
                请通过以下方式联系我们：
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>邮箱：</strong>privacy@buildbridge.nz</p>
                <p><strong>电话：</strong>0800 BUILD NZ</p>
                <p><strong>地址：</strong>Level 10, 120 Albert Street, Auckland 1010, New Zealand</p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/contact">
                    联系隐私官
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p>
              本隐私政策根据新西兰《隐私法》(Privacy Act 2020) 制定，
              我们承诺遵循所有适用的隐私保护法规。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

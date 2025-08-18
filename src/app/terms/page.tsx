"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Scale,
  Users,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Calendar
} from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">服务条款</h1>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>最后更新：2025年1月9日</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              当前版本
            </Badge>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
            欢迎使用BuildBridge平台。请仔细阅读以下服务条款，
            使用我们的服务即表示您同意遵守这些条款。
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">重要提醒</h3>
                  <p className="text-amber-700">
                    这些条款构成您与BuildBridge之间具有法律约束力的协议。
                    如果您不同意这些条款，请不要使用我们的服务。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Definitions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                1. 定义与术语
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1.1 主要定义</h4>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong>"BuildBridge"或"我们"</strong>：指BuildBridge Ltd及其运营的平台服务。
                  </div>
                  <div>
                    <strong>"用户"或"您"</strong>：指使用BuildBridge平台的任何个人或实体。
                  </div>
                  <div>
                    <strong>"业主"</strong>：指在平台上发布项目需求、行业目录服务的用户。
                  </div>
                  <div>
                    <strong>"技师"</strong>：指在平台上提供专业服务、响应项目需求的注册服务提供者。
                  </div>
                  <div>
                    <strong>"平台"</strong>：指BuildBridge网站、移动应用及相关服务。
                  </div>
                  <div>
                    <strong>"服务"</strong>：指通过平台提供的所有功能和服务。
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Platform Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-600" />
                2. 平台服务
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 服务描述</h4>
                <p className="text-gray-700 mb-3">
                  BuildBridge是一个连接业主与专业技师的在线平台，我们提供：
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>项目发布和技师匹配服务</li>
                  <li>在线沟通和报价功能</li>
                  <li>资金托管和支付处理</li>
                  <li>评价和反馈系统</li>
                  <li>客户服务和纠纷调解</li>
                  <li>AI智能推荐和预算估算</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.2 平台角色</h4>
                <p className="text-gray-700">
                  BuildBridge仅作为中介平台，促进业主与技师之间的连接。
                  我们不是服务的直接提供者，也不是服务合同的一方。
                  实际的服务合同是在业主和技师之间直接形成的。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 服务可用性</h4>
                <p className="text-gray-700">
                  虽然我们努力保持服务的持续可用性，但可能因维护、
                  技术问题或其他原因导致临时中断。我们不保证服务的绝对连续性。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. User Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-purple-600" />
                3. 用户义务
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 注册要求</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>年满18周岁且具有完全民事行为能力</li>
                  <li>提供真实、准确、完整的注册信息</li>
                  <li>及时更新个人信息变更</li>
                  <li>对账户安全负责，不得与他人共享账户</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.2 使用规范</h4>
                <p className="text-gray-700 mb-2">在使用平台时，您承诺：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>遵守所有适用的法律法规</li>
                  <li>不发布虚假、误导性或欺诈性信息</li>
                  <li>不从事任何可能损害平台或其他用户的活动</li>
                  <li>尊重其他用户的权利和隐私</li>
                  <li>不绕过平台进行交易以避免费用</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.3 禁止行为</h4>
                <p className="text-gray-700 mb-2">以下行为严格禁止：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>发布违法、有害、威胁、辱骂性内容</li>
                  <li>侵犯他人知识产权或隐私权</li>
                  <li>干扰或破坏平台正常运行</li>
                  <li>使用机器人或自动化工具访问平台</li>
                  <li>注册多个账户进行欺诈活动</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 4. For Homeowners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                4. 业主用户条款
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 项目发布</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>确保项目描述真实、详细、准确</li>
                  <li>提供合理的预算范围和时间要求</li>
                  <li>及时回复技师的询问和报价</li>
                  <li>诚信评价技师的服务质量</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 支付责任</h4>
                <p className="text-gray-700">
                  业主有责任按照约定向技师支付服务费用。
                  通过平台的资金托管服务可以保护双方权益。
                  恶意拒付或无理拖欠费用可能导致账户被限制。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.3 安全注意事项</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>验证技师的身份和资质证书</li>
                  <li>确保技师购买了适当的保险</li>
                  <li>对涉及结构安全的工作要求相关许可证</li>
                  <li>发现安全隐患及时报告平台</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. For Tradies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-orange-600" />
                5. 技师用户条款
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 资质要求</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>持有相关的执业许可证和资质证书</li>
                  <li>购买并维持有效的责任保险</li>
                  <li>具备提供所承诺服务的技能和经验</li>
                  <li>及时更新资质信息和保险状态</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 服务标准</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>按照行业标准和最佳实践提供服务</li>
                  <li>使用合格的材料和设备</li>
                  <li>遵守所有相关的建筑法规和安全要求</li>
                  <li>及时完成承诺的工作</li>
                  <li>对工作质量提供合理的保修</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.3 费用义务</h4>
                <p className="text-gray-700">
                  技师需要按照平台费用标准支付订阅费用和成功费用。
                  试图绕过平台私下交易以避免费用的行为可能导致账户被永久封禁。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Payment and Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                6. 费用与支付
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">6.1 业主费用</h4>
                <p className="text-gray-700">
                  对业主用户，BuildBridge提供免费的基础服务，包括：
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>发布项目需求</li>
                  <li>接收技师报价</li>
                  <li>使用平台沟通功能</li>
                  <li>客服支持服务</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.2 技师费用</h4>
                <div className="space-y-2 text-gray-700">
                  <p><strong>订阅费用：</strong>技师需要支付月度或年度订阅费用来使用平台服务。</p>
                  <p><strong>成功费用：</strong>当技师成功获得项目时，需要支付一定比例的成功费用。</p>
                  <p>具体费用标准请查看我们的<Link href="/subscription" className="text-green-600 hover:underline">定价页面</Link>。</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.3 资金托管</h4>
                <p className="text-gray-700">
                  为保护双方权益，我们提供资金托管服务。
                  项目费用将在工作开始前托管，完工验收后释放给技师。
                  托管期间资金由第三方金融机构安全保管。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.4 退款政策</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>订阅费用支持在7天内无条件退款</li>
                  <li>未使用的服务积分可以申请退款</li>
                  <li>因平台问题导致的损失将获得合理补偿</li>
                  <li>恶意退款申请可能导致账户被限制</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 7. Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-6 h-6 mr-2 text-red-600" />
                7. 责任限制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-2">重要免责声明</p>
                    <p className="text-red-700 text-sm">
                      BuildBridge仅作为平台服务提供者，不对技师提供的实际服务质量、
                      安全性或合法性承担直接责任。
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">7.1 平台责任</h4>
                <p className="text-gray-700 mb-2">BuildBridge的责任限于：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>提供稳定可靠的平台服务</li>
                  <li>保护用户个人信息安全</li>
                  <li>处理用户投诉和纠纷调解</li>
                  <li>维护平台的公平交易环境</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">7.2 责任限制</h4>
                <p className="text-gray-700 mb-2">在法律允许的最大范围内：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>平台不保证技师服务的质量或结果</li>
                  <li>不对因技师服务导致的损失承担责任</li>
                  <li>不对第三方服务（如支付、保险）的问题负责</li>
                  <li>总体责任限额不超过相关费用金额</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">7.3 用户责任</h4>
                <p className="text-gray-700">
                  用户对自己的行为及其后果承担全部责任，
                  包括但不限于服务质量、合同履行、安全事故等。
                  用户应当购买适当的保险来转移相关风险。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Changes and Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-6 h-6 mr-2 text-purple-600" />
                8. 条款变更与终止
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">8.1 条款修改</h4>
                <p className="text-gray-700">
                  我们保留随时修改这些条款的权利。
                  重大变更将提前30天通知用户。
                  继续使用服务即表示您接受修改后的条款。
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">8.2 账户终止</h4>
                <p className="text-gray-700 mb-2">在以下情况下，我们可能暂停或终止您的账户：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>违反这些服务条款</li>
                  <li>提供虚假信息或从事欺诈活动</li>
                  <li>损害平台或其他用户的利益</li>
                  <li>长期不活跃的账户</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">8.3 终止后果</h4>
                <p className="text-gray-700">
                  账户终止后，您将失去访问平台的权限，
                  但已产生的义务和责任仍然有效。
                  我们会根据隐私政策处理您的个人数据。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Contact */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Mail className="w-6 h-6 mr-2" />
                9. 联系方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                如果您对这些服务条款有任何疑问或需要法律建议，请联系我们：
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>法务邮箱：</strong>legal@buildbridge.nz</p>
                <p><strong>客服电话：</strong>0800 BUILD NZ</p>
                <p><strong>注册地址：</strong>Level 10, 120 Albert Street, Auckland 1010, New Zealand</p>
                <p><strong>公司注册号：</strong>NZBN 9429049482370</p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/contact">
                    联系法务团队
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p>
              这些条款受新西兰法律管辖。任何争议将由新西兰法院专属管辖。
              中文版本仅供参考，如有冲突以英文版本为准。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

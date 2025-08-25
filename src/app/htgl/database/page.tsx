"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  AlertTriangle,
  Info,
  Settings,
  MapPin,
  Star,
  Calculator,
  BarChart3
} from "lucide-react"
import Link from "next/link"

interface DatabaseStatus {
  success: boolean
  connection?: {
    url: string
    key: string
  }
  tables?: {
    [tableName: string]: {
      exists: boolean
      count?: number
      accessible?: boolean
      error?: string
      enhanced?: {
        hasCoordinates?: boolean
        hasAddress?: boolean
        hasServiceRadius?: boolean
        hasRatingSystem?: boolean
        hasCompleteStructure?: boolean
        hasRatingField?: boolean
        hasApprovalSystem?: boolean
        coordinatesSample?: string | null
        serviceRadiusSample?: number
        ratingSample?: string | null
        sampleRating?: number
      }
    }
  }
  functions?: {
    [functionName: string]: {
      available: boolean
      error?: string
      testResult?: string
    }
  }
  views?: {
    [viewName: string]: {
      available: boolean
      error?: string
      sampleData?: any
    }
  }
  enhancements?: {
    [key: string]: string
  }
  recommendations?: {
    nextSteps: string[]
  }
  error?: string
  timestamp?: string
}

interface InitResult {
  success: boolean
  results?: {
    owners: { success: number; errors: string[] }
    tradies: { success: number; errors: string[] }
    projects: { success: number; errors: string[] }
    reviews: { success: number; errors: string[] }
  }
  summary?: {
    owners: string
    tradies: string
    projects: string
    reviews: string
  }
  features?: {
    [key: string]: string
  }
  error?: string
}

export default function DatabaseManagePage() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [initResult, setInitResult] = useState<InitResult | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // 测试数据库连接
  const testConnection = async () => {
    setIsTestingConnection(true)
    setDbStatus(null)

    try {
      console.log("🔍 测试增强数据库连接...")
      const response = await fetch('/api/database/test')
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("❌ 测试连接失败:", error)
      setDbStatus({
        success: false,
        error: error instanceof Error ? error.message : "连接测试失败"
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // 初始化数据库
  const initializeDatabase = async () => {
    if (!confirm("确定要初始化增强数据库吗？这将插入包含坐标和评论的示例数据。")) return

    setIsInitializing(true)
    setInitResult(null)

    try {
      console.log("🏗️ 初始化增强数据库...")
      const response = await fetch('/api/database/init', { method: 'POST' })
      const data = await response.json()
      setInitResult(data)

      // 初始化完成后重新测试连接
      if (data.success) {
        setTimeout(() => testConnection(), 1000)
      }
    } catch (error) {
      console.error("❌ 初始化失败:", error)
      setInitResult({
        success: false,
        error: error instanceof Error ? error.message : "初始化失败"
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const getTableStatusBadge = (table: any) => {
    if (!table) return <Badge variant="outline">未知</Badge>

    if (table.exists && table.accessible) {
      return <Badge variant="default" className="bg-green-100 text-green-800">
        ✓ 正常 ({table.count || 0} 条记录)
      </Badge>
    } else if (table.exists && !table.accessible) {
      return <Badge variant="destructive">存在但无法访问</Badge>
    } else {
      return <Badge variant="destructive">不存在或错误</Badge>
    }
  }

  const getEnhancementBadge = (enhanced: any, feature: string) => {
    if (!enhanced) return null

    const isAvailable = enhanced[feature]
    return (
      <Badge
        variant={isAvailable ? "default" : "outline"}
        className={isAvailable ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}
      >
        {isAvailable ? "✓" : "✗"} {feature.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
      </Badge>
    )
  }

  const getFunctionBadge = (func: any) => {
    if (!func) return <Badge variant="outline">未知</Badge>

    return (
      <Badge
        variant={func.available ? "default" : "destructive"}
        className={func.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}
      >
        {func.available ? `✓ 可用` : "✗ 不可用"}
        {func.testResult && ` (${func.testResult})`}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Database className="w-8 h-8 mr-3 text-blue-600" />
              增强数据库管理
            </h1>
            <p className="text-gray-600">管理和监控 BuildBridge 增强数据库状态（坐标 + 评论系统）</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/htgl">
              ← 返回管理后台
            </Link>
          </Button>
        </div>

        {/* 配置信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              数据库配置状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Supabase URL</p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ?
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` :
                    '未配置'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">API Key</p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?
                    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` :
                    '未配置'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTestingConnection ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            测试增强数据库连接
          </Button>

          <Button
            onClick={initializeDatabase}
            disabled={isInitializing || !dbStatus?.success}
            variant="outline"
          >
            {isInitializing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            初始化增强示例数据
          </Button>
        </div>

        {/* 连接状态结果 */}
        {dbStatus && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {dbStatus.success ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                增强数据库连接状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbStatus.success ? (
                <div className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      增强数据库连接正常！地理位置和评论系统功能就绪。
                    </AlertDescription>
                  </Alert>

                  {/* 增强功能状态 */}
                  {dbStatus.enhancements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-blue-600" />
                        增强功能状态
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(dbStatus.enhancements).map(([key, value]) => (
                          <div key={key} className="p-3 border rounded-lg bg-green-50">
                            <p className="text-sm font-medium text-green-800">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 表状态 */}
                  {dbStatus.tables && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        数据表状态
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(dbStatus.tables).map(([tableName, tableInfo]) => (
                          <div key={tableName} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium capitalize">{tableName}</h5>
                              {getTableStatusBadge(tableInfo)}
                            </div>

                            {/* 增强字段状态 */}
                            {tableInfo.enhanced && (
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-gray-700">增强字段:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.keys(tableInfo.enhanced)
                                    .filter(key => key.startsWith('has'))
                                    .map(key => getEnhancementBadge(tableInfo.enhanced, key))
                                  }
                                </div>

                                {/* 示例数据 */}
                                {tableInfo.enhanced.coordinatesSample && (
                                  <p className="text-xs text-gray-600 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    坐标样例: {tableInfo.enhanced.coordinatesSample}
                                  </p>
                                )}
                                {tableInfo.enhanced.ratingSample && (
                                  <p className="text-xs text-gray-600 flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    评分样例: {tableInfo.enhanced.ratingSample}
                                  </p>
                                )}
                              </div>
                            )}

                            {tableInfo.error && (
                              <p className="text-xs text-red-600 mt-2">{tableInfo.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 数据库函数状态 */}
                  {dbStatus.functions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                        数据库函数
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(dbStatus.functions).map(([funcName, funcInfo]) => (
                          <div key={funcName} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{funcName}</h5>
                              {getFunctionBadge(funcInfo)}
                            </div>
                            {funcInfo.error && (
                              <p className="text-xs text-red-600 mt-1">{funcInfo.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 数据库视图状态 */}
                  {dbStatus.views && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                        数据库视图
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(dbStatus.views).map(([viewName, viewInfo]) => (
                          <div key={viewName} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{viewName}</h5>
                              <Badge
                                variant={viewInfo.available ? "default" : "destructive"}
                                className={viewInfo.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}
                              >
                                {viewInfo.available ? "✓ 可用" : "✗ 不可用"}
                              </Badge>
                            </div>
                            {viewInfo.error && (
                              <p className="text-xs text-red-600 mt-1">{viewInfo.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 建议的下一步 */}
                  {dbStatus.recommendations && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">建议的下一步</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {dbStatus.recommendations.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-blue-800 flex items-start">
                              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>增强数据库连接失败:</strong> {dbStatus.error}
                  </AlertDescription>
                </Alert>
              )}

              {dbStatus.timestamp && (
                <p className="text-xs text-gray-500 mt-4">
                  测试时间: {new Date(dbStatus.timestamp).toLocaleString('zh-CN')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 初始化结果 */}
        {initResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {initResult.success ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                增强数据库初始化结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {initResult.success ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      增强数据库初始化成功！包含坐标和评论的示例数据已插入。
                    </AlertDescription>
                  </Alert>

                  {/* 增强功能确认 */}
                  {initResult.features && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">启用的增强功能</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(initResult.features).map(([key, value]) => (
                          <div key={key} className="p-3 border border-green-200 rounded-lg bg-green-50">
                            <p className="text-sm font-medium text-green-800">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {initResult.summary && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">插入结果统计</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-lg bg-green-50">
                          <p className="font-medium">业主数据</p>
                          <p className="text-sm text-gray-600">{initResult.summary.owners}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-blue-50">
                          <p className="font-medium">技师数据</p>
                          <p className="text-sm text-gray-600">{initResult.summary.tradies}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-purple-50">
                          <p className="font-medium">项目数据</p>
                          <p className="text-sm text-gray-600">{initResult.summary.projects}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-yellow-50">
                          <p className="font-medium">评论数据</p>
                          <p className="text-sm text-gray-600">{initResult.summary.reviews}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 错误详情 */}
                  {initResult.results && (
                    <div className="space-y-2">
                      {Object.entries(initResult.results).map(([type, result]) => (
                        result.errors.length > 0 && (
                          <div key={type} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                            <p className="font-medium text-yellow-800">{type} 插入警告:</p>
                            <ul className="text-sm text-yellow-700 mt-1">
                              {result.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>初始化失败:</strong> {initResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* 快速链接 */}
        <Card>
          <CardHeader>
            <CardTitle>管理功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <Link href="/htgl">
                  <Database className="w-6 h-6 mb-2" />
                  <span className="text-sm">管理后台</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <Link href="/my-projects">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm">查看项目</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <Link href="/post-job">
                  <Play className="w-6 h-6 mb-2" />
                  <span className="text-sm">发布项目</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <Link href="/">
                  <Settings className="w-6 h-6 mb-2" />
                  <span className="text-sm">返回首页</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

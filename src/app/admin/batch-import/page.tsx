"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Upload, Loader2 } from "lucide-react"

interface TradieData {
  website?: string
  address: string
  category_id: string
  profession_id: string
  name: string
  bio?: string
  company?: string
  service_area?: string
}

interface ImportResult {
  success: boolean
  name: string
  message: string
  userId?: string
}

export default function BatchImportPage() {
  const [jsonData, setJsonData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState("")

  const generateRandomEmail = (name: string, index: number) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const randomNum = Math.floor(Math.random() * 1000)
    return `${cleanName}${randomNum}${index}@example.com`
  }

  const generateRandomPhone = () => {
    const number = Math.floor(Math.random() * 900000000) + 100000000
    return `+64${number}`
  }

  const processData = async () => {
    if (!jsonData.trim()) {
      alert("请输入JSON数据")
      return
    }

    try {
      const data: TradieData[] = JSON.parse(jsonData)
      setIsProcessing(true)
      setResults([])
      setProgress(0)

      const processedResults: ImportResult[] = []

      for (let i = 0; i < data.length; i++) {
        const tradie = data[i]
        setCurrentItem(`处理第 ${i + 1}/${data.length} 个技师: ${tradie.name}`)
        setProgress(((i + 1) / data.length) * 100)

        try {
          const response = await fetch('/api/admin/batch-import-tradie', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...tradie,
              email: generateRandomEmail(tradie.name, i),
              phone: generateRandomPhone(),
            }),
          })

          const result = await response.json()
          
          processedResults.push({
            success: result.success,
            name: tradie.name,
            message: result.message || (result.success ? '导入成功' : '导入失败'),
            userId: result.userId
          })

        } catch (error) {
          processedResults.push({
            success: false,
            name: tradie.name,
            message: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`
          })
        }

        // 添加小延迟避免过快请求
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setResults(processedResults)
      setCurrentItem("处理完成")
      
    } catch (error) {
      alert("JSON数据格式错误，请检查格式")
    } finally {
      setIsProcessing(false)
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">批量导入技师数据</h1>
          <p className="text-gray-600 mt-2">
            上传JSON格式的技师数据进行批量导入
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>JSON数据输入</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    粘贴技师数据JSON
                  </label>
                  <Textarea
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder="粘贴包含技师信息的JSON数组..."
                    rows={12}
                    className="font-mono text-sm"
                    disabled={isProcessing}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  <p>JSON格式示例：</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
{`[
  {
    "website": "www.example.com",
    "address": "123 Main St Auckland",
    "category_id": "uuid-here",
    "profession_id": "uuid-here", 
    "name": "John Doe",
    "bio": "专业描述...",
    "company": "Company Name",
    "service_area": "服务区域"
  }
]`}
                  </pre>
                </div>

                <Button 
                  onClick={processData}
                  disabled={isProcessing || !jsonData.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      开始导入
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 结果区域 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>导入结果</span>
                  {results.length > 0 && (
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        成功: {successCount}
                      </Badge>
                      <Badge variant="destructive">
                        失败: {failureCount}
                      </Badge>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessing && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{currentItem}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <Alert key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                      <div className="flex items-start gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {result.name}
                          </div>
                          <AlertDescription className="text-xs">
                            {result.message}
                            {result.userId && (
                              <span className="text-gray-500 ml-2">
                                (ID: {result.userId})
                              </span>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>

                {results.length === 0 && !isProcessing && (
                  <div className="text-center text-gray-500 py-8">
                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>还没有导入结果</p>
                    <p className="text-sm">输入JSON数据并点击"开始导入"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
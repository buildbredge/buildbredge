"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

interface MissingProfessionUser {
  id: string
  name: string
  email: string
  company?: string
}

export default function DataCleanupPage() {
  const [missingUsers, setMissingUsers] = useState<MissingProfessionUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null)

  const fetchMissingUsers = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/fix-missing-professions')
      const result = await response.json()
      
      if (result.success) {
        setMissingUsers(result.data)
        setMessage({
          type: 'success',
          content: `找到 ${result.data.length} 个缺失专业信息的技师用户`
        })
      } else {
        setMessage({
          type: 'error',
          content: `查询失败: ${result.error}`
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: '网络请求失败'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteIncompleteUsers = async () => {
    if (!confirm(`确定要删除这 ${missingUsers.length} 个不完整的技师用户吗？此操作无法撤销！`)) {
      return
    }

    setIsDeleting(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/fix-missing-professions', {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        setMessage({
          type: 'success',
          content: result.message
        })
        // 重新获取列表
        await fetchMissingUsers()
      } else {
        setMessage({
          type: 'error',
          content: `删除失败: ${result.error}`
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: '网络请求失败'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchMissingUsers()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据清理</h1>
          <p className="text-gray-600 mt-2">
            查找和处理数据库中的不完整记录
          </p>
        </div>

        <div className="space-y-6">
          {/* 控制面板 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>缺失专业信息的技师</span>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchMissingUsers}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                  {missingUsers.length > 0 && (
                    <Button
                      onClick={deleteIncompleteUsers}
                      disabled={isDeleting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? '删除中...' : `删除全部 (${missingUsers.length})`}
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {message.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription>{message.content}</AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="mb-4">
                <Badge variant={missingUsers.length > 0 ? "destructive" : "default"}>
                  {isLoading ? "查询中..." : `缺失专业信息: ${missingUsers.length} 个用户`}
                </Badge>
              </div>

              {missingUsers.length > 0 && (
                <div className="space-y-4">
                  <Alert className="border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription>
                      这些技师用户已创建但缺失专业信息记录。可能是由于批量导入时category_id或profession_id无效导致的。
                      建议删除这些不完整的记录，然后重新导入正确的数据。
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>公司</TableHead>
                        <TableHead>用户ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.company || '-'}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-500">
                            {user.id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {missingUsers.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p className="text-gray-600">没有发现缺失专业信息的技师用户</p>
                  <p className="text-sm text-gray-500">所有技师都有完整的数据记录</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle>数据统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">106</div>
                  <div className="text-sm text-gray-600">总用户数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">104</div>
                  <div className="text-sm text-gray-600">技师角色</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">106</div>
                  <div className="text-sm text-gray-600">专业记录</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${missingUsers.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {missingUsers.length}
                  </div>
                  <div className="text-sm text-gray-600">缺失记录</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
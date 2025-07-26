"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center mb-2">
          <h2 className="text-2xl font-bold text-green-700 mb-1">登录</h2>
          <p className="text-sm text-gray-500">登录您的BuildBridge账户</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱地址</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="请输入邮箱" />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">登录</Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/auth/register" className="text-green-700 hover:underline text-sm">还没有账户？注册</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

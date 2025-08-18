"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Globe, ChevronDown, Menu, X, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [language, setLanguage] = useState("zh")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    console.log(`Switching to language: ${value}`)
  }

  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
    router.push('/')
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  const navItems = [
    { href: "/post-job", label: "发布需求" },
    { href: "/browse-tradies", label: "行业目录" },
    { href: "/browse-jobs", label: "最新任务" },
    

    { href: "/tradie-signup", label: "如何运作" },
   
  ]

  const supplierItems = [
    { href: "/suppliers", label: "全球供应商", country: "全球供应商", flag: "🌍" },
    { href: "/suppliers/new-zealand", label: "新西兰", country: "新西兰", flag: "🇳🇿" },
    { href: "/suppliers/australia", label: "澳大利亚", country: "澳大利亚", flag: "🇦🇺" },
    { href: "/suppliers/canada", label: "加拿大", country: "加拿大", flag: "🇨🇦" },
    { href: "/suppliers/usa", label: "美国", country: "美国", flag: "🇺🇸" }
  ]


  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-600">BuildBridge</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                isActive(item.href)
                  ? "text-green-600 font-medium"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Suppliers Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center space-x-1 transition-colors ${
              pathname?.startsWith("/suppliers")
                ? "text-green-600 font-medium"
                : "text-gray-600 hover:text-green-600"
            }`}>
              <span>会员折扣</span>
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {supplierItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 w-full px-2 py-2 hover:bg-gray-50"
                  >
                    <span className="text-lg">{item.flag}</span>
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="border-none shadow-none p-0 h-auto min-w-0 w-auto">
                <SelectValue />
                <ChevronDown className="w-3 h-3 ml-1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">
                  <div className="flex items-center space-x-2">
                    <span>🇨🇳</span>
                    <span>中文</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center space-x-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem value="fr">
                  <div className="flex items-center space-x-2">
                    <span>🇫🇷</span>
                    <span>Français</span>
                  </div>
                </SelectItem>
                <SelectItem value="de">
                  <div className="flex items-center space-x-2">
                    <span>🇩🇪</span>
                    <span>Deutsch</span>
                  </div>
                </SelectItem>
                <SelectItem value="ja">
                  <div className="flex items-center space-x-2">
                    <span>🇯🇵</span>
                    <span>日本語</span>
                  </div>
                </SelectItem>
                <SelectItem value="ko">
                  <div className="flex items-center space-x-2">
                    <span>🇰🇷</span>
                    <span>한국어</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Menu or Login/Register Buttons */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm font-bold bg-green-100 text-green-700">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>个人中心</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/auth/register">注册</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* User Info (Mobile) */}
            {user && (
              <div className="pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-lg font-bold bg-green-100 text-green-700">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 transition-colors ${
                  isActive(item.href)
                    ? "text-green-600 font-medium"
                    : "text-gray-600 hover:text-green-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Suppliers Section */}
            <div className="pt-2 border-t">
              <div className="text-sm text-gray-500 mb-2">会员折扣</div>
              {supplierItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 py-2 transition-colors ${
                    pathname === item.href
                      ? "text-green-600 font-medium"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.flag}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">语言选择</span>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                  <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile User Actions */}
            {user ? (
              <div className="pt-4 border-t space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 py-2 text-gray-600 hover:text-green-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>个人中心</span>
                </Link>
            
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>登录</Link>
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>注册</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailVerificationDialog } from "@/components/ui/email-verification-dialog"
import GooglePlacesAutocomplete, { SelectedAddressDisplay, PlaceResult } from "@/components/GooglePlacesAutocomplete"
import { useAuth } from "@/contexts/AuthContext"
import { User, Plus, Loader2 } from "lucide-react"

interface AddTradieModalProps {
  isOpen: boolean
  onClose: () => void
  parentTradieId: string
  parentCompany?: string
  onTradieAdded?: () => void
}

export default function AddTradieModal({ 
  isOpen, 
  onClose, 
  parentTradieId, 
  parentCompany,
  onTradieAdded 
}: AddTradieModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    company: parentCompany || "",
    categoryId: ""
  })
  
  const [googlePlace, setGooglePlace] = useState<PlaceResult | undefined>(undefined)
  const [categories, setCategories] = useState<Array<{id: string, name_en: string, name_zh: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)

  const { register } = useAuth()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setFormData(prev => ({ 
        ...prev, 
        company: parentCompany || ""
      }))
    }
  }, [isOpen, parentCompany])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (response.ok && result.success && Array.isArray(result.data)) {
        setCategories(result.data)
      } else {
        console.error('Failed to fetch categories:', result.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePlaceSelect = (place: PlaceResult) => {
    setGooglePlace(place)
    setFormData(prev => ({
      ...prev,
      location: place.address
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 表单验证
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.location) {
      setError("请填写所有必需字段")
      return
    }

    if (!formData.categoryId) {
      setError("请选择专业领域")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("密码不匹配")
      return
    }

    if (formData.password.length < 6) {
      setError("密码至少需要6个字符")
      return
    }

    setIsLoading(true)

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: "tradie",
        location: formData.location,
        company: formData.company,
        categoryId: formData.categoryId,
        parentTradieId: parentTradieId
      })

      if (result.success) {
        // 关闭主弹窗
        onClose()
        // 重置表单
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          location: "",
          company: parentCompany || "",
          categoryId: ""
        })
        setGooglePlace(undefined)
        setError("")
        // 通知父组件更新列表
        if (onTradieAdded) {
          onTradieAdded()
        }
        // 显示验证对话框
        setShowVerificationDialog(true)
      } else {
        setError(result.message || "添加技师失败，请重试")
      }
    } catch (err) {
      console.error('Error adding tradie:', err)
      setError("添加技师失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationDialogClose = () => {
    setShowVerificationDialog(false)
  }

  return (
    <>
      <EmailVerificationDialog
        isOpen={showVerificationDialog}
        onClose={handleVerificationDialogClose}
        email={formData.email}
        userType="tradie"
        isNewUser={true}
        isSubordinateTradie={true}
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>添加技师</span>
            </DialogTitle>
            <DialogDescription>
              为您的团队添加新的技师成员
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="请输入技师姓名"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">邮箱地址 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">电话号码 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="请输入电话号码"
                required
              />
            </div>

            <div>
              <Label>地址 *</Label>
              <div className="mt-2">
                {!googlePlace ? (
                  <GooglePlacesAutocomplete
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="请输入地址..."
                    label=""
                    className="h-10"
                  />
                ) : (
                  <SelectedAddressDisplay
                    place={googlePlace}
                    onEdit={() => {
                      setGooglePlace(undefined)
                      setFormData(prev => ({ ...prev, location: "" }))
                    }}
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="company">公司名称</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="请输入公司名称（可选）"
              />
            </div>

            <div>
              <Label>专业领域 *</Label>
              <Select onValueChange={(value) => handleInputChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    categories.length === 0 
                      ? "加载专业领域中..." 
                      : "选择专业领域"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      加载中...
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name_zh || category.name_en}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="请输入密码（至少6个字符）"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="请再次输入密码"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    添加中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    添加技师
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
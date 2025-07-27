"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { categoriesApi, professionsApi, Category, Profession } from "../lib/api"

interface CategoryProfessionSelectorProps {
  selectedCategoryId?: string
  selectedProfessionId?: string
  isOther?: boolean
  otherDescription?: string
  onCategoryChange: (categoryId: string | undefined) => void
  onProfessionChange: (professionId: string | undefined) => void
  onOtherToggle: (isOther: boolean) => void
  onOtherDescriptionChange: (description: string) => void
  className?: string
}

export default function CategoryProfessionSelector({
  selectedCategoryId,
  selectedProfessionId,
  isOther = false,
  otherDescription = "",
  onCategoryChange,
  onProfessionChange,
  onOtherToggle,
  onOtherDescriptionChange,
  className = ""
}: CategoryProfessionSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [professions, setProfessions] = useState<Profession[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingProfessions, setIsLoadingProfessions] = useState(false)
  const [error, setError] = useState<string>("")

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setError("")
        const data = await categoriesApi.getAll()
        setCategories(data)
      } catch (err) {
        console.error('Failed to load categories:', err)
        setError('加载分类失败，请稍后重试')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Load professions when category changes
  useEffect(() => {
    const loadProfessions = async () => {
      if (!selectedCategoryId) {
        setProfessions([])
        return
      }

      try {
        setIsLoadingProfessions(true)
        setError("")
        const data = await professionsApi.getByCategoryId(selectedCategoryId)
        setProfessions(data)
        
        // If the currently selected profession doesn't belong to the new category, clear it
        if (selectedProfessionId && !data.find(p => p.id === selectedProfessionId)) {
          onProfessionChange(undefined)
        }
      } catch (err) {
        console.error('Failed to load professions:', err)
        setError('加载职业失败，请稍后重试')
        setProfessions([])
      } finally {
        setIsLoadingProfessions(false)
      }
    }

    loadProfessions()
  }, [selectedCategoryId, selectedProfessionId, onProfessionChange])

  const handleCategoryChange = (value: string) => {
    if (value === selectedCategoryId) return
    
    onCategoryChange(value)
    // Clear profession selection when category changes
    onProfessionChange(undefined)
    
    // If "other" was selected, clear it when a category is selected
    if (isOther) {
      onOtherToggle(false)
      onOtherDescriptionChange("")
    }
  }

  const handleProfessionChange = (value: string) => {
    onProfessionChange(value)
    
    // If "other" was selected, clear it when a profession is selected
    if (isOther) {
      onOtherToggle(false)
      onOtherDescriptionChange("")
    }
  }

  const handleOtherToggle = (checked: boolean) => {
    onOtherToggle(checked)
    
    // If "other" is checked, clear category and profession selections
    if (checked) {
      onCategoryChange(undefined)
      onProfessionChange(undefined)
    } else {
      onOtherDescriptionChange("")
    }
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return undefined
    const category = categories.find(c => c.id === selectedCategoryId)
    return category?.name_zh || category?.name_en
  }

  const getSelectedProfessionName = () => {
    if (!selectedProfessionId) return undefined
    const profession = professions.find(p => p.id === selectedProfessionId)
    return profession?.name_zh || profession?.name_en
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">服务类别</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Category Selection */}
          <div>
            <Label htmlFor="category" className="text-lg font-medium">
              选择服务类别 *
            </Label>
            <Select
              value={selectedCategoryId || ""}
              onValueChange={handleCategoryChange}
              disabled={isLoadingCategories || isOther}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={
                  isLoadingCategories 
                    ? "加载中..." 
                    : isOther 
                      ? "已选择其他类别" 
                      : "请选择服务类别"
                } />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_zh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategoryId && !isOther && (
              <p className="text-sm text-gray-500 mt-1">
                已选择: {getSelectedCategoryName()}
              </p>
            )}
          </div>

          {/* Profession Selection */}
          <div>
            <Label htmlFor="profession" className="text-lg font-medium">
              选择具体职业 *
            </Label>
            <Select
              value={selectedProfessionId || ""}
              onValueChange={handleProfessionChange}
              disabled={!selectedCategoryId || isLoadingProfessions || isOther}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={
                  isOther
                    ? "已选择其他职业"
                    : !selectedCategoryId
                      ? "请先选择服务类别"
                      : isLoadingProfessions
                        ? "加载中..."
                        : professions.length === 0
                          ? "该类别暂无职业"
                          : "请选择具体职业"
                } />
              </SelectTrigger>
              <SelectContent>
                {professions.map((profession) => (
                  <SelectItem key={profession.id} value={profession.id}>
                    {profession.name_zh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProfessionId && !isOther && (
              <p className="text-sm text-gray-500 mt-1">
                已选择: {getSelectedProfessionName()}
              </p>
            )}
          </div>
        </div>

        {/* Other Option */}
        <div className="mt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="other-category"
              checked={isOther}
              onCheckedChange={handleOtherToggle}
            />
            <Label htmlFor="other-category" className="text-lg font-medium cursor-pointer">
              其他内容
            </Label>
          </div>
          
          {isOther && (
            <div className="mt-3">
              <Label htmlFor="other-description" className="text-sm font-medium text-gray-700">
                请描述您需要的服务类别和职业
              </Label>
              <Input
                id="other-description"
                type="text"
                placeholder="例如：特殊装修工艺、定制家具制作等..."
                value={otherDescription}
                onChange={(e) => onOtherDescriptionChange(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>

        {/* Summary */}
        {(selectedCategoryId || selectedProfessionId || isOther) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>您选择的服务:</strong>{" "}
              {isOther 
                ? `其他 - ${otherDescription || "（请填写描述）"}`
                : `${getSelectedCategoryName() || "（未选择）"} - ${getSelectedProfessionName() || "（未选择）"}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronRight,
  Briefcase,
  Plus,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"

interface Category {
  id: string
  name_en: string
  name_zh: string
}

interface Profession {
  id: string
  category_id: string
  name_en: string
  name_zh: string
  categories?: Category
}

interface ProfessionSelectorProps {
  tradieId: string
  onProfessionsChange?: (professionIds: string[]) => void
}

export function ProfessionSelector({ tradieId, onProfessionsChange }: ProfessionSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [professions, setProfessions] = useState<Profession[]>([])
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([])
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        const categoriesData = await categoriesResponse.json()

        // Fetch all professions
        const professionsResponse = await fetch('/api/professions')
        const professionsData = await professionsResponse.json()

        // Fetch tradie's current professions
        const tradieResponse = await fetch(`/api/tradies/${tradieId}/professions`)
        const tradieData = await tradieResponse.json()

        if (categoriesResponse.ok && professionsResponse.ok && tradieResponse.ok) {
          setCategories(categoriesData || [])
          setProfessions(professionsData.professions || [])
          
          const currentProfessionIds = tradieData.professions?.map((p: Profession) => p.id) || []
          setSelectedProfessions(currentProfessionIds)

          // Auto-open categories that have selected professions
          const categoriesToOpen = new Set<string>()
          tradieData.professions?.forEach((prof: Profession) => {
            if (prof.category_id) {
              categoriesToOpen.add(prof.category_id)
            }
          })
          setOpenCategories(Array.from(categoriesToOpen))
        } else {
          setError("无法加载专业技能数据")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("加载失败，请稍后再试")
      } finally {
        setLoading(false)
      }
    }

    if (tradieId) {
      fetchData()
    }
  }, [tradieId])

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleProfession = (professionId: string) => {
    const newSelection = selectedProfessions.includes(professionId)
      ? selectedProfessions.filter(id => id !== professionId)
      : [...selectedProfessions, professionId]

    setSelectedProfessions(newSelection)
    onProfessionsChange?.(newSelection)
  }

  const removeProfession = (professionId: string) => {
    const newSelection = selectedProfessions.filter(id => id !== professionId)
    setSelectedProfessions(newSelection)
    onProfessionsChange?.(newSelection)
  }

  const saveProfessions = async () => {
    try {
      setSaving(true)
      setError("")

      const response = await fetch(`/api/tradies/${tradieId}/professions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profession_ids: selectedProfessions
        })
      })

      if (response.ok) {
        // Successfully saved
        setError("")
      } else {
        setError("保存失败，请重试")
      }
    } catch (err) {
      console.error("Error saving professions:", err)
      setError("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  const getSelectedProfessionsForDisplay = () => {
    return professions.filter(p => selectedProfessions.includes(p.id))
  }

  const getProfessionsForCategory = (categoryId: string) => {
    return professions.filter(p => p.category_id === categoryId)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            专业技能选择
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span>加载专业技能选项...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !categories.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            专业技能选择
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-6 h-6 mr-3" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          专业技能选择
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          选择您提供服务的专业技能，这将用于匹配相关项目
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Selected Professions Summary */}
        {selectedProfessions.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              已选择的专业技能 ({selectedProfessions.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {getSelectedProfessionsForDisplay().map((profession) => (
                <Badge
                  key={profession.id}
                  className="bg-green-100 text-green-800 pr-1"
                >
                  {profession.name_zh || profession.name_en}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-green-200"
                    onClick={() => removeProfession(profession.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category and Profession Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            选择服务类别和专业技能
          </Label>
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryProfessions = getProfessionsForCategory(category.id)
              const isOpen = openCategories.includes(category.id)
              const selectedCount = categoryProfessions.filter(p => 
                selectedProfessions.includes(p.id)
              ).length

              return (
                <Collapsible
                  key={category.id}
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between p-4 h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">
                            {category.name_zh || category.name_en}
                          </p>
                          <p className="text-sm text-gray-500">
                            {categoryProfessions.length} 个专业，
                            已选 {selectedCount} 个
                          </p>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                      {categoryProfessions.map((profession) => (
                        <div key={profession.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={profession.id}
                            checked={selectedProfessions.includes(profession.id)}
                            onCheckedChange={() => toggleProfession(profession.id)}
                          />
                          <Label
                            htmlFor={profession.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {profession.name_zh || profession.name_en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveProfessions}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                保存专业技能
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
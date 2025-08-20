"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar, 
  MapPin, 
  DollarSign,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

interface PortfolioItem {
  id: string
  title: string
  description: string | null
  completed_date: string | null
  location: string | null
  budget: string | null
  images: string[]
  created_at: string
  updated_at: string
}

interface PortfolioManagementProps {
  tradieId: string
}

export function PortfolioManagement({ tradieId }: PortfolioManagementProps) {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    completed_date: "",
    location: "",
    budget: "",
    images: [] as string[]
  })

  useEffect(() => {
    loadPortfolios()
  }, [tradieId])

  const loadPortfolios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tradie_portfolios')
        .select('*')
        .eq('tradie_id', tradieId)
        .order('completed_date', { ascending: false })

      if (error) {
        console.error('Error loading portfolios:', error)
        return
      }

      setPortfolios(data || [])
    } catch (error) {
      console.error('Error loading portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        description: item.description || "",
        completed_date: item.completed_date || "",
        location: item.location || "",
        budget: item.budget || "",
        images: item.images || []
      })
    } else {
      setEditingItem(null)
      setFormData({
        title: "",
        description: "",
        completed_date: "",
        location: "",
        budget: "",
        images: []
      })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingItem(null)
    setFormData({
      title: "",
      description: "",
      completed_date: "",
      location: "",
      budget: "",
      images: []
    })
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('请输入项目标题')
      return
    }

    try {
      setSaving(true)
      
      const portfolioData = {
        tradie_id: tradieId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        completed_date: formData.completed_date || null,
        location: formData.location.trim() || null,
        budget: formData.budget.trim() || null,
        images: formData.images
      }

      let result
      if (editingItem) {
        // Update existing
        result = await supabase
          .from('tradie_portfolios')
          .update(portfolioData)
          .eq('id', editingItem.id)
          .select()
      } else {
        // Create new
        result = await supabase
          .from('tradie_portfolios')
          .insert(portfolioData)
          .select()
      }

      if (result.error) {
        console.error('Error saving portfolio:', result.error)
        alert('保存失败，请重试')
        return
      }

      await loadPortfolios()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving portfolio:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tradie_portfolios')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting portfolio:', error)
        alert('删除失败，请重试')
        return
      }

      await loadPortfolios()
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      alert('删除失败，请重试')
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt('请输入图片URL:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }))
    }
  }

  const handleImageUrlRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>加载项目历史中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>项目历史</CardTitle>
            <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              添加项目
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {portfolios.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无项目历史</h3>
              <p className="text-gray-600 mb-4">
                添加您完成的项目案例，让客户了解您的专业技能和工作质量
              </p>
              <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                添加第一个项目
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {portfolios.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-600 mb-3">{item.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {item.completed_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.completed_date).toLocaleDateString('zh-CN')}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{item.budget}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.images && item.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {item.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                          <Image
                            src={image}
                            alt={`${item.title} - 图片 ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/api/placeholder/200/200"
                            }}
                          />
                          {index === 3 && item.images.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                              +{item.images.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '编辑项目' : '添加新项目'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">项目标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例如：住宅电路改造"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">项目描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="详细描述项目内容、使用的技术、遇到的挑战等..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="completed_date">完成日期</Label>
                <Input
                  id="completed_date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">项目地点</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="例如：奥克兰市"
                />
              </div>

              <div>
                <Label htmlFor="budget">项目预算</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="例如：$2000-3000"
                />
              </div>
            </div>

            <div>
              <Label>项目图片</Label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={image}
                      onChange={(e) => {
                        const newImages = [...formData.images]
                        newImages[index] = e.target.value
                        setFormData(prev => ({ ...prev, images: newImages }))
                      }}
                      placeholder="图片URL"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageUrlRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageUrlAdd}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加图片
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={saving}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
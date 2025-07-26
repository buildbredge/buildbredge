"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Plus, CheckCircle2, Lock, Unlock, X, MapPin, Star } from "lucide-react"
import { ownersApi, tradiesApi, reviewsApi, Owner, Tradie, Review } from "@/lib/api"

export default function AdminDashboard() {
  const [tab, setTab] = useState("owners")
  const [owners, setOwners] = useState<Owner[]>([])
  const [editOwner, setEditOwner] = useState<Owner | null>(null)
  const [newOwner, setNewOwner] = useState({ name: "", phone: "", email: "", address: "" })

  const [tradies, setTradies] = useState<Tradie[]>([])
  const [editTradie, setEditTradie] = useState<Tradie | null>(null)
  const [newTradie, setNewTradie] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    specialty: "",
    address: "",
    service_radius: 30
  })

  const [reviews, setReviews] = useState<Review[]>([])

  // 加载业主数据
  useEffect(() => {
    loadOwners()
  }, [])

  const loadOwners = async () => {
    try {
      const data = await ownersApi.getAll()
      setOwners(data)
    } catch (error) {
      console.error('加载业主数据失败:', error)
      alert('加载业主数据失败，请刷新页面重试。')
    }
  }

  // 添加业主
  const handleAdd = async () => {
    if (!newOwner.name.trim() || !newOwner.phone.trim() || !newOwner.email.trim()) return
    try {
      await ownersApi.create({
        name: newOwner.name,
        phone: newOwner.phone,
        email: newOwner.email,
        address: newOwner.address || null,
        status: "pending",
        balance: 0
      })
      setNewOwner({ name: "", phone: "", email: "", address: "" })
      loadOwners()
    } catch (error) {
      console.error('添加业主失败:', error)
      alert('添加业主失败，请检查邮箱是否重复。')
    }
  }

  // 编辑业主
  const handleSaveEdit = async () => {
    if (!editOwner) return
    try {
      await ownersApi.update(editOwner.id, {
        name: editOwner.name,
        phone: editOwner.phone,
        email: editOwner.email,
        address: editOwner.address
      })
      setEditOwner(null)
      loadOwners()
    } catch (error) {
      console.error('更新业主失败:', error)
      alert('更新业主失败，请重试。')
    }
  }

  // 更新业主状态
  const handleStatus = async (id: string, status: Owner["status"]) => {
    try {
      await ownersApi.update(id, { status })
      loadOwners()
    } catch (error) {
      console.error('更新状态失败:', error)
      alert('更新状态失败，请重试。')
    }
  }

  // 删除业主
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个业主吗？此操作不可恢复。')) return
    try {
      await ownersApi.delete(id)
      loadOwners()
    } catch (error) {
      console.error('删除业主失败:', error)
      alert('删除业主失败，请重试。')
    }
  }

  // 加载技师数据
  useEffect(() => {
    loadTradies()
  }, [])

  const loadTradies = async () => {
    try {
      const data = await tradiesApi.getAll()
      setTradies(data)
    } catch (error) {
      console.error('加载技师数据失败:', error)
      alert('加载技师数据失败，请刷新页面重试。')
    }
  }

  const handleAddTradie = async () => {
    if (
      !newTradie.name.trim() ||
      !newTradie.phone.trim() ||
      !newTradie.email.trim() ||
      !newTradie.company.trim() ||
      !newTradie.specialty.trim()
    )
      return
    try {
      await tradiesApi.create({
        name: newTradie.name,
        phone: newTradie.phone,
        email: newTradie.email,
        company: newTradie.company,
        specialty: newTradie.specialty,
        address: newTradie.address || null,
        service_radius: newTradie.service_radius,
        status: "pending",
        balance: 0
      })
      setNewTradie({
        name: "",
        phone: "",
        email: "",
        company: "",
        specialty: "",
        address: "",
        service_radius: 30
      })
      loadTradies()
    } catch (error) {
      console.error('添加技师失败:', error)
      alert('添加技师失败，请检查邮箱是否重复。')
    }
  }

  const handleSaveEditTradie = async () => {
    if (!editTradie) return
    try {
      await tradiesApi.update(editTradie.id, {
        name: editTradie.name,
        phone: editTradie.phone,
        email: editTradie.email,
        company: editTradie.company,
        specialty: editTradie.specialty,
        address: editTradie.address,
        service_radius: editTradie.service_radius
      })
      setEditTradie(null)
      loadTradies()
    } catch (error) {
      console.error('更新技师失败:', error)
      alert('更新技师失败，请重试。')
    }
  }

  const handleStatusTradie = async (id: string, status: Tradie["status"]) => {
    try {
      await tradiesApi.update(id, { status })
      loadTradies()
    } catch (error) {
      console.error('更新技师状态失败:', error)
      alert('更新技师状态失败，请重试。')
    }
  }

  const handleDeleteTradie = async (id: string) => {
    if (!confirm('确定要删除这个技师吗？此操作不可恢复。')) return
    try {
      await tradiesApi.delete(id)
      loadTradies()
    } catch (error) {
      console.error('删除技师失败:', error)
      alert('删除技师失败，请重试。')
    }
  }

  // 加载评论数据
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const data = await reviewsApi.getAll()
      setReviews(data)
    } catch (error) {
      console.error('加载评论数据失败:', error)
    }
  }

  // 审核评论
  const handleReviewApproval = async (id: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        await reviewsApi.approve(id)
      } else {
        await reviewsApi.reject(id)
      }
      loadReviews()
      loadTradies() // 重新加载技师数据以更新评分
    } catch (error) {
      console.error('审核评论失败:', error)
      alert('审核评论失败，请重试。')
    }
  }

  // 删除评论
  const handleDeleteReview = async (id: string) => {
    if (!confirm('确定要删除这个评论吗？此操作不可恢复。')) return
    try {
      await reviewsApi.delete(id)
      loadReviews()
      loadTradies() // 重新加载技师数据以更新评分
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败，请重试。')
    }
  }

  // 格式化坐标显示
  const formatCoordinates = (lat: number | null, lng: number | null) => {
    if (!lat || !lng) return "未设置"
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  // 获取评分显示
  const getRatingDisplay = (rating: number, reviewCount: number) => {
    if (reviewCount === 0) return "暂无评分"
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">({reviewCount})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BuildBridge 管理后台</h1>
          <p className="text-gray-600">管理业主、技师和评论信息</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="owners">业主管理 ({owners.length})</TabsTrigger>
            <TabsTrigger value="tradies">技师管理 ({tradies.length})</TabsTrigger>
            <TabsTrigger value="reviews">评论管理 ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* 业主管理 */}
          <TabsContent value="owners">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>业主管理</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="姓名"
                    value={newOwner.name}
                    className="w-24"
                    onChange={e => setNewOwner({ ...newOwner, name: e.target.value })}
                  />
                  <Input
                    placeholder="电话"
                    value={newOwner.phone}
                    className="w-28"
                    onChange={e => setNewOwner({ ...newOwner, phone: e.target.value })}
                  />
                  <Input
                    placeholder="邮箱"
                    value={newOwner.email}
                    className="w-40"
                    onChange={e => setNewOwner({ ...newOwner, email: e.target.value })}
                  />
                  <Input
                    placeholder="地址"
                    value={newOwner.address}
                    className="w-32"
                    onChange={e => setNewOwner({ ...newOwner, address: e.target.value })}
                  />
                  <Button className="bg-green-600" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-1" /> 添加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">姓名</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">电话</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">邮箱</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">地址</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">坐标</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">余额</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">状态</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map(owner => (
                        <tr key={owner.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1 text-sm">
                            {editOwner?.id === owner.id ? (
                              <Input
                                value={editOwner.name}
                                onChange={e => setEditOwner({ ...editOwner, name: e.target.value })}
                                className="w-20 py-1 px-2"
                              />
                            ) : (
                              owner.name
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editOwner?.id === owner.id ? (
                              <Input
                                value={editOwner.phone}
                                onChange={e => setEditOwner({ ...editOwner, phone: e.target.value })}
                                className="w-24 py-1 px-2"
                              />
                            ) : (
                              owner.phone
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editOwner?.id === owner.id ? (
                              <Input
                                value={editOwner.email}
                                onChange={e => setEditOwner({ ...editOwner, email: e.target.value })}
                                className="w-32 py-1 px-2"
                              />
                            ) : (
                              owner.email
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editOwner?.id === owner.id ? (
                              <Input
                                value={editOwner.address || ""}
                                onChange={e => setEditOwner({ ...editOwner, address: e.target.value })}
                                className="w-28 py-1 px-2"
                              />
                            ) : (
                              owner.address || "未填写"
                            )}
                          </td>
                          <td className="px-2 py-1 text-xs">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              {formatCoordinates(owner.latitude, owner.longitude)}
                            </div>
                          </td>
                          <td className="px-2 py-1 text-sm">${owner.balance.toFixed(2)}</td>
                          <td className="px-2 py-1 text-xs">
                            {owner.status === "pending" && <Badge variant="outline" className="bg-yellow-100 text-yellow-700">待审核</Badge>}
                            {owner.status === "approved" && <Badge variant="outline" className="bg-green-100 text-green-800">已开通</Badge>}
                            {owner.status === "closed" && <Badge variant="outline" className="bg-red-100 text-red-700">已关闭</Badge>}
                          </td>
                          <td className="px-2 py-1 text-xs flex gap-1">
                            {editOwner?.id === owner.id ? (
                              <Button size="sm" onClick={handleSaveEdit}>保存</Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setEditOwner(owner)}>
                                <Edit className="w-3 h-3 mr-1" />编辑
                              </Button>
                            )}
                            {owner.status === "pending" && (
                              <Button variant="outline" size="sm" onClick={() => handleStatus(owner.id, "approved")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />通过
                              </Button>
                            )}
                            {owner.status !== "closed" ? (
                              <Button variant="outline" size="sm" onClick={() => handleStatus(owner.id, "closed")}>
                                <Lock className="w-3 h-3 mr-1" />关闭
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleStatus(owner.id, "approved")}>
                                <Unlock className="w-3 h-3 mr-1" />开通
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDelete(owner.id)}>
                              <X className="w-3 h-3 mr-1"/>删除
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 技师管理 */}
          <TabsContent value="tradies">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>技师管理</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="姓名"
                    value={newTradie.name}
                    className="w-20"
                    onChange={e => setNewTradie({ ...newTradie, name: e.target.value })}
                  />
                  <Input
                    placeholder="电话"
                    value={newTradie.phone}
                    className="w-24"
                    onChange={e => setNewTradie({ ...newTradie, phone: e.target.value })}
                  />
                  <Input
                    placeholder="邮箱"
                    value={newTradie.email}
                    className="w-32"
                    onChange={e => setNewTradie({ ...newTradie, email: e.target.value })}
                  />
                  <Input
                    placeholder="公司"
                    value={newTradie.company}
                    className="w-24"
                    onChange={e => setNewTradie({ ...newTradie, company: e.target.value })}
                  />
                  <Input
                    placeholder="专长"
                    value={newTradie.specialty}
                    className="w-20"
                    onChange={e => setNewTradie({ ...newTradie, specialty: e.target.value })}
                  />
                  <Button className="bg-green-600" onClick={handleAddTradie}>
                    <Plus className="w-4 h-4 mr-1" />添加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">姓名</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">电话</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">邮箱</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">公司</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">专长</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">地址</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">坐标</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">半径</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">评分</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">余额</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">状态</th>
                        <th className="px-2 py-1 whitespace-nowrap font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradies.map(tradie => (
                        <tr key={tradie.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.name}
                                onChange={e => setEditTradie({ ...editTradie, name: e.target.value })}
                                className="w-20 py-1 px-2"
                              />
                            ) : (
                              tradie.name
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.phone}
                                onChange={e => setEditTradie({ ...editTradie, phone: e.target.value })}
                                className="w-24 py-1 px-2"
                              />
                            ) : (
                              tradie.phone
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.email}
                                onChange={e => setEditTradie({ ...editTradie, email: e.target.value })}
                                className="w-32 py-1 px-2"
                              />
                            ) : (
                              tradie.email
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.company}
                                onChange={e => setEditTradie({ ...editTradie, company: e.target.value })}
                                className="w-24 py-1 px-2"
                              />
                            ) : (
                              tradie.company
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.specialty}
                                onChange={e => setEditTradie({ ...editTradie, specialty: e.target.value })}
                                className="w-20 py-1 px-2"
                              />
                            ) : (
                              tradie.specialty
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                value={editTradie.address || ""}
                                onChange={e => setEditTradie({ ...editTradie, address: e.target.value })}
                                className="w-24 py-1 px-2"
                              />
                            ) : (
                              tradie.address || "未填写"
                            )}
                          </td>
                          <td className="px-2 py-1 text-xs">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              {formatCoordinates(tradie.latitude, tradie.longitude)}
                            </div>
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {editTradie?.id === tradie.id ? (
                              <Input
                                type="number"
                                value={editTradie.service_radius}
                                onChange={e => setEditTradie({ ...editTradie, service_radius: Number(e.target.value) })}
                                className="w-16 py-1 px-2"
                              />
                            ) : (
                              `${tradie.service_radius}km`
                            )}
                          </td>
                          <td className="px-2 py-1 text-sm">
                            {getRatingDisplay(tradie.rating, tradie.review_count)}
                          </td>
                          <td className="px-2 py-1 text-sm">${tradie.balance.toFixed(2)}</td>
                          <td className="px-2 py-1 text-xs">
                            {tradie.status === "pending" && <Badge variant="outline" className="bg-yellow-100 text-yellow-700">待审核</Badge>}
                            {tradie.status === "approved" && <Badge variant="outline" className="bg-green-100 text-green-800">已开通</Badge>}
                            {tradie.status === "closed" && <Badge variant="outline" className="bg-red-100 text-red-700">已关闭</Badge>}
                          </td>
                          <td className="px-2 py-1 text-xs flex gap-1">
                            {editTradie?.id === tradie.id ? (
                              <Button size="sm" onClick={handleSaveEditTradie}>保存</Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setEditTradie(tradie)}>
                                <Edit className="w-3 h-3 mr-1" />编辑
                              </Button>
                            )}
                            {tradie.status === "pending" && (
                              <Button variant="outline" size="sm" onClick={() => handleStatusTradie(tradie.id, "approved")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />通过
                              </Button>
                            )}
                            {tradie.status !== "closed" ? (
                              <Button variant="outline" size="sm" onClick={() => handleStatusTradie(tradie.id, "closed")}>
                                <Lock className="w-3 h-3 mr-1" />关闭
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleStatusTradie(tradie.id, "approved")}>
                                <Unlock className="w-3 h-3 mr-1" />开通
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTradie(tradie.id)}>
                              <X className="w-3 h-3 mr-1"/>删除
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 评论管理 */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>评论管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      暂无评论数据
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium text-lg">{review.rating}/5</span>
                            <Badge
                              variant={review.is_approved ? "default" : "destructive"}
                              className={review.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            >
                              {review.is_approved ? "已审核" : "待审核"}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            {!review.is_approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewApproval(review.id, true)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                通过
                              </Button>
                            )}
                            {review.is_approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewApproval(review.id, false)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                拒绝
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">项目ID:</span><br />
                            {review.project_id.substring(0, 8)}...
                          </div>
                          <div>
                            <span className="font-medium">业主ID:</span><br />
                            {review.owner_id.substring(0, 8)}...
                          </div>
                          <div>
                            <span className="font-medium">技师ID:</span><br />
                            {review.tradie_id.substring(0, 8)}...
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          创建时间: {new Date(review.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

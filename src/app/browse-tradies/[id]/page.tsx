// ... existing code ... <imports and interface definitions>

export default function TradieDetailPage() {
  const params = useParams()
  const tradieId = params.id

  // ... existing code ... <tradie data and state management>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/browse-tradies" className="flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              返回技师列表
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              收藏
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 技师基本信息 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                // ... existing code ... <tradie info display>
              </div>

              <div className="lg:w-80">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">参考价格</p>
                        <p className="text-2xl font-bold text-green-600">{tradie.priceRange}</p>
                        <p className="text-sm text-gray-500">平均 ${tradie.hourlyRate}/小时</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">响应时间</p>
                        <p className="font-medium">{tradie.responseTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">工作时间</p>
                        <p className="font-medium">{tradie.workingHours}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">语言</p>
                        <div className="flex gap-2 mt-1">
                          {tradie.languages.map((lang) => (
                            <Badge key={lang} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <Link href={`/browse-tradies/${tradieId}/contact`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          联系技师
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        // ... existing code ... <tabs and other content>
      </div>
    </div>
  )
}

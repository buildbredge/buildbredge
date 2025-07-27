"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"

interface ImageGalleryModalProps {
  images: string[]
  isOpen: boolean
  initialIndex: number
  onClose: () => void
}

export function ImageGalleryModal({ 
  images, 
  isOpen, 
  initialIndex = 0, 
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // 重置状态当模态框打开时
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setRotation(0)
    }
  }, [isOpen, initialIndex])

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.2, 2))
          break
        case '-':
          setZoom(prev => Math.max(prev - 0.2, 0.5))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setZoom(1)
    setRotation(0)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = images[currentIndex]
    link.download = `project-image-${currentIndex + 1}.jpg`
    link.click()
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
  }

  if (!isOpen || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      {/* 背景点击关闭 */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl max-h-[90vh] w-full flex flex-col overflow-hidden">
        {/* 头部工具栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-900">
              {currentIndex + 1} / {images.length}
            </span>
            <span className="text-sm text-gray-600">
              使用 ← → 键切换图片，ESC 关闭
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 缩放控制 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
              className="text-gray-700 hover:bg-gray-200"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2 text-gray-700">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
              className="text-gray-700 hover:bg-gray-200"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            {/* 旋转 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRotation(prev => prev + 90)}
              className="text-gray-700 hover:bg-gray-200"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* 下载 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-700 hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* 关闭 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 图片展示区域 */}
        <div className="flex-1 relative flex items-center justify-center p-6 bg-gray-100 min-h-[400px] max-h-[60vh] overflow-hidden">
          {/* 左箭头 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={goToPrevious}
              className="absolute left-4 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full w-12 h-12 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {/* 图片容器 */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="relative flex items-center justify-center cursor-pointer"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out',
                transformOrigin: 'center center'
              }}
            >
              <Image
                src={images[currentIndex]}
                alt={`项目图片 ${currentIndex + 1}`}
                width={800}
                height={600}
                className="max-w-[calc(100%-8rem)] max-h-[calc(60vh-8rem)] object-contain rounded-lg shadow-md"
                onClick={resetView}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.jpg'
                }}
              />
            </div>
          </div>

          {/* 右箭头 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={goToNext}
              className="absolute right-4 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full w-12 h-12 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* 底部缩略图 */}
        {images.length > 1 && (
          <div className="p-4 border-t bg-white">
            <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setZoom(1)
                    setRotation(0)
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-500' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`缩略图 ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
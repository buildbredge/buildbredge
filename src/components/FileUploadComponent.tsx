"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload,
  File,
  X,
  Image,
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react"

export interface FileAttachment {
  filename: string
  url: string
  type: string
  size: number
  uploaded_at: string
}

interface FileUploadComponentProps {
  onFilesChange: (files: FileAttachment[]) => void
  files: FileAttachment[]
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export function FileUploadComponent({
  onFilesChange,
  files,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  disabled = false
}: FileUploadComponentProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `文件 "${file.name}" 超过最大大小限制 (${maxSize}MB)`
    }

    // 检查文件类型
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })

    if (!isValidType) {
      return `不支持的文件类型: ${file.name}`
    }

    return null
  }

  const handleFileSelect = async (selectedFiles: File[]) => {
    setError("")
    
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`)
      return
    }

    // 验证所有文件
    for (const file of selectedFiles) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setUploading(true)

    try {
      const newFiles: FileAttachment[] = []

      for (const file of selectedFiles) {
        // 上传文件到服务器
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`上传文件 "${file.name}" 失败`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || `上传文件 "${file.name}" 失败`)
        }
        
        newFiles.push(result.file)
      }

      onFilesChange([...files, ...newFiles])
    } catch (err: any) {
      setError(err.message || '上传文件失败')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled || uploading) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileSelect(droppedFiles)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selectedFiles = Array.from(e.target.files)
    handleFileSelect(selectedFiles)
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">上传附件 (可选)</Label>
        
        {/* 拖拽上传区域 */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${disabled || uploading 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            }
          `}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(',')}
            disabled={disabled || uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">正在上传文件...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                点击或拖拽文件到此处上传
              </p>
              <p className="text-xs text-gray-500">
                支持图片、PDF、Word文档等，最大 {maxSize}MB
              </p>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 文件限制说明 */}
        <p className="text-xs text-gray-500">
          最多上传 {maxFiles} 个文件，单个文件不超过 {maxSize}MB
        </p>
      </div>

      {/* 已上传文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">已上传文件 ({files.length})</Label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled || uploading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
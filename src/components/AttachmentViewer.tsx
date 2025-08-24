"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Download,
  File,
  Image,
  FileText,
  Archive,
  Eye
} from "lucide-react"
import { FileAttachment } from "@/components/FileUploadComponent"

interface AttachmentViewerProps {
  attachments: FileAttachment[]
  title?: string
  showTitle?: boolean
  allowDownload?: boolean
}

export function AttachmentViewer({
  attachments,
  title = "附件",
  showTitle = true,
  allowDownload = true
}: AttachmentViewerProps) {
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />
    }
    if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />
    }
    if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileText className="w-5 h-5 text-green-600" />
    }
    if (type.includes('zip') || type.includes('archive')) {
      return <Archive className="w-5 h-5 text-orange-500" />
    }
    return <File className="w-5 h-5 text-gray-500" />
  }

  const handleDownload = async (attachment: FileAttachment) => {
    try {
      // 处理不同类型的URL
      if (attachment.url.startsWith('blob:')) {
        // 处理blob URL
        const response = await fetch(attachment.url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = attachment.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (attachment.url.startsWith('data:')) {
        // 处理base64 data URL
        const a = document.createElement('a')
        a.href = attachment.url
        a.download = attachment.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        // 处理远程URL
        const a = document.createElement('a')
        a.href = attachment.url
        a.download = attachment.filename
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleView = (attachment: FileAttachment) => {
    // 对于图片和PDF，在新窗口中打开
    if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
      window.open(attachment.url, '_blank')
    } else {
      // 其他文件类型直接下载
      handleDownload(attachment)
    }
  }

  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <File className="w-4 h-4 mr-2" />
            {title} ({attachments.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "pt-0" : ""}>
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600" 
                    title={attachment.filename}
                    onClick={() => handleView(attachment)}
                  >
                    {attachment.filename}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>•</span>
                    <span>{new Date(attachment.uploaded_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 预览/查看按钮 */}
                {(attachment.type.startsWith('image/') || attachment.type === 'application/pdf') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(attachment)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    title="预览"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                
                {/* 下载按钮 */}
                {allowDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!allowDownload && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            请联系报价方获取文件
          </p>
        )}
      </CardContent>
    </Card>
  )
}
import { supabase } from './supabase'

// 文件验证结果接口
export interface FileValidationResult {
  valid: boolean
  error?: string
}

// 上传进度回调类型
export type UploadProgressCallback = (progress: number) => void

// 支持的文件类型配置
const FILE_CONFIG = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/wmv', 'video/x-ms-wmv'],
    allowedExtensions: ['.mp4', '.mov', '.avi', '.wmv']
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
      'application/rar',
      'application/x-rar-compressed'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip', '.rar']
  }
}

/**
 * 验证文件是否符合要求
 */
export function validateFile(file: File, type: 'image' | 'video' | 'document'): FileValidationResult {
  const config = FILE_CONFIG[type]
  
  // 检查文件大小
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制（最大 ${formatFileSize(config.maxSize)}）`
    }
  }
  
  // 检查文件类型
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件格式，请使用 ${config.allowedExtensions.join(', ')} 格式`
    }
  }
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  const hasValidExtension = config.allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `文件扩展名不正确，请使用 ${config.allowedExtensions.join(', ')} 格式`
    }
  }
  
  return { valid: true }
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * 生成唯一的文件名
 */
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  return `${timestamp}_${random}${extension}`
}

/**
 * 上传单张图片到 Supabase Storage
 */
export async function uploadImage(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 验证文件
  const validation = validateFile(file, 'image')
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // 生成文件路径
  const fileName = generateFileName(file.name)
  const filePath = `projects/${projectId}/images/${fileName}`
  
  try {
    // 模拟上传进度（Supabase Storage 暂不支持原生进度回调）
    if (onProgress) {
      onProgress(0)
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10))
      }, 200)
      
      setTimeout(() => clearInterval(progressInterval), 1000)
    }
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from('buildbridge')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`图片上传失败: ${error.message}`)
    }
    
    if (onProgress) {
      onProgress(100)
    }
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('buildbridge')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
    
  } catch (error) {
    if (onProgress) {
      onProgress(0)
    }
    throw error
  }
}

/**
 * 上传视频到 Supabase Storage
 */
export async function uploadVideo(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 验证文件
  const validation = validateFile(file, 'video')
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // 生成文件路径
  const fileName = generateFileName(file.name)
  const filePath = `projects/${projectId}/videos/${fileName}`
  
  try {
    // 模拟上传进度
    if (onProgress) {
      onProgress(0)
      const progressInterval = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10))
      }, 500)
      
      setTimeout(() => clearInterval(progressInterval), 2000)
    }
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from('buildbridge')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`视频上传失败: ${error.message}`)
    }
    
    if (onProgress) {
      onProgress(100)
    }
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('buildbridge')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
    
  } catch (error) {
    if (onProgress) {
      onProgress(0)
    }
    throw error
  }
}

/**
 * 批量上传项目图片
 */
export async function uploadProjectImages(
  files: File[],
  projectId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    return uploadImage(file, projectId, (progress) => {
      if (onProgress) {
        onProgress(index, progress)
      }
    })
  })
  
  try {
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    throw new Error(`批量图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 上传项目视频
 */
export async function uploadProjectVideo(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  return uploadVideo(file, projectId, onProgress)
}

/**
 * 上传单个文档到 Supabase Storage
 */
export async function uploadDocument(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 验证文件
  const validation = validateFile(file, 'document')
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // 生成文件路径
  const fileName = generateFileName(file.name)
  const filePath = `projects/${projectId}/documents/${fileName}`
  
  try {
    // 模拟上传进度
    if (onProgress) {
      onProgress(0)
      const progressInterval = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10))
      }, 300)
      
      setTimeout(() => clearInterval(progressInterval), 1500)
    }
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from('buildbridge')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`文档上传失败: ${error.message}`)
    }
    
    if (onProgress) {
      onProgress(100)
    }
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('buildbridge')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
    
  } catch (error) {
    if (onProgress) {
      onProgress(0)
    }
    throw error
  }
}

/**
 * 批量上传项目文档
 */
export async function uploadProjectDocuments(
  files: File[],
  projectId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    return uploadDocument(file, projectId, (progress) => {
      if (onProgress) {
        onProgress(index, progress)
      }
    })
  })
  
  try {
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    throw new Error(`批量文档上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 删除存储中的文件
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('buildbridge')
    .remove([filePath])
  
  if (error) {
    throw new Error(`删除文件失败: ${error.message}`)
  }
}

/**
 * 删除项目相关的所有文件
 */
export async function deleteProjectFiles(projectId: string): Promise<void> {
  try {
    // 删除图片文件夹
    const { error: imageError } = await supabase.storage
      .from('buildbridge')
      .remove([`projects/${projectId}/images`])
    
    // 删除视频文件夹
    const { error: videoError } = await supabase.storage
      .from('buildbridge')
      .remove([`projects/${projectId}/videos`])
    
    // 删除文档文件夹
    const { error: documentError } = await supabase.storage
      .from('buildbridge')
      .remove([`projects/${projectId}/documents`])
    
    if (imageError || videoError || documentError) {
      console.warn('部分文件删除失败:', { imageError, videoError, documentError })
    }
  } catch (error) {
    console.error('删除项目文件时出错:', error)
    throw new Error('删除项目文件失败')
  }
}

/**
 * 获取文件的公开URL
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('buildbridge')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * 从URL中提取文件路径
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'buildbridge')
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/')
    }
    
    return null
  } catch {
    return null
  }
}
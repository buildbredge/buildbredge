import { supabase } from './supabase'

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp'
]

// 支持的视频格式
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mov', 
  'video/avi',
  'video/wmv'
]

// 文件大小限制
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// 上传文件到Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  try {
    console.log(`📤 上传文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // 验证文件类型和大小
    if (file.type.startsWith('image/')) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`不支持的图片格式: ${file.type}`)
      }
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error(`图片文件过大，最大支持 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
      }
    } else if (file.type.startsWith('video/')) {
      if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        throw new Error(`不支持的视频格式: ${file.type}`)
      }
      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error(`视频文件过大，最大支持 ${MAX_VIDEO_SIZE / 1024 / 1024}MB`)
      }
    } else {
      throw new Error(`不支持的文件类型: ${file.type}`)
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `${path}/${fileName}`

    // 上传文件
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ 文件上传失败:', error)
      throw new Error(`文件上传失败: ${error.message}`)
    }

    // 获取公共URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!publicData?.publicUrl) {
      throw new Error('获取文件公共URL失败')
    }

    console.log(`✅ 文件上传成功: ${publicData.publicUrl}`)
    return publicData.publicUrl

  } catch (error) {
    console.error('❌ 上传过程出错:', error)
    throw error
  }
}

// 上传项目图片（带进度回调）
export async function uploadProjectImages(
  files: File[], 
  projectId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  console.log(`📸 开始上传 ${files.length} 张项目图片...`)
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      // 模拟进度更新
      if (onProgress) {
        onProgress(index, 0)
      }
      
      const url = await uploadFile(file, 'buildbridge', `projects/${projectId}/images`)
      
      // 上传完成，设置进度为100%
      if (onProgress) {
        onProgress(index, 100)
      }
      
      return url
    } catch (error) {
      console.error(`❌ 图片 ${index} 上传失败:`, error)
      throw error
    }
  })

  try {
    const urls = await Promise.all(uploadPromises)
    console.log(`✅ 成功上传 ${urls.length} 张图片`)
    return urls
  } catch (error) {
    console.error('❌ 批量上传图片失败:', error)
    throw new Error('部分图片上传失败，请重试')
  }
}

// 上传项目视频（带进度回调）
export async function uploadProjectVideo(
  file: File, 
  projectId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log('🎬 开始上传项目视频...')
  
  try {
    // 模拟进度更新
    if (onProgress) {
      onProgress(0)
    }
    
    const url = await uploadFile(file, 'buildbridge', `projects/${projectId}/videos`)
    
    // 上传完成，设置进度为100%
    if (onProgress) {
      onProgress(100)
    }
    
    console.log('✅ 视频上传成功')
    return url
  } catch (error) {
    console.error('❌ 视频上传失败:', error)
    throw error
  }
}

// 删除文件
export async function deleteFile(url: string, bucket: string): Promise<void> {
  try {
    // 从URL中提取文件路径
    const urlParts = url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const bucketIndex = urlParts.findIndex(part => part === bucket)
    
    if (bucketIndex === -1) {
      throw new Error('无法解析文件路径')
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('❌ 文件删除失败:', error)
      throw new Error(`文件删除失败: ${error.message}`)
    }

    console.log(`✅ 文件删除成功: ${fileName}`)
  } catch (error) {
    console.error('❌ 删除过程出错:', error)
    throw error
  }
}

// 验证文件类型
export function validateFile(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
  if (type === 'image') {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: `不支持的图片格式: ${file.type}` }
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: `图片文件过大，最大支持 ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }
    }
  } else if (type === 'video') {
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: `不支持的视频格式: ${file.type}` }
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: `视频文件过大，最大支持 ${MAX_VIDEO_SIZE / 1024 / 1024}MB` }
    }
  }

  return { valid: true }
}

// 获取文件大小的友好显示
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
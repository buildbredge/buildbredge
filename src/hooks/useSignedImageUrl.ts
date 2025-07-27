import { useState, useEffect, useMemo } from 'react'

interface SignedUrlResponse {
  success: boolean
  signedUrl?: string
  error?: string
}

export function useSignedImageUrl(originalUrl: string | null, expiresIn: number = 3600) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!originalUrl) {
      setSignedUrl(null)
      setError(null)
      return
    }

    // 如果已经是有效的HTTP URL且不是Supabase存储URL，直接使用
    if (originalUrl.startsWith('http') && !originalUrl.includes('supabase.co/storage')) {
      setSignedUrl(originalUrl)
      return
    }

    const fetchSignedUrl = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(originalUrl)}&expires=${expiresIn}`)
        const data: SignedUrlResponse = await response.json()

        if (data.success && data.signedUrl) {
          setSignedUrl(data.signedUrl)
        } else {
          throw new Error(data.error || '获取签名URL失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
        // 失败时回退到原始URL
        setSignedUrl(originalUrl)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [originalUrl, expiresIn])

  return { signedUrl, loading, error }
}

// 批量获取签名URL的Hook
export function useSignedImageUrls(originalUrls: string[], expiresIn: number = 3600) {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<(string | null)[]>([])

  // 使用useMemo来稳定数组引用，只有当内容真正改变时才更新
  const stableUrls = useMemo(() => {
    return originalUrls.filter(Boolean) // 过滤掉空值
  }, [originalUrls.join(',')]) // 使用join来比较数组内容

  // 使用另一个useMemo来创建缓存键
  const cacheKey = useMemo(() => {
    return `${stableUrls.join('|')}:${expiresIn}`
  }, [stableUrls.join('|'), expiresIn])

  useEffect(() => {
    if (!stableUrls.length) {
      setSignedUrls([])
      setErrors([])
      setLoading(false)
      return
    }

    let isCancelled = false

    const fetchSignedUrls = async () => {
      if (isCancelled) return
      
      setLoading(true)
      setErrors(new Array(stableUrls.length).fill(null))
      setSignedUrls(new Array(stableUrls.length).fill(null))

      const promises = stableUrls.map(async (url, index) => {
        if (isCancelled || !url) return null

        // 如果已经是有效的HTTP URL且不是Supabase存储URL，直接使用
        if (url.startsWith('http') && !url.includes('supabase.co/storage')) {
          return url
        }

        try {
          const response = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(url)}&expires=${expiresIn}`)
          
          if (isCancelled) return null
          
          const data: SignedUrlResponse = await response.json()

          if (data.success && data.signedUrl) {
            return data.signedUrl
          } else {
            throw new Error(data.error || '获取签名URL失败')
          }
        } catch (err) {
          if (isCancelled) return null
          
          setErrors(prev => {
            if (isCancelled) return prev
            const newErrors = [...prev]
            newErrors[index] = err instanceof Error ? err.message : '未知错误'
            return newErrors
          })
          // 失败时回退到原始URL
          return url
        }
      })

      try {
        const results = await Promise.all(promises)
        if (!isCancelled) {
          setSignedUrls(results)
        }
      } catch (err) {
        // 静默处理批量错误
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchSignedUrls()

    // 清理函数
    return () => {
      isCancelled = true
    }
  }, [cacheKey]) // 只依赖于缓存键

  return { signedUrls, loading, errors }
}
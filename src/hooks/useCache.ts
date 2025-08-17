import { useCallback } from 'react'

import { clearCache, getCacheStats, invalidateCache } from '@/src/api/cache/cache-manager'

export function useCache() {
  const clearAllCache = useCallback(() => {
    clearCache()
  }, [])

  const invalidateCacheByUrl = useCallback((url?: string) => {
    invalidateCache(url)
  }, [])

  const getStats = useCallback(() => getCacheStats(), [])

  return {
    clearAllCache,
    invalidateCacheByUrl,
    getStats,
  }
}

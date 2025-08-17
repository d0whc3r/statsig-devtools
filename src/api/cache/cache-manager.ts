import { Logger } from '../../utils/logger'

// In-memory cache for fast requests
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

const logger = new Logger('CacheManager')

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL in milliseconds (5 minutes)
  defaultTTL: 5 * 60 * 1000,
  // TTL for data that changes infrequently (1 hour)
  longTTL: 60 * 60 * 1000,
  // TTL for critical requests (30 seconds)
  shortTTL: 30 * 1000,
  // Maximum memory cache size
  maxMemoryCacheSize: 100,
}

// Function to generate cache key
function generateCacheKey(url: string, method: string, body?: any): string {
  const bodyHash = body ? JSON.stringify(body) : ''
  return `${method}:${url}:${bodyHash}`
}

// Function to clean up expired cache
function cleanupExpiredCache() {
  const now = Date.now()
  let cleanedCount = 0

  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      memoryCache.delete(key)
      cleanedCount++
    }
  }

  // Clean cache if it exceeds maximum size
  if (memoryCache.size > CACHE_CONFIG.maxMemoryCacheSize) {
    const entries = Array.from(memoryCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, Math.floor(CACHE_CONFIG.maxMemoryCacheSize / 2))
    toDelete.forEach(([key]) => memoryCache.delete(key))
    cleanedCount += toDelete.length
  }

  if (cleanedCount > 0) {
    logger.info('Cleaned expired cache entries', { cleanedCount, remainingSize: memoryCache.size })
  }
}

// Function to determine TTL based on URL
function getTTLForRequest(url: string, method: string): number {
  // Read-only requests can be cached longer
  if (method === 'GET') {
    // Data that changes infrequently (gates, experiments, configs)
    if (url.includes('/gates') || url.includes('/experiments') || url.includes('/dynamic-configs')) {
      logger.debug('Using long TTL for data endpoint', { url, ttl: CACHE_CONFIG.longTTL })
      return CACHE_CONFIG.longTTL
    }
    // Data that changes more frequently
    logger.debug('Using default TTL for endpoint', { url, ttl: CACHE_CONFIG.defaultTTL })
    return CACHE_CONFIG.defaultTTL
  }

  // Write requests are not cached
  return 0
}

// Function to invalidate related cache
function invalidateRelatedCache(url: string) {
  const basePath = url.split('?')[0]
  let invalidatedCount = 0

  for (const [key] of memoryCache.entries()) {
    if (basePath && key.includes(basePath)) {
      memoryCache.delete(key)
      invalidatedCount++
    }
  }

  if (invalidatedCount > 0) {
    logger.info('Invalidated related cache entries', { url, invalidatedCount })
  }
}

// Function to invalidate cache for specific data types
export function invalidateDataCache(dataType: 'gates' | 'experiments' | 'dynamic-configs' | 'all'): void {
  let invalidatedCount = 0

  for (const [key] of memoryCache.entries()) {
    let shouldInvalidate = false

    switch (dataType) {
      case 'gates':
        shouldInvalidate = key.includes('/gates')
        break
      case 'experiments':
        shouldInvalidate = key.includes('/experiments')
        break
      case 'dynamic-configs':
        shouldInvalidate = key.includes('/dynamic-configs')
        break
      case 'all':
        shouldInvalidate = key.includes('/gates') || key.includes('/experiments') || key.includes('/dynamic-configs')
        break
    }

    if (shouldInvalidate) {
      memoryCache.delete(key)
      invalidatedCount++
    }
  }

  if (invalidatedCount > 0) {
    logger.info('Invalidated data cache', { dataType, invalidatedCount })
  }
}

// Function to clear all cache
export function clearCache(): void {
  const { size } = memoryCache
  memoryCache.clear()
  logger.info('Cleared all cache', { clearedEntries: size })

  // Also clear Cache API if available
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.includes('statsig-api')) {
          caches.delete(cacheName)
        }
      })
    })
  }
}

// Function to invalidate specific cache
export function invalidateCache(url?: string): void {
  if (url) {
    invalidateRelatedCache(url)
  } else {
    clearCache()
  }
}

// Function to get cache statistics
export function getCacheStats(): { size: number; entries: Array<{ key: string; age: number; ttl: number }> } {
  const now = Date.now()
  const entries = Array.from(memoryCache.entries()).map(([key, value]) => ({
    key,
    age: now - value.timestamp,
    ttl: value.ttl,
  }))

  return {
    size: memoryCache.size,
    entries,
  }
}

// Function to get cached data
export function getCachedData(url: string, method: string, body?: any): any | null {
  const cacheKey = generateCacheKey(url, method, body)
  const cached = memoryCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    logger.debug('Cache hit', { url, cacheKey })
    return cached.data
  }

  if (cached) {
    logger.debug('Cache expired', { url, cacheKey, age: Date.now() - cached.timestamp, ttl: cached.ttl })
  } else {
    logger.debug('Cache miss', { url, cacheKey })
  }

  return null
}

// Function to save data to cache
export function setCachedData(url: string, method: string, data: any, body?: any): void {
  const cacheKey = generateCacheKey(url, method, body)
  const ttl = getTTLForRequest(url, method)

  if (ttl > 0) {
    memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    logger.debug('Cached data', { url, cacheKey, ttl })

    // Clean up expired cache periodically
    if (Math.random() < 0.1) {
      // 10% probability
      cleanupExpiredCache()
    }
  } else {
    logger.debug('Skipping cache for non-cacheable request', { url, method })
  }
}

// Function to check if a URL should be cached
export function shouldCache(url: string, method: string): boolean {
  const should = method === 'GET' && getTTLForRequest(url, method) > 0
  logger.debug('Cache decision', { url, method, should })
  return should
}

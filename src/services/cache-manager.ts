/**
 * Advanced cache manager with TTL, LRU eviction, and memory management
 */

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalEntries: number
  totalSize: number
  maxSize: number
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  maxSize: number // Maximum cache size in bytes
  defaultTtl: number // Default TTL in milliseconds
  maxEntries: number // Maximum number of entries
  cleanupInterval: number // Cleanup interval in milliseconds
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxEntries: 1000,
  cleanupInterval: 60 * 1000, // 1 minute
}

/**
 * Advanced cache manager class
 */
export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig
  private stats = {
    hits: 0,
    misses: 0,
    totalSize: 0,
  }
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startCleanupTimer()
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const entryTtl = ttl ?? this.config.defaultTtl

    // Don't store entries with zero or negative TTL
    if (entryTtl <= 0) {
      return
    }

    const size = this.calculateSize(value)

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)
      if (existingEntry) {
        this.stats.totalSize -= existingEntry.size
      }
    }

    // Check if we need to evict entries
    this.evictIfNeeded(size)

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      ttl: entryTtl,
      accessCount: 0,
      lastAccessed: now,
      size,
    }

    this.cache.set(key, entry)
    this.stats.totalSize += size
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return undefined
    }

    const now = Date.now()

    // Check if entry has expired
    if (now - entry.timestamp >= entry.ttl) {
      this.delete(key)
      this.stats.misses++
      return undefined
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    this.stats.hits++

    return entry.data
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    const now = Date.now()
    if (now - entry.timestamp >= entry.ttl) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)

    if (entry) {
      this.stats.totalSize -= entry.size
      return this.cache.delete(key)
    }

    return false
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear()
    this.stats.totalSize = 0
    this.stats.hits = 0
    this.stats.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalEntries: this.cache.size,
      totalSize: this.stats.totalSize,
      maxSize: this.config.maxSize,
    }
  }

  /**
   * Get or set a value with a factory function
   */
  async getOrSet(key: string, factory: () => Promise<T> | T, ttl?: number): Promise<T> {
    const cached = this.get(key)

    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Memoize a function with caching
   */
  memoize<Args extends unknown[], Return extends T>(
    fn: (...args: Args) => Promise<Return> | Return,
    keyGenerator?: (...args: Args) => string,
    ttl?: number,
  ): (...args: Args) => Promise<Return> {
    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

      return this.getOrSet(key, () => fn(...args), ttl) as Promise<Return>
    }
  }

  /**
   * Calculate the approximate size of a value in bytes
   */
  private calculateSize(value: T): number {
    try {
      const serialized = JSON.stringify(value)
      return new Blob([serialized]).size
    } catch {
      // Fallback for non-serializable values
      return 1024 // 1KB default
    }
  }

  /**
   * Evict entries if cache is too full
   */
  private evictIfNeeded(newEntrySize: number): void {
    // Check size limit
    while (this.stats.totalSize + newEntrySize > this.config.maxSize || this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed()
    }
  }

  /**
   * Evict the least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | undefined
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => this.delete(key))
  }

  /**
   * Start the cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Stop the cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache entries sorted by access frequency
   */
  getEntriesByFrequency(): { key: string; accessCount: number; lastAccessed: number }[] {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
  }

  /**
   * Warm up the cache with predefined data
   */
  warmUp(data: Record<string, T>, ttl?: number): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, ttl)
    })
  }

  /**
   * Export cache data for persistence
   */
  export(): Record<string, { data: T; timestamp: number; ttl: number }> {
    const exported: Record<string, { data: T; timestamp: number; ttl: number }> = {}

    for (const [key, entry] of this.cache.entries()) {
      // Only export non-expired entries
      const now = Date.now()
      if (now - entry.timestamp < entry.ttl) {
        exported[key] = {
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
        }
      }
    }

    return exported
  }

  /**
   * Import cache data from persistence
   */
  import(data: Record<string, { data: T; timestamp: number; ttl: number }>): void {
    const now = Date.now()

    Object.entries(data).forEach(([key, { data, timestamp, ttl }]) => {
      // Only import non-expired entries
      if (now - timestamp < ttl) {
        const remainingTtl = ttl - (now - timestamp)
        this.set(key, data, remainingTtl)
      }
    })
  }
}

/**
 * Global cache instances for different data types
 */
export const configurationCache = new CacheManager({
  maxSize: 5 * 1024 * 1024, // 5MB
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxEntries: 500,
})

export const evaluationCache = new CacheManager({
  maxSize: 2 * 1024 * 1024, // 2MB
  defaultTtl: 1 * 60 * 1000, // 1 minute
  maxEntries: 1000,
})

export const apiResponseCache = new CacheManager({
  maxSize: 3 * 1024 * 1024, // 3MB
  defaultTtl: 2 * 60 * 1000, // 2 minutes
  maxEntries: 200,
})

/**
 * Utility function to create a cached version of an async function
 */
export function createCachedFunction<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  cache: CacheManager<Return>,
  keyGenerator?: (...args: Args) => string,
  ttl?: number,
): (...args: Args) => Promise<Return> {
  return cache.memoize(fn, keyGenerator, ttl)
}

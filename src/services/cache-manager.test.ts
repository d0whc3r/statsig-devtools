import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CacheManager } from './cache-manager'

// Mock setInterval to prevent hanging
vi.mock('global', () => ({
  setInterval: vi.fn(() => 'mock-timer-id'),
  clearInterval: vi.fn(),
}))

describe('CacheManager', () => {
  let cache: CacheManager<string>

  beforeEach(() => {
    vi.clearAllMocks()
    cache = new CacheManager({
      maxSize: 1024, // 1KB for testing
      defaultTtl: 60000, // 1 minute for testing
      maxEntries: 3,
      cleanupInterval: 60000, // 1 minute
    })
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should check if key exists', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should delete keys', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.delete('nonexistent')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
    })
  })

  describe('TTL (Time To Live) functionality', () => {
    it('should handle zero TTL', () => {
      cache.set('key1', 'value1', 0)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should handle negative TTL', () => {
      cache.set('key1', 'value1', -1000)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should store entries with valid TTL', () => {
      cache.set('key1', 'value1', 60000) // 1 minute TTL
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('LRU (Least Recently Used) eviction', () => {
    it('should evict least recently used entries when max entries exceeded', async () => {
      // Fill cache to max capacity (3 entries)
      cache.set('key1', 'value1')
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key2', 'value2')
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key3', 'value3')

      // Access key1 to make it recently used
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.get('key1')

      // Add new entry, should evict key2 (least recently used)
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key4', 'value4')

      expect(cache.get('key1')).toBe('value1') // Still exists
      expect(cache.get('key2')).toBeUndefined() // Evicted
      expect(cache.get('key3')).toBe('value3') // Still exists
      expect(cache.get('key4')).toBe('value4') // New entry
    })

    it('should update access time when retrieving values', async () => {
      cache.set('key1', 'value1')
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key2', 'value2')
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key3', 'value3')

      // Access key1 to make it recently used
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.get('key1')

      // Add new entry
      await new Promise((resolve) => setTimeout(resolve, 1)) // 1ms delay
      cache.set('key4', 'value4')

      // key2 should be evicted (oldest access time)
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('memory management', () => {
    it('should track total cache size', () => {
      cache.set('small', 'a') // Small value
      cache.set('large', 'a'.repeat(100)) // Larger value

      const stats = cache.getStats()
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.totalEntries).toBe(2)
    })

    it('should update size when entries are deleted', () => {
      cache.set('key1', 'value1')
      const statsAfterSet = cache.getStats()

      cache.delete('key1')
      const statsAfterDelete = cache.getStats()

      expect(statsAfterDelete.totalSize).toBeLessThan(statsAfterSet.totalSize)
      expect(statsAfterDelete.totalEntries).toBe(0)
    })
  })

  describe('statistics and monitoring', () => {
    it('should track hit and miss statistics', () => {
      cache.set('key1', 'value1')

      // Generate hits
      cache.get('key1')
      cache.get('key1')

      // Generate misses
      cache.get('nonexistent1')
      cache.get('nonexistent2')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBe(0.5)
    })

    it('should handle hit rate calculation with no requests', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should reset statistics when cache is cleared', () => {
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('nonexistent')

      cache.clear()
      const stats = cache.getStats()

      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.totalEntries).toBe(0)
      expect(stats.totalSize).toBe(0)
    })
  })

  describe('advanced features', () => {
    it('should implement getOrSet pattern', async () => {
      let factoryCalled = false
      const factory = vi.fn(() => {
        factoryCalled = true
        return Promise.resolve('computed-value')
      })

      // First call should invoke factory
      const result1 = await cache.getOrSet('key1', factory)
      expect(result1).toBe('computed-value')
      expect(factoryCalled).toBe(true)
      expect(factory).toHaveBeenCalledTimes(1)

      // Second call should use cached value
      factoryCalled = false
      const result2 = await cache.getOrSet('key1', factory)
      expect(result2).toBe('computed-value')
      expect(factoryCalled).toBe(false)
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should memoize functions', async () => {
      const expensiveFunction = vi.fn((x: number, y: number) => Promise.resolve((x + y).toString()))

      const memoized = cache.memoize(expensiveFunction)

      // First call
      const result1 = await memoized(1, 2)
      expect(result1).toBe('3')
      expect(expensiveFunction).toHaveBeenCalledTimes(1)

      // Second call with same args should use cache
      const result2 = await memoized(1, 2)
      expect(result2).toBe('3')
      expect(expensiveFunction).toHaveBeenCalledTimes(1)

      // Different args should call function again
      const result3 = await memoized(2, 3)
      expect(result3).toBe('5')
      expect(expensiveFunction).toHaveBeenCalledTimes(2)
    })

    it('should use custom key generator for memoization', async () => {
      const fn = vi.fn((obj: { id: number; name: string }) => Promise.resolve(`${obj.id}-${obj.name}`))

      const keyGenerator = (obj: { id: number; name: string }) => `user-${obj.id}`
      const memoized = cache.memoize(fn, keyGenerator)

      await memoized({ id: 1, name: 'Alice' })
      await memoized({ id: 1, name: 'Bob' }) // Same ID, different name

      // Should only call function once due to same key
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should warm up cache with predefined data', () => {
      const warmupData = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      }

      cache.warmUp(warmupData, 60000)

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('should export and import cache data', () => {
      cache.set('key1', 'value1', 60000)
      cache.set('key2', 'value2', 60000)

      const exported = cache.export()
      expect(exported).toHaveProperty('key1')
      expect(exported).toHaveProperty('key2')

      const newCache = new CacheManager<string>()
      newCache.import(exported)

      expect(newCache.get('key1')).toBe('value1')
      expect(newCache.get('key2')).toBe('value2')

      newCache.destroy()
    })

    it('should not import expired entries', () => {
      const pastTimestamp = Date.now() - 10000 // 10 seconds ago
      const expiredData = {
        key1: {
          data: 'value1',
          timestamp: pastTimestamp,
          ttl: 1000, // 1 second TTL (already expired)
        },
      }

      cache.import(expiredData)
      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('utility methods', () => {
    it('should return all cache keys', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })

    it('should return entries sorted by access frequency', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // Access key2 multiple times
      cache.get('key2')
      cache.get('key2')
      cache.get('key1')

      const entries = cache.getEntriesByFrequency()
      expect(entries[0].key).toBe('key2') // Most accessed
      expect(entries[0].accessCount).toBe(2)
      expect(entries[1].key).toBe('key1')
      expect(entries[1].accessCount).toBe(1)
      expect(entries[2].key).toBe('key3')
      expect(entries[2].accessCount).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle setting same key multiple times', () => {
      cache.set('key1', 'value1')
      cache.set('key1', 'value2') // Overwrite

      expect(cache.get('key1')).toBe('value2')
      expect(cache.getStats().totalEntries).toBe(1)
    })

    it('should handle non-serializable values gracefully', () => {
      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj // Create circular reference

      // Should not throw error
      expect(() => cache.set('circular', circularObj)).not.toThrow()
      expect(cache.get('circular')).toBe(circularObj)
    })
  })

  describe('cleanup functionality', () => {
    it('should stop cleanup timer when destroyed', () => {
      const spy = vi.spyOn(global, 'clearInterval')
      cache.destroy()
      expect(spy).toHaveBeenCalled()
    })
  })
})

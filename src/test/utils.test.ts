import { describe, expect, it } from 'vitest'

import { formatTimestamp, isValidStatsigKey, parseStatsigUrl } from '../utils'

describe('Utils', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = 1640995200000 // 2022-01-01 00:00:00 UTC
      const result = formatTimestamp(timestamp)
      expect(result).toContain('2022')
    })
  })

  describe('isValidStatsigKey', () => {
    it('should validate correct Statsig key', () => {
      const validKey = 'client-abcdefghijklmnopqrstuvwxyz'
      expect(isValidStatsigKey(validKey)).toBe(true)
    })

    it('should reject invalid Statsig key', () => {
      const invalidKey = 'invalid-key'
      expect(isValidStatsigKey(invalidKey)).toBe(false)
    })

    it('should reject short client key', () => {
      const shortKey = 'client-short'
      expect(isValidStatsigKey(shortKey)).toBe(false)
    })
  })

  describe('parseStatsigUrl', () => {
    it('should parse valid Statsig URL', () => {
      const url = 'https://api.statsig.com/v1/initialize?key=test'
      const result = parseStatsigUrl(url)
      expect(result).toEqual({
        endpoint: '/v1/initialize',
        params: new URLSearchParams('key=test'),
      })
    })

    it('should return null for non-Statsig URL', () => {
      const url = 'https://example.com/test'
      const result = parseStatsigUrl(url)
      expect(result).toBeNull()
    })

    it('should handle invalid URL', () => {
      const url = 'invalid-url'
      const result = parseStatsigUrl(url)
      expect(result).toBeNull()
    })
  })
})

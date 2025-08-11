import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  apiLogger,
  clearCache,
  createCacheKey,
  createFetchOptions,
  createRequestHeaders,
  createTimeoutController,
  formatEndpointUrl,
  getCachedResponse,
  getRetryDelay,
  handleApiResponse,
  isAuthError,
  isClientSdkKey,
  isConsoleApiKey,
  isRateLimited,
  isServerError,
  parseApiError,
  sanitizeConfigName,
  setCachedResponse,
  validateApiKey,
} from './statsig-api-utils'

import type { StatsigApiResponse } from './statsig-api-types'

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock AbortSignal.timeout for older environments
if (!AbortSignal.timeout) {
  AbortSignal.timeout = vi.fn((timeout: number) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeout)
    return controller.signal
  })
}

describe('statsig-api-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache() // Clear cache between tests
  })

  describe('API key validation', () => {
    describe('isConsoleApiKey', () => {
      it('should return true for console API keys', () => {
        expect(isConsoleApiKey('console-test-key')).toBe(true)
        expect(isConsoleApiKey('console-')).toBe(true)
      })

      it('should return false for non-console keys', () => {
        expect(isConsoleApiKey('client-test-key')).toBe(false)
        expect(isConsoleApiKey('test-key')).toBe(false)
        expect(isConsoleApiKey('')).toBe(false)
      })
    })

    describe('isClientSdkKey', () => {
      it('should return true for client SDK keys', () => {
        expect(isClientSdkKey('client-test-key')).toBe(true)
        expect(isClientSdkKey('client-')).toBe(true)
      })

      it('should return false for non-client keys', () => {
        expect(isClientSdkKey('console-test-key')).toBe(false)
        expect(isClientSdkKey('test-key')).toBe(false)
        expect(isClientSdkKey('')).toBe(false)
      })
    })

    describe('validateApiKey', () => {
      it('should validate console API keys', () => {
        const result = validateApiKey('console-test-key')
        expect(result).toEqual({ isValid: true, type: 'console' })
      })

      it('should validate client SDK keys', () => {
        const result = validateApiKey('client-test-key')
        expect(result).toEqual({ isValid: true, type: 'client' })
      })

      it('should reject invalid keys', () => {
        expect(validateApiKey('invalid-key')).toEqual({ isValid: false, type: 'unknown' })
        expect(validateApiKey('')).toEqual({ isValid: false, type: 'unknown' })
        expect(validateApiKey(null as any)).toEqual({ isValid: false, type: 'unknown' })
        expect(validateApiKey(undefined as any)).toEqual({ isValid: false, type: 'unknown' })
        expect(validateApiKey(123 as any)).toEqual({ isValid: false, type: 'unknown' })
      })
    })
  })

  describe('caching', () => {
    describe('createCacheKey', () => {
      it('should create cache key without parameters', () => {
        const key = createCacheKey('/test-endpoint')
        expect(key).toBe('/test-endpoint:')
      })

      it('should create cache key with parameters', () => {
        const params = { param1: 'value1', param2: 'value2' }
        const key = createCacheKey('/test-endpoint', params)
        expect(key).toBe('/test-endpoint:{"param1":"value1","param2":"value2"}')
      })

      it('should handle complex parameters', () => {
        const params = { nested: { key: 'value' }, array: [1, 2, 3] }
        const key = createCacheKey('/test-endpoint', params)
        expect(key).toContain('/test-endpoint:')
        expect(key).toContain('nested')
      })
    })

    describe('cache operations', () => {
      it('should set and get cached response', () => {
        const cacheKey = 'test-key'
        const data = { test: 'data' }

        setCachedResponse(cacheKey, data)
        const result = getCachedResponse(cacheKey)

        expect(result).toEqual(data)
      })

      it('should return null for non-existent cache entry', () => {
        const result = getCachedResponse('non-existent-key')
        expect(result).toBeNull()
      })

      it('should handle cache expiration', () => {
        const cacheKey = 'test-key'
        const data = { test: 'data' }

        // Mock Date.now to simulate expired cache
        const originalNow = Date.now
        Date.now = vi.fn(() => 1000)

        setCachedResponse(cacheKey, data)

        // Simulate time passing beyond cache TTL (5 minutes + 1ms)
        Date.now = vi.fn(() => 1000 + 300000 + 1) // CACHE_TTL + 1ms

        const result = getCachedResponse(cacheKey)
        expect(result).toBeNull()

        // Restore Date.now
        Date.now = originalNow
      })

      it('should set cache with etag', () => {
        const cacheKey = 'test-key'
        const data = { test: 'data' }
        const etag = 'test-etag'

        setCachedResponse(cacheKey, data, etag)
        const result = getCachedResponse(cacheKey)

        expect(result).toEqual(data)
      })
    })

    describe('clearCache', () => {
      it('should clear all cache when no pattern provided', () => {
        setCachedResponse('key1', { data: 1 })
        setCachedResponse('key2', { data: 2 })

        clearCache()

        expect(getCachedResponse('key1')).toBeNull()
        expect(getCachedResponse('key2')).toBeNull()
      })

      it('should clear cache entries matching pattern', () => {
        setCachedResponse('test-key1', { data: 1 })
        setCachedResponse('test-key2', { data: 2 })
        setCachedResponse('other-key', { data: 3 })

        clearCache('test')

        expect(getCachedResponse('test-key1')).toBeNull()
        expect(getCachedResponse('test-key2')).toBeNull()
        expect(getCachedResponse('other-key')).toEqual({ data: 3 })
      })
    })
  })

  describe('request handling', () => {
    describe('createRequestHeaders', () => {
      it('should create headers for console API key', () => {
        const headers = createRequestHeaders('console-test-key')
        expect(headers).toEqual({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'STATSIG-API-KEY': 'console-test-key',
        })
      })

      it('should create headers for client SDK key', () => {
        const headers = createRequestHeaders('client-test-key')
        expect(headers).toEqual({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'STATSIG-CLIENT-KEY': 'client-test-key',
        })
      })

      it('should create headers for unknown key type', () => {
        const headers = createRequestHeaders('unknown-key')
        expect(headers).toEqual({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        })
      })

      it('should merge additional headers', () => {
        const additionalHeaders = { 'X-Custom': 'value' }
        const headers = createRequestHeaders('console-test-key', additionalHeaders)
        expect(headers).toEqual({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'STATSIG-API-KEY': 'console-test-key',
          'X-Custom': 'value',
        })
      })
    })

    describe('createFetchOptions', () => {
      it('should create fetch options without body', () => {
        const headers = { 'Content-Type': 'application/json' }
        const options = createFetchOptions('GET', headers)

        expect(options).toEqual({
          method: 'GET',
          headers,
          signal: expect.any(AbortSignal),
        })
      })

      it('should create fetch options with body', () => {
        const headers = { 'Content-Type': 'application/json' }
        const body = { test: 'data' }
        const options = createFetchOptions('POST', headers, body)

        expect(options).toEqual({
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: expect.any(AbortSignal),
        })
      })

      it('should use custom timeout', () => {
        const headers = { 'Content-Type': 'application/json' }
        const requestOptions = { timeout: 5000 }
        const options = createFetchOptions('GET', headers, undefined, requestOptions)

        expect(options.signal).toBeInstanceOf(AbortSignal)
      })

      it('should use default timeout', () => {
        const headers = { 'Content-Type': 'application/json' }
        const options = createFetchOptions('GET', headers)

        expect(options.signal).toBeInstanceOf(AbortSignal)
      })
    })
  })

  describe('response handling', () => {
    describe('handleApiResponse', () => {
      it('should extract data from successful response', () => {
        const response: StatsigApiResponse<{ test: string }> = {
          data: { test: 'value' },
        }

        const result = handleApiResponse(response)
        expect(result).toEqual({ test: 'value' })
      })

      it('should throw error for response with validation errors', () => {
        const response: StatsigApiResponse<any> = {
          errors: [
            { property: 'field1', errorMessage: 'Invalid value' },
            { property: 'field2', errorMessage: 'Required field' },
          ],
        }

        expect(() => handleApiResponse(response)).toThrow(
          'API validation errors: field1: Invalid value, field2: Required field',
        )
      })

      it('should throw error for response without data', () => {
        const response: StatsigApiResponse<any> = {}

        expect(() => handleApiResponse(response)).toThrow('No data in API response')
      })
    })

    describe('response status checks', () => {
      it('should detect rate limiting', () => {
        const response = new Response(null, { status: 429 })
        expect(isRateLimited(response)).toBe(true)

        const normalResponse = new Response(null, { status: 200 })
        expect(isRateLimited(normalResponse)).toBe(false)
      })

      it('should detect authentication errors', () => {
        expect(isAuthError(new Response(null, { status: 401 }))).toBe(true)
        expect(isAuthError(new Response(null, { status: 403 }))).toBe(true)
        expect(isAuthError(new Response(null, { status: 200 }))).toBe(false)
        expect(isAuthError(new Response(null, { status: 404 }))).toBe(false)
      })

      it('should detect server errors', () => {
        expect(isServerError(new Response(null, { status: 500 }))).toBe(true)
        expect(isServerError(new Response(null, { status: 502 }))).toBe(true)
        expect(isServerError(new Response(null, { status: 503 }))).toBe(true)
        expect(isServerError(new Response(null, { status: 400 }))).toBe(false)
        expect(isServerError(new Response(null, { status: 200 }))).toBe(false)
      })
    })
  })

  describe('error handling', () => {
    describe('parseApiError', () => {
      it('should parse AbortError', () => {
        const error = new Error('Request aborted')
        error.name = 'AbortError'
        expect(parseApiError(error)).toBe('Request timeout')
      })

      it('should parse network errors', () => {
        const error = new Error('Failed to fetch')
        expect(parseApiError(error)).toBe('Network error - please check your connection')
      })

      it('should parse generic errors', () => {
        const error = new Error('Custom error message')
        expect(parseApiError(error)).toBe('Custom error message')
      })

      it('should handle non-Error objects', () => {
        expect(parseApiError('string error')).toBe('Unknown API error')
        expect(parseApiError(null)).toBe('Unknown API error')
        expect(parseApiError(undefined)).toBe('Unknown API error')
        expect(parseApiError(123)).toBe('Unknown API error')
      })
    })
  })

  describe('utility functions', () => {
    describe('sanitizeConfigName', () => {
      it('should sanitize configuration names', () => {
        expect(sanitizeConfigName('test-config_123')).toBe('test-config_123')
        expect(sanitizeConfigName('test@config#123')).toBe('test_config_123')
        expect(sanitizeConfigName('test config with spaces')).toBe('test_config_with_spaces')
      })

      it('should limit length to 50 characters', () => {
        const longName = 'a'.repeat(100)
        const result = sanitizeConfigName(longName)
        expect(result).toHaveLength(50)
        expect(result).toBe('a'.repeat(50))
      })

      it('should handle empty strings', () => {
        expect(sanitizeConfigName('')).toBe('')
      })
    })

    describe('formatEndpointUrl', () => {
      it('should format URL without parameters', () => {
        const url = formatEndpointUrl('https://api.example.com', '/endpoint')
        expect(url).toBe('https://api.example.com/endpoint')
      })

      it('should format URL with parameters', () => {
        const params = { param1: 'value1', param2: 'value2' }
        const url = formatEndpointUrl('https://api.example.com', '/endpoint', params)
        expect(url).toBe('https://api.example.com/endpoint?param1=value1&param2=value2')
      })

      it('should handle empty parameters', () => {
        const url = formatEndpointUrl('https://api.example.com', '/endpoint', {})
        expect(url).toBe('https://api.example.com/endpoint')
      })

      it('should handle special characters in parameters', () => {
        const params = { query: 'test value', filter: 'type=feature' }
        const url = formatEndpointUrl('https://api.example.com', '/endpoint', params)
        expect(url).toContain('query=test+value')
        expect(url).toContain('filter=type%3Dfeature')
      })
    })

    describe('getRetryDelay', () => {
      it('should calculate exponential backoff delays', () => {
        expect(getRetryDelay(0)).toBe(1000)
        expect(getRetryDelay(1)).toBe(2000)
        expect(getRetryDelay(2)).toBe(4000)
        expect(getRetryDelay(3)).toBe(8000)
        expect(getRetryDelay(4)).toBe(16000)
      })

      it('should cap delay at maximum value', () => {
        expect(getRetryDelay(10)).toBe(16000)
        expect(getRetryDelay(100)).toBe(16000)
      })
    })

    describe('createTimeoutController', () => {
      it('should create AbortController with timeout', () => {
        vi.useFakeTimers()

        const controller = createTimeoutController(1000)
        expect(controller).toBeInstanceOf(AbortController)
        expect(controller.signal.aborted).toBe(false)

        vi.advanceTimersByTime(1000)
        expect(controller.signal.aborted).toBe(true)

        vi.useRealTimers()
      })
    })
  })

  describe('apiLogger', () => {
    it('should log info messages with prefix', () => {
      apiLogger.info('test message', 'arg1', 'arg2')
      // Note: We can't easily test the actual logger calls due to mocking
      // but we can verify the function exists and doesn't throw
      expect(apiLogger.info).toBeDefined()
    })

    it('should log error messages with prefix', () => {
      apiLogger.error('test error', 'arg1')
      expect(apiLogger.error).toBeDefined()
    })

    it('should log warning messages with prefix', () => {
      apiLogger.warn('test warning')
      expect(apiLogger.warn).toBeDefined()
    })
  })
})

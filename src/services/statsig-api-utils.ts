/**
 * Utility functions for Statsig API
 */

import { logger } from '../utils/logger'
import {
  CACHE_TTL,
  type CacheEntry,
  REQUEST_TIMEOUT,
  type RequestOptions,
  type StatsigApiResponse,
} from './statsig-api-types'

/**
 * Simple in-memory cache for API responses
 */
const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Logger utility for API operations
 */
export const apiLogger = {
  info: (message: string, ...args: string[]) => logger.log(`[Statsig API] ${message}`, ...args),
  error: (message: string, ...args: string[]) => logger.error(`[Statsig API] ${message}`, ...args),
  warn: (message: string, ...args: string[]) => logger.warn(`[Statsig API] ${message}`, ...args),
}

/**
 * Check if API key is a Console API key (starts with 'console-')
 */
export function isConsoleApiKey(apiKey: string): boolean {
  return apiKey.startsWith('console-')
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): { isValid: boolean; type: 'console' | 'client' | 'unknown' } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, type: 'unknown' }
  }

  if (isConsoleApiKey(apiKey)) {
    return { isValid: true, type: 'console' }
  }

  return { isValid: false, type: 'unknown' }
}

/**
 * Create cache key for API requests
 */
export function createCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const paramString = params ? JSON.stringify(params) : ''
  return `${endpoint}:${paramString}`
}

/**
 * Get cached response if valid
 */
export function getCachedResponse<T>(cacheKey: string): T | null {
  const entry = cache.get(cacheKey) as CacheEntry<T> | undefined
  if (!entry) {
    return null
  }

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL
  if (isExpired) {
    cache.delete(cacheKey)
    return null
  }

  return entry.data
}

/**
 * Set cached response
 */
export function setCachedResponse<T>(cacheKey: string, data: T, etag?: string): void {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    etag,
  })
}

/**
 * Clear cache entries
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

/**
 * Create request headers for API calls
 */
export function createRequestHeaders(
  apiKey: string,
  additionalHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (isConsoleApiKey(apiKey)) {
    headers['STATSIG-API-KEY'] = apiKey
  }

  return { ...headers, ...additionalHeaders }
}

/**
 * Handle API response and extract data
 */
export function handleApiResponse<T>(response: StatsigApiResponse<T>): T {
  if (response.errors && response.errors.length > 0) {
    const errorMessages = response.errors.map((err) => `${err.property}: ${err.errorMessage}`).join(', ')
    throw new Error(`API validation errors: ${errorMessages}`)
  }

  if (!response.data) {
    throw new Error('No data in API response')
  }

  return response.data
}

/**
 * Create fetch options for API requests
 */
export function createFetchOptions(
  method: string,
  headers: Record<string, string>,
  body?: unknown,
  options?: RequestOptions,
): RequestInit {
  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(options?.timeout || REQUEST_TIMEOUT),
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body)
  }

  return fetchOptions
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'Request timeout'
    }
    if (error.message.includes('Failed to fetch')) {
      return 'Network error - please check your connection'
    }
    return error.message
  }
  return 'Unknown API error'
}

/**
 * Sanitize configuration name for logging
 */
export function sanitizeConfigName(name: string): string {
  // Remove potentially sensitive information
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)
}

/**
 * Format API endpoint URL
 */
export function formatEndpointUrl(baseUrl: string, endpoint: string, params?: Record<string, string>): string {
  let url = `${baseUrl}${endpoint}`

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  return url
}

/**
 * Check if response indicates rate limiting
 */
export function isRateLimited(response: Response): boolean {
  return response.status === 429
}

/**
 * Check if response indicates authentication error
 */
export function isAuthError(response: Response): boolean {
  return response.status === 401 || response.status === 403
}

/**
 * Check if response indicates server error
 */
export function isServerError(response: Response): boolean {
  return response.status >= 500
}

/**
 * Get retry delay for failed requests
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000)
}

/**
 * Create an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}

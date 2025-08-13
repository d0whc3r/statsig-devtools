/**
 * Centralized HTTP client for all API calls
 * Provides type-safe methods with generic templates for different endpoints
 */

import { BrowserRuntime } from '../utils/browser-api'
import { logger } from '../utils/logger'
import { withRetry } from './retry-manager'

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Base API configuration
 */
export interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  cache?: {
    enabled: boolean
    ttl: number // Time to live in milliseconds
    cacheName: string
  }
}

/**
 * Request configuration for individual calls
 */
export interface RequestConfig {
  timeout?: number
  retries?: number
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
  body?: string
  method?: string
  forceRefresh?: boolean // Skip cache and force fresh request
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  errors?: Array<{
    property: string
    errorMessage: string
  }>
  has_updates?: boolean
  time?: number
  success?: boolean
}

/**
 * HTTP error with additional context
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown,
    public url?: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/**
 * Centralized HTTP client class
 */
export class HttpClient {
  private config: ApiConfig
  private cache?: Cache

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 5000,
      retries: 3,
      ...config,
      cache: {
        enabled: false,
        ttl: 5 * 60 * 1000, // 5 minutes default
        cacheName: 'statsig-http-cache',
        ...config.cache
      }
    }
    this.initializeCache()
  }

  /**
   * Initialize browser cache if enabled
   */
  private async initializeCache(): Promise<void> {
    if (this.config.cache?.enabled && typeof window !== 'undefined' && 'caches' in window) {
      try {
        this.cache = await window.caches.open(this.config.cache.cacheName)
      } catch (error) {
        logger.warn('Failed to initialize cache, continuing without cache', String(error))
      }
    }
  }

  /**
   * Update client configuration
   */
  updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates }
    
    // Reinitialize cache if cache config changed
    if (updates.cache) {
      this.initializeCache()
    }
  }

  /**
   * Get extension version for user agent
   */
  private getExtensionVersion(): string {
    try {
      const manifest = BrowserRuntime.getManifest()
      return manifest.version || '1.0.0'
    } catch {
      return '1.0.0'
    }
  }

  /**
   * Create request headers
   */
  private createHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `Statsig-DevTools/${this.getExtensionVersion()}`,
      ...this.config.headers,
      ...additionalHeaders,
    }

    if (this.config.apiKey) {
      headers['STATSIG-API-KEY'] = this.config.apiKey
    }

    return headers
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseUrl)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  /**
   * Get cached response if valid
   */
  private async getCachedResponse<T>(url: string): Promise<ApiResponse<T> | null> {
    if (!this.cache) return null

    try {
      const cachedResponse = await this.cache.match(url)
      if (!cachedResponse) return null

      const cacheData = await cachedResponse.json()
      const now = Date.now()
      
      // Check if cache is still valid
      if (cacheData.timestamp && (now - cacheData.timestamp) < (this.config.cache?.ttl || 0)) {
        return cacheData.response
      }

      // Cache expired, remove it
      await this.cache.delete(url)
      return null
    } catch (error) {
      logger.warn(`Failed to read cache for ${url}`, String(error))
      return null
    }
  }

  /**
   * Store response in cache with timestamp
   */
  private async setCachedResponse<T>(url: string, response: ApiResponse<T>): Promise<void> {
    if (!this.cache) return

    try {
      const cacheData = {
        response,
        timestamp: Date.now()
      }

      const cacheResponse = new Response(JSON.stringify(cacheData), {
        headers: { 'Content-Type': 'application/json' }
      })

      await this.cache.put(url, cacheResponse)
      logger.info(`Cached response for: ${url}`)
    } catch (error) {
      logger.warn(`Failed to cache response for ${url}`, String(error))
    }
  }

  /**
   * Clear all cached responses
   */
  async clearCache(): Promise<void> {
    if (!this.cache) return

    try {
      const keys = await this.cache.keys()
      await Promise.all(keys.map(key => this.cache!.delete(key)))
      logger.info('Cache cleared successfully')
    } catch (error) {
      logger.warn('Failed to clear cache', String(error))
    }
  }

  /**
   * Execute HTTP request with cache support, retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestConfig,
    retries = this.config.retries || 3
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET'
    
    // Only cache GET requests
    if (method === 'GET' && this.config.cache?.enabled && !options.forceRefresh) {
      const cachedResponse = await this.getCachedResponse<T>(url)
      if (cachedResponse) {
         logger.info(`Cache hit for: ${url}`)
         return cachedResponse
       }
    }

    const controller = new AbortController()
    const timeout = options.timeout || this.config.timeout || 5000

    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await withRetry(
        async () => {
          const fetchOptions: RequestInit = {
            method: options.method,
            headers: options.headers,
            body: options.body,
            signal: controller.signal,
          }
          
          const result = await fetch(url, fetchOptions)

          if (!result.ok) {
            throw new HttpError(
              `HTTP ${result.status}: ${result.statusText}`,
              result.status,
              await result.text().catch(() => null),
              url
            )
          }

          return result
        },
        { maxRetries: retries }
      )

      const contentType = response.headers.get('content-type')
      let data: T | undefined

      if (contentType?.includes('application/json')) {
        const jsonResponse = await response.json()
        data = jsonResponse.data || jsonResponse
      } else {
        data = (await response.text()) as unknown as T
      }

      const apiResponse: ApiResponse<T> = {
        data,
        success: true,
      }

      // Cache successful GET requests
      if (method === 'GET' && this.cache && this.config.cache?.enabled) {
        await this.setCachedResponse(url, apiResponse)
      }

      return apiResponse
    } catch (error) {
      logger.error(`HTTP request failed: ${url}`, String(error))
      
      if (error instanceof HttpError) {
        throw error
      }
      
      throw new HttpError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        error,
        url
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Generic GET request
   */
  async get<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.createHeaders(config?.headers)

    logger.info(`GET ${url}`)

    return this.executeRequest<T>(url, {
      method: 'GET',
      headers,
      timeout: config?.timeout,
      retries: config?.retries,
      params: config?.params,
    }, config?.retries)
  }

  /**
   * Generic POST request
   */
  async post<T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.createHeaders(config?.headers)

    logger.info(`POST ${url}`)

    return this.executeRequest<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: config?.timeout,
      retries: config?.retries,
      params: config?.params,
    }, config?.retries)
  }

  /**
   * Generic PUT request
   */
  async put<T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.createHeaders(config?.headers)

    logger.info(`PUT ${url}`)

    return this.executeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: config?.timeout,
      retries: config?.retries,
      params: config?.params,
    }, config?.retries)
  }

  /**
   * Generic DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.createHeaders(config?.headers)

    logger.info(`DELETE ${url}`)

    return this.executeRequest<T>(url, {
      method: 'DELETE',
      headers,
      timeout: config?.timeout,
      retries: config?.retries,
      params: config?.params,
    }, config?.retries)
  }

  /**
   * Generic PATCH request
   */
  async patch<T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.createHeaders(config?.headers)

    logger.info(`PATCH ${url}`)

    return this.executeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: config?.timeout,
      retries: config?.retries,
      params: config?.params,
    }, config?.retries)
  }
}

/**
 * Factory function to create HTTP clients for different APIs
 */
export function createHttpClient(config: ApiConfig): HttpClient {
  return new HttpClient(config)
}


const CONSOLE_API_VERSION = '20240601'
/**
 * Pre-configured clients for different Statsig APIs
 */
export const consoleApiClient = createHttpClient({
  baseUrl: 'https://statsigapi.net/console/v1',
  headers: {
    'STATSIG-API-VERSION': CONSOLE_API_VERSION,
  },
})



/**
 * Type-safe API endpoint definitions
 */
export interface ApiEndpoints {
  // Console API endpoints
  console: {
    gates: '/gates'
    experiments: '/experiments'
    dynamicConfigs: '/dynamic_configs'
    gateOverrides: (gateName: string) => string
    experimentOverrides: (experimentName: string) => string
    configOverrides: (configName: string) => string
  }
}

/**
 * Endpoint definitions
 */
export const endpoints: ApiEndpoints = {
  console: {
    gates: '/gates',
    experiments: '/experiments',
    dynamicConfigs: '/dynamic_configs',
    gateOverrides: (gateName: string) => `/gates/${gateName}/overrides`,
    experimentOverrides: (experimentName: string) => `/experiments/${experimentName}/overrides`,
    configOverrides: (configName: string) => `/dynamic_configs/${configName}/overrides`,
  },
}
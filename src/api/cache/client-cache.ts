import { client } from '../../client/client.gen'
import { Logger } from '../../utils/logger'
import { clearCache, getCachedData, getCacheStats, setCachedData, shouldCache } from './cache-manager'

const logger = new Logger('ClientCache')

// Flag to track if cache has been initialized
let isCacheInitialized = false

// Request interceptor for cache
async function requestInterceptor(request: Request, _options: any): Promise<Request> {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return request
  }

  // Check if it should be cached
  if (!shouldCache(request.url, request.method)) {
    return request
  }

  logger.info('Checking cache for request', { url: request.url, method: request.method })

  // Try to get data from cache
  const cachedData = getCachedData(request.url, request.method)
  if (cachedData) {
    logger.info('Cache hit', { url: request.url })
    // Create a fake response to indicate there's cache
    const fakeResponse = new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    // Add metadata to request for response interceptor to detect
    ;(request as any).__cachedResponse = fakeResponse
    ;(request as any).__cacheKey = `${request.method}:${request.url}`
  } else {
    logger.info('Cache miss', { url: request.url })
  }

  return request
}

// Response interceptor for cache
async function responseInterceptor(response: Response, request: Request, _options: any): Promise<Response> {
  // If there's a cached response, use it
  if ((request as any).__cachedResponse) {
    logger.info('Returning cached response', { url: request.url })
    return (request as any).__cachedResponse
  }

  // Only cache successful responses
  if (!response.ok || request.method !== 'GET') {
    return response
  }

  // Check if it should be cached
  if (!shouldCache(request.url, request.method)) {
    return response
  }

  try {
    // Clone the response to be able to read it
    const responseClone = response.clone()
    const data = await responseClone.json()

    // Save to cache
    setCachedData(request.url, request.method, data)
    logger.info('Cached response', { url: request.url })
  } catch (error) {
    logger.warn('Error caching response:', error)
  }

  return response
}

// Error interceptor for cache invalidation
async function errorInterceptor(error: any, response: Response, request: Request, _options: any): Promise<any> {
  // If there's an error, we might want to invalidate cache for this endpoint
  if (response.status === 401 || response.status === 403) {
    logger.warn('Authentication error, clearing cache', { url: request.url, status: response.status })
    clearCache()
  }

  return error
}

// Function to configure cache in the client
export function setupClientCache(): void {
  // Prevent multiple initializations
  if (isCacheInitialized) {
    logger.info('Client cache already initialized, skipping setup')
    return
  }

  logger.info('Setting up client cache')

  // Add request and response interceptors
  client.interceptors.request.use(requestInterceptor)
  client.interceptors.response.use(responseInterceptor)
  client.interceptors.error.use(errorInterceptor)

  // Mark as initialized
  isCacheInitialized = true

  logger.info('Client cache setup complete')
}

// Function to reset cache initialization state (useful for testing)
export function resetCacheInitialization(): void {
  isCacheInitialized = false
  logger.info('Cache initialization state reset')
}

// Function to clear cache
export function clearClientCache(): void {
  logger.info('Clearing client cache')
  clearCache()
}

// Function to get cache statistics
export function getClientCacheStats() {
  return getCacheStats()
}

// Function to invalidate cache for specific endpoints
export function invalidateClientCache(url?: string): void {
  if (url) {
    logger.info('Invalidating cache for specific URL', { url })
  } else {
    logger.info('Invalidating all cache')
  }

  // This would need to be implemented in cache-manager
  // For now, we'll clear all cache
  clearCache()
}

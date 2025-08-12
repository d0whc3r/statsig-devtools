/**
 * Types and constants for Statsig API
 */

/**
 * Statsig rule structure
 */
export interface StatsigRule {
  name?: string
  passPercentage?: number
  conditions?: Array<{
    type: string
    targetValue: unknown
    operator: string
    field: string
  }>
  returnValue?: unknown
  id?: string
  salt?: string
  idType?: string
  environments?: string[] | null
}

/**
 * Statsig Console API base URL
 */
export const CONSOLE_API_BASE_URL = 'https://statsigapi.net/console/v1'

/**
 * Statsig Client API base URL
 */
export const CLIENT_API_BASE_URL = 'https://api.statsig.com/v1'

/**
 * Statsig Console API version
 */
export const CONSOLE_API_VERSION = '20240601'

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 5000

/**
 * Cache TTL in milliseconds (5 minutes)
 */
export const CACHE_TTL = 5 * 60 * 1000

/**
 * API response interfaces
 */
export interface StatsigApiResponse<T = unknown> {
  data?: T
  message?: string
  errors?: Array<{
    property: string
    errorMessage: string
  }>
  has_updates?: boolean
  time?: number
}

/**
 * Feature gate response from API
 */
export interface FeatureGateResponse {
  id: string
  name: string
  description?: string
  isEnabled: boolean
  rules: StatsigRule[]
  tags?: string[]
  createdTime?: number
  lastModifierName?: string
  lastModifierID?: string
}

/**
 * Dynamic config response from API
 */
export interface DynamicConfigResponse {
  id: string
  name: string
  description?: string
  isEnabled: boolean
  rules: StatsigRule[]
  defaultValue?: Record<string, unknown>
  tags?: string[]
  createdTime?: number
  lastModifierName?: string
  lastModifierID?: string
}

/**
 * Experiment response from API
 */
export interface ExperimentResponse {
  id: string
  name: string
  description?: string
  isEnabled: boolean
  rules: StatsigRule[]
  groups?: Array<{
    name: string
    size: number
    parameterValues?: Record<string, unknown>
  }>
  tags?: string[]
  createdTime?: number
  lastModifierName?: string
  lastModifierID?: string
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  etag?: string
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  headers?: Record<string, string>
}

import { BrowserRuntime } from '../utils/browser-api'
import { errorHandler } from './error-handler'
import { withRetry } from './retry-manager'
import {
  CACHE_TTL,
  CLIENT_API_BASE_URL,
  CONSOLE_API_BASE_URL,
  CONSOLE_API_VERSION,
  REQUEST_TIMEOUT,
  type StatsigRule,
} from './statsig-api-types'
import { apiLogger, createFetchOptions, createRequestHeaders, formatEndpointUrl } from './statsig-api-utils'

import type { ApiValidationResponse, StatsigConfigurationItem, StatsigConfigurations } from '../types'

/**
 * Get extension version from manifest
 */
function getExtensionVersion(): string {
  try {
    const manifest = BrowserRuntime.getManifest()
    return manifest.version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

/**
 * Cache for storing configuration data
 */
interface CachedData {
  data: StatsigConfigurations
  timestamp: number
}

let configurationCache: CachedData | null = null

/**
 * Validate Console API key by making a test request
 */
export async function validateConsoleApiKey(apiKey: string): Promise<ApiValidationResponse> {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      isValid: false,
      error: 'Console API key is required',
    }
  }

  const headers = createRequestHeaders(apiKey.trim(), {
    'STATSIG-API-VERSION': CONSOLE_API_VERSION,
  })

  try {
    apiLogger.info('Validating Console API key...')

    // Use the /gates endpoint to validate the Console API key
    // This endpoint is basic and should work with standard permissions
    const url = formatEndpointUrl(CONSOLE_API_BASE_URL, '/gates')
    const fetchOptions = createFetchOptions('GET', headers)
    const response = await fetch(url, fetchOptions)

    if (response.ok) {
      await response.json() // Consume response body
      apiLogger.info('Console API key validation successful')

      return {
        isValid: true,
        projectName: 'Statsig Project', // Gates endpoint doesn't return project name
      }
    }

    // Handle specific error codes
    if (response.status === 401) {
      return {
        isValid: false,
        error: 'Invalid Console API key. Please check your credentials.',
      }
    }

    if (response.status === 403) {
      return {
        isValid: false,
        error: 'Console API key does not have sufficient permissions.',
      }
    }

    if (response.status === 404) {
      return {
        isValid: false,
        error: 'API endpoint not found. Please check your API configuration.',
      }
    }

    if (response.status === 429) {
      return {
        isValid: false,
        error: 'Rate limit exceeded. Please wait before trying again.',
      }
    }

    return {
      isValid: false,
      error: `API validation failed with status ${response.status}`,
    }
  } catch (error) {
    apiLogger.error('Console API key validation failed:', error instanceof Error ? error.message : 'Unknown error')

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isValid: false,
          error: 'Request timeout. Please check your internet connection.',
        }
      }

      if (error.message.includes('fetch')) {
        return {
          isValid: false,
          error: 'Network error. Please check your internet connection.',
        }
      }
    }

    return {
      isValid: false,
      error: 'An unexpected error occurred during validation.',
    }
  }
}

/**
 * Validate Client SDK key by making a test request
 * @deprecated This function is no longer used since we only support Console API keys
 */
export async function validateClientSdkKey(apiKey: string): Promise<ApiValidationResponse> {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      isValid: false,
      error: 'Client SDK key is required',
    }
  }

  try {
    apiLogger.info('Validating Client SDK key...')

    // Test the Client SDK key with a minimal initialization request
    const headers = createRequestHeaders(apiKey.trim())
    const body = {
      user: { userID: 'test-validation-user' },
      statsigMetadata: {
        sdkType: 'js-client',
        sdkVersion: getExtensionVersion(),
      },
    }
    const fetchOptions = createFetchOptions('POST', headers, body)
    const url = formatEndpointUrl(CLIENT_API_BASE_URL, '/initialize')
    const response = await fetch(url, fetchOptions)

    if (response.ok) {
      apiLogger.info('Client SDK key validation successful')
      return {
        isValid: true,
      }
    }

    // Handle specific error codes
    if (response.status === 401) {
      return {
        isValid: false,
        error: 'Invalid Client SDK key. Please check your credentials.',
      }
    }

    if (response.status === 403) {
      return {
        isValid: false,
        error: 'Client SDK key does not have sufficient permissions.',
      }
    }

    if (response.status === 429) {
      return {
        isValid: false,
        error: 'Rate limit exceeded. Please wait before trying again.',
      }
    }

    return {
      isValid: false,
      error: `SDK validation failed with status ${response.status}`,
    }
  } catch (error) {
    apiLogger.error('Client SDK key validation failed:', error instanceof Error ? error.message : 'Unknown error')

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isValid: false,
          error: 'Request timeout. Please check your internet connection.',
        }
      }

      if (error.message.includes('fetch')) {
        return {
          isValid: false,
          error: 'Network error. Please check your internet connection.',
        }
      }
    }

    return {
      isValid: false,
      error: 'An unexpected error occurred during validation.',
    }
  }
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(): boolean {
  if (!configurationCache) {
    return false
  }

  const now = Date.now()
  return now - configurationCache.timestamp < CACHE_TTL
}

/**
 * Make a request to the Console API with proper error handling and retry logic
 */
async function makeConsoleApiRequest(endpoint: string, apiKey: string, options: RequestInit = {}): Promise<unknown> {
  return withRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      try {
        const response = await fetch(`${CONSOLE_API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'STATSIG-API-KEY': apiKey.trim(),
            'STATSIG-API-VERSION': CONSOLE_API_VERSION,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = `API request failed with status ${response.status}`

          if (response.status === 401) {
            errorMessage = 'Invalid Console API key'
          } else if (response.status === 403) {
            errorMessage = 'Insufficient permissions'
          } else if (response.status === 429) {
            errorMessage = 'Rate limit exceeded'
          }

          const error = new Error(errorMessage)
          throw errorHandler.handleError(error, `Console API ${endpoint}`)
        }

        return await response.json()
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timeout')
            throw errorHandler.handleError(timeoutError, `Console API ${endpoint}`)
          }
          throw error
        }

        const unknownError = new Error('Unknown API error')
        throw errorHandler.handleError(unknownError, `Console API ${endpoint}`)
      }
    },
    {
      maxRetries: 3,
      baseDelayMs: 1000,
      retryableErrors: ['timeout', 'network', '429', '500', '502', '503', '504'],
      onRetry: (attempt, error) => {
        apiLogger.info(`Retrying Console API request (attempt ${attempt}): ${error.message}`)
      },
    },
  )
}

/**
 * Fetch feature gates from Console API
 */
export async function getFeatureGates(apiKey: string): Promise<StatsigConfigurationItem[]> {
  apiLogger.info('Fetching feature gates from Console API...')

  try {
    const response = (await makeConsoleApiRequest('/gates', apiKey)) as { data?: unknown[] }

    if (!response.data || !Array.isArray(response.data)) {
      apiLogger.error('Invalid feature gates response format')
      return []
    }

    const featureGates: StatsigConfigurationItem[] = response.data.map((gate) => {
      const gateData = gate as Record<string, unknown>

      return {
        id: String(gateData.id || ''),
        name: String(gateData.name || ''),
        type: 'feature_gate' as const,
        enabled: Boolean(gateData.enabled ?? true),
        rules: ((gateData.rules as StatsigRule[]) || []).map((rule) => ({
          ...rule,
          name: rule.name || 'Unnamed Rule',
        })),
        defaultValue: gateData.defaultValue ?? false,
        salt: gateData.salt as string,
        idType: gateData.idType as string,
        entity: gateData.entity as string,
        isActive: Boolean(gateData.isActive),
        hasSharedParams: Boolean(gateData.hasSharedParams),
        targetApps: (gateData.targetApps as string[]) || [],
        lastModifierName: gateData.lastModifierName as string,
        lastModifierID: gateData.lastModifierID as string,
        createdTime: gateData.createdTime as number,
        lastModifiedTime: gateData.lastModifiedTime as number,
      }
    })

    apiLogger.info(`Successfully fetched ${featureGates.length} feature gates`)
    return featureGates
  } catch (error) {
    apiLogger.error('Failed to fetch feature gates:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Fetch experiments from Console API
 */
export async function getExperiments(apiKey: string): Promise<StatsigConfigurationItem[]> {
  apiLogger.info('Fetching experiments from Console API...')

  try {
    const response = (await makeConsoleApiRequest('/experiments', apiKey)) as { data?: unknown[] }

    if (!response.data || !Array.isArray(response.data)) {
      apiLogger.error('Invalid experiments response format')
      return []
    }

    const experiments: StatsigConfigurationItem[] = response.data.map((experiment) => {
      const experimentData = experiment as Record<string, unknown>
      return {
        id: String(experimentData.id || ''),
        name: String(experimentData.name || ''),
        type: 'experiment' as const,
        enabled: Boolean(experimentData.enabled ?? true),
        rules: ((experimentData.rules as StatsigRule[]) || []).map((rule) => ({
          ...rule,
          name: rule.name || 'Unnamed Rule',
          passPercentage: rule.passPercentage || 0,
          conditions: rule.conditions || [],
          environments: rule.environments || null,
        })),
        defaultValue: experimentData.defaultValue,
        salt: experimentData.salt as string,
        idType: experimentData.idType as string,
        entity: experimentData.entity as string,
        isActive: Boolean(experimentData.isActive),
        hasSharedParams: Boolean(experimentData.hasSharedParams),
        targetApps: (experimentData.targetApps as string[]) || [],
        lastModifierName: experimentData.lastModifierName as string,
        lastModifierID: experimentData.lastModifierID as string,
        createdTime: experimentData.createdTime as number,
        lastModifiedTime: experimentData.lastModifiedTime as number,
        groups: ((experimentData.groups as Array<Record<string, unknown>>) || []).map((group) => ({
          name: String(group.name || ''),
          size: Number(group.size || 0),
          parameterValues: group.parameterValues as Record<string, unknown> | undefined,
        })),
      }
    })

    apiLogger.info(`Successfully fetched ${experiments.length} experiments`)
    return experiments
  } catch (error) {
    apiLogger.error('Failed to fetch experiments:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Fetch dynamic configs from Console API
 */
export async function getDynamicConfigs(apiKey: string): Promise<StatsigConfigurationItem[]> {
  apiLogger.info('Fetching dynamic configs from Console API...')

  try {
    const response = (await makeConsoleApiRequest('/dynamic_configs', apiKey)) as { data?: unknown[] }

    if (!response.data || !Array.isArray(response.data)) {
      apiLogger.error('Invalid dynamic configs response format')
      return []
    }

    const dynamicConfigs: StatsigConfigurationItem[] = response.data.map((config) => {
      const configData = config as Record<string, unknown>
      return {
        id: String(configData.id || ''),
        name: String(configData.name || ''),
        type: 'dynamic_config' as const,
        enabled: Boolean(configData.enabled ?? true),
        rules: ((configData.rules as StatsigRule[]) || []).map((rule) => ({
          ...rule,
          name: rule.name || 'Unnamed Rule',
          passPercentage: rule.passPercentage || 0,
          conditions: rule.conditions || [],
          environments: rule.environments || null,
        })),
        defaultValue: configData.defaultValue || {},
        salt: configData.salt as string,
        idType: configData.idType as string,
        entity: configData.entity as string,
        isActive: Boolean(configData.isActive),
        hasSharedParams: Boolean(configData.hasSharedParams),
        targetApps: (configData.targetApps as string[]) || [],
        lastModifierName: configData.lastModifierName as string,
        lastModifierID: configData.lastModifierID as string,
        createdTime: configData.createdTime as number,
        lastModifiedTime: configData.lastModifiedTime as number,
      }
    })

    apiLogger.info(`Successfully fetched ${dynamicConfigs.length} dynamic configs`)
    return dynamicConfigs
  } catch (error) {
    apiLogger.error('Failed to fetch dynamic configs:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Fetch all configurations from Console API with caching
 */
export async function getAllConfigurations(apiKey: string, useCache: boolean = true): Promise<StatsigConfigurations> {
  apiLogger.info('Fetching all configurations from Console API...')

  // Check cache first if enabled
  if (useCache && isCacheValid() && configurationCache) {
    apiLogger.info('Returning cached configurations')
    return configurationCache.data
  }

  try {
    // Fetch all configuration types in parallel
    const [featureGates, experiments, dynamicConfigs] = await Promise.all([
      getFeatureGates(apiKey),
      getExperiments(apiKey),
      getDynamicConfigs(apiKey),
    ])

    const allConfigurations: StatsigConfigurations = [...featureGates, ...experiments, ...dynamicConfigs]

    // Update cache
    configurationCache = {
      data: allConfigurations,
      timestamp: Date.now(),
    }

    apiLogger.info(`Successfully fetched ${allConfigurations.length} total configurations`)
    return allConfigurations
  } catch (error) {
    apiLogger.error('Failed to fetch configurations:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Clear the configuration cache
 */
export function clearConfigurationCache(): void {
  configurationCache = null
  apiLogger.info('Configuration cache cleared')
}

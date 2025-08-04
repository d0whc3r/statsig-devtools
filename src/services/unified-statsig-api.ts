/**
 * Statsig API Service
 * Requires Console API key for listing and evaluating configurations
 */

import { logger } from '../utils/logger'
import { errorHandler } from './error-handler'
import { getAllConfigurations } from './statsig-api'

import type { StatsigConfigurationItem } from '../types'
import type { StatsigClient, StatsigUser } from '@statsig/js-client'

// API Configuration
const REQUEST_TIMEOUT = 10000

export interface ApiValidationResponse {
  isValid: boolean
  error?: string
  projectName?: string
}

/**
 * Interface for secondary exposures
 */
export interface SecondaryExposure {
  gate: string
  gateValue: string
  ruleID: string
}

/**
 * Interface for evaluation details
 */
export interface EvaluationDetails {
  configSyncTime?: number
  initTime?: number
  reason?: string
  [key: string]: unknown
}

export interface EvaluationResult {
  configurationName: string
  type: 'feature_gate' | 'experiment' | 'dynamic_config'
  passed: boolean
  value: unknown
  ruleId?: string
  groupName?: string
  reason?: string
  secondaryExposures?: SecondaryExposure[]
  evaluationDetails?: EvaluationDetails
  debugInfo?: {
    evaluatedRules: unknown[]
    userContext: StatsigUser
    timestamp: string
  }
}

/**
 * Statsig Service - Requires Console API Key
 */
export class UnifiedStatsigService {
  private client: StatsigClient | null = null
  private currentUser: StatsigUser | null = null
  private isInitialized = false
  private consoleApiKey = ''

  /**
   * Validate API key input
   */
  private validateApiKeyInput(apiKey: string): ApiValidationResponse | null {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return {
        isValid: false,
        error: 'API key is required',
      }
    }
    return null
  }

  /**
   * Handle API response status codes
   */
  private handleApiResponse(response: Response): ApiValidationResponse | null {
    if (response.ok) {
      logger.info('✅ API key validation successful')
      return {
        isValid: true,
        projectName: 'Statsig Project',
      }
    }

    let errorMessage = `API validation failed with status ${response.status}`

    switch (response.status) {
      case 401:
        errorMessage = 'Invalid API key. Please verify your Console API key is correct and has not expired.'
        logger.error('❌ Statsig API: 401 Unauthorized - Invalid API key')
        break
      case 403:
        errorMessage = 'API key does not have sufficient permissions. Please check your project access rights.'
        logger.error('❌ Statsig API: 403 Forbidden - Insufficient permissions')
        break
      case 404:
        errorMessage = 'API endpoint not found. Please check your API key format.'
        logger.error('❌ Statsig API: 404 Not Found - Invalid endpoint')
        break
      case 429:
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
        logger.error('❌ Statsig API: 429 Rate Limited')
        break
      case 500:
      case 502:
      case 503:
        errorMessage = 'Statsig server error. Please try again in a few moments.'
        logger.error(`❌ Statsig API: ${response.status} Server Error`)
        break
      default:
        logger.error(`❌ Statsig API: Unexpected status ${response.status}`)
    }

    return {
      isValid: false,
      error: errorMessage,
    }
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: unknown): ApiValidationResponse {
    logger.error('API key validation failed:', error)

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

  /**
   * Validate Console API key (required for this extension)
   */
  async validateApiKey(apiKey: string): Promise<ApiValidationResponse> {
    // Validate input
    const inputValidation = this.validateApiKeyInput(apiKey)
    if (inputValidation) return inputValidation

    // Check if it's a Console API key
    if (!apiKey.startsWith('console-')) {
      return {
        isValid: false,
        error: 'Console API key required. Please use a key that starts with "console-"',
      }
    }

    try {
      // Validate Console API key
      return await this.validateConsoleApiKey(apiKey)
    } catch (error) {
      return this.handleValidationError(error)
    }
  }

  /**
   * Validate Console API key
   */
  private async validateConsoleApiKey(apiKey: string): Promise<ApiValidationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      logger.info('Validating Console API key...')

      // Use GET method like the working legacy service
      const response = await fetch('https://statsigapi.net/console/v1/gates', {
        method: 'GET',
        headers: {
          'STATSIG-API-KEY': apiKey.trim(),
          'STATSIG-API-VERSION': '20240601',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return (
        this.handleApiResponse(response) || {
          isValid: false,
          error: 'Invalid API response',
        }
      )
    } catch (error) {
      clearTimeout(timeoutId)
      return this.handleValidationError(error)
    }
  }

  /**
   * Initialize the service with Console API key
   */
  async initialize(consoleApiKey: string, user?: StatsigUser): Promise<void> {
    logger.info('Initializing Statsig service with Console API key...')

    try {
      this.consoleApiKey = consoleApiKey.trim()
      this.currentUser = user || this.buildDefaultUser()

      // Note: We don't create a StatsigClient here because Console API keys
      // are not compatible with the client SDK endpoints. The Console API key
      // is only used for fetching configuration data via the Console API.
      this.client = null

      // Note: We don't initialize a client SDK because Console API keys
      // are not compatible with client SDK endpoints
      this.isInitialized = true

      logger.info('Statsig Client SDK initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Statsig Client SDK:', error)
      this.cleanup()
      throw new Error(`SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all configurations using Console API
   */
  async getAllConfigurations(): Promise<StatsigConfigurationItem[]> {
    if (!this.consoleApiKey) {
      throw new Error('Console API key not set')
    }

    try {
      logger.info('Fetching configurations with Console API key...')
      return await getAllConfigurations(this.consoleApiKey)
    } catch (error) {
      logger.error('Failed to get configurations:', error)
      throw errorHandler.handleError(error, 'Getting configurations')
    }
  }

  /**
   * Evaluate a feature gate
   */
  async evaluateFeatureGate(gateName: string): Promise<EvaluationResult> {
    // Console API keys don't support client SDK evaluation
    logger.warn('Gate evaluation not available with Console API key. Use Client SDK key for real evaluation.')

    return {
      configurationName: gateName,
      type: 'feature_gate',
      passed: false,
      value: false,
      reason: 'Console API key does not support client evaluation',
      debugInfo: {
        evaluatedRules: [],
        userContext: this.currentUser || {},
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Update user context
   */
  async updateUser(user: StatsigUser): Promise<void> {
    // Just update the local user context since we don't have a client SDK
    this.currentUser = user
    logger.info('User context updated successfully (local only)')
  }

  /**
   * Build default user context
   */
  private buildDefaultUser(): StatsigUser {
    return {
      userID: `extension-user-${Date.now()}`,
      email: 'developer@extension.local',
      custom: {
        source: 'statsig-dev-tools',
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.consoleApiKey !== ''
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.client) {
      this.client.shutdown()
      this.client = null
    }
    this.isInitialized = false
    this.currentUser = null
    this.consoleApiKey = ''
    logger.info('Statsig service cleaned up')
  }
}

// Export singleton instance
export const unifiedStatsigService = new UnifiedStatsigService()

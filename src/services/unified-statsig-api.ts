/**
 * Statsig API Service
 * Requires Console API key for listing and evaluating configurations
 */

import { logger } from '../utils/logger'
import { consoleApiClient, endpoints } from './http-client'
import { apiLogger } from './statsig-api-utils'

import type { ConfigurationRule, StatsigConfigurationItem } from '../types'

/**
 * Statsig User interface (reimplemented without SDK dependency)
 */
export interface StatsigUser {
  userID: string
  email?: string
  ip?: string
  userAgent?: string
  country?: string
  locale?: string
  appVersion?: string
  custom?: Record<string, unknown>
  privateAttributes?: Record<string, unknown>
  customIDs?: Record<string, string>
}

// API Configuration (removed REQUEST_TIMEOUT as it's no longer used)

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
  private currentUser: StatsigUser | null = null
  private isInitialized = false
  private consoleApiKey = ''
  // Single HTTP client is used for all Console API calls

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

  // No separate handleApiResponse; validation handled inline

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

    // Trim the API key for validation
    const trimmedApiKey = apiKey.trim()

    // Check if it's a Console API key
    if (!trimmedApiKey.startsWith('console-')) {
      return {
        isValid: false,
        error: 'Console API key required. Please use a key that starts with "console-"',
      }
    }

    try {
      // Validate Console API key
      return await this.validateConsoleApiKey(trimmedApiKey)
    } catch (error) {
      return this.handleValidationError(error)
    }
  }

  /**
   * Validate Console API key using centralized method
   */
  private async validateConsoleApiKey(apiKey: string): Promise<ApiValidationResponse> {
    try {
      // Do a lightweight request to validate the key
      const originalKey = (consoleApiClient as any).config?.apiKey
      consoleApiClient.updateConfig({ apiKey: apiKey.trim() })
      const response = await consoleApiClient.get(endpoints.console.gates)
      // restore
      consoleApiClient.updateConfig({ apiKey: String(originalKey || '') })
      if (response && response.data) {
        apiLogger.info('Console API key validation successful')
        return { isValid: true, projectName: 'Statsig Project' }
      }
      return { isValid: false, error: 'Invalid API response' }
    } catch (error) {
      return this.handleValidationError(error)
    }
  }

  /**
   * Initialize the service with Console API key
   */
  async initialize(consoleApiKey: string, user?: StatsigUser): Promise<void> {
    logger.info('Initializing Statsig service with Console API key...')

    try {
      // Validate the Console API key first
      const validation = await this.validateApiKey(consoleApiKey)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid Console API key')
      }

      this.consoleApiKey = consoleApiKey.trim()

      // Configure HTTP client with API key
      consoleApiClient.updateConfig({ apiKey: this.consoleApiKey })

      this.currentUser = user || this.buildDefaultUser()
      this.isInitialized = true

      logger.info('Statsig service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Statsig service:', error)
      this.cleanup()
      throw error
    }
  }

  /**
   * Get all configurations using centralized API with caching
   */
  async getAllConfigurations(): Promise<StatsigConfigurationItem[]> {
    if (!this.isInitialized || !this.consoleApiKey) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    try {
      logger.info('Fetching all configurations from Console API...')
      const [gatesResp, expResp, confResp] = await Promise.all([
        consoleApiClient.get(endpoints.console.gates),
        consoleApiClient.get(endpoints.console.experiments),
        consoleApiClient.get(endpoints.console.dynamicConfigs),
      ])

      interface ConsoleGate {
        id: string
        name: string
        isEnabled?: boolean
        enabled?: boolean
        rules?: ConfigurationRule[]
        lastModifierName?: string
        lastModifierID?: string
        createdTime?: number
      }
      interface ConsoleExperiment {
        id: string
        name: string
        isEnabled?: boolean
        enabled?: boolean
        rules?: ConfigurationRule[]
        groups?: { name: string; size: number; parameterValues?: Record<string, unknown> }[]
        lastModifierName?: string
        lastModifierID?: string
        createdTime?: number
      }
      interface ConsoleConfig {
        id: string
        name: string
        isEnabled?: boolean
        enabled?: boolean
        rules?: ConfigurationRule[]
        defaultValue?: unknown
        lastModifierName?: string
        lastModifierID?: string
        createdTime?: number
      }

      const gates: ConsoleGate[] = Array.isArray((gatesResp as { data?: { data?: unknown[] } })?.data?.data)
        ? ((gatesResp as { data?: { data?: unknown[] } }).data?.data as ConsoleGate[])
        : []
      const experiments: ConsoleExperiment[] = Array.isArray((expResp as { data?: { data?: unknown[] } })?.data?.data)
        ? ((expResp as { data?: { data?: unknown[] } }).data?.data as ConsoleExperiment[])
        : []
      const configs: ConsoleConfig[] = Array.isArray((confResp as { data?: { data?: unknown[] } })?.data?.data)
        ? ((confResp as { data?: { data?: unknown[] } }).data?.data as ConsoleConfig[])
        : []

      // Transform to unified configuration format
      const allConfigurations: StatsigConfigurationItem[] = [
        ...gates.map((gate) => ({
          id: gate.id,
          name: gate.name,
          type: 'feature_gate' as const,
          enabled: Boolean(gate.isEnabled ?? gate.enabled ?? true),
          rules: gate.rules || [],
          lastModifierName: gate.lastModifierName,
          lastModifierID: gate.lastModifierID,
          createdTime: gate.createdTime,
        })),
        ...experiments.map((experiment) => ({
          id: experiment.id,
          name: experiment.name,
          type: 'experiment' as const,
          enabled: Boolean(experiment.isEnabled ?? experiment.enabled ?? true),
          rules: experiment.rules || [],
          groups: (experiment.groups || []).map((g) => ({
            name: g.name,
            size: g.size ?? 0,
            parameterValues: g.parameterValues,
          })),
          lastModifierName: experiment.lastModifierName,
          lastModifierID: experiment.lastModifierID,
          createdTime: experiment.createdTime,
        })),
        ...configs.map((config) => ({
          id: config.id,
          name: config.name,
          type: 'dynamic_config' as const,
          enabled: Boolean(config.isEnabled ?? config.enabled ?? true),
          rules: config.rules || [],
          defaultValue: config.defaultValue || {},
          lastModifierName: config.lastModifierName,
          lastModifierID: config.lastModifierID,
          createdTime: config.createdTime,
        })),
      ]

      logger.info(`Retrieved ${allConfigurations.length} configurations`)
      return allConfigurations
    } catch (error) {
      logger.error('Failed to get configurations:', error)
      throw error
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
        userContext: this.currentUser || this.buildDefaultUser(),
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
   * Force refresh configurations by clearing cache
   */
  async refreshConfigurations(): Promise<StatsigConfigurationItem[]> {
    await consoleApiClient.clearCache()
    return this.getAllConfigurations()
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.isInitialized = false
    this.currentUser = null
    this.consoleApiKey = ''
    // best-effort cache clear
    void consoleApiClient.clearCache().catch(() => {})
    logger.info('Statsig service cleaned up')
  }
}

// Export singleton instance
export const unifiedStatsigService = new UnifiedStatsigService()

import { BrowserRuntime } from '../utils/browser-api'
import { logger } from '../utils/logger'

import type { StatsigConfigurationItem } from '../types'
import type { StatsigUser } from '@statsig/js-client'

import { LogLevel, StatsigClient } from '@statsig/js-client'

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

/**
 * Interface for evaluation results
 */
export interface EvaluationResult {
  configurationName: string
  type: 'feature_gate' | 'experiment' | 'dynamic_config'
  passed: boolean
  value?: unknown
  ruleId?: string
  groupName?: string
  reason: string
  secondaryExposures?: SecondaryExposure[]
  evaluationDetails?: EvaluationDetails
  debugInfo?: {
    evaluatedRules: unknown[]
    userContext: StatsigUser
    timestamp: string
  }
}

/**
 * Interface for storage overrides
 */
export interface StorageOverride {
  type: 'cookie' | 'localStorage' | 'sessionStorage'
  key: string
  value: string
  domain?: string
  path?: string
  id?: string // Optional ID for tracking overrides
  featureName?: string // Name of the Statsig feature being overridden
  featureType?: string // Type of feature (feature_gate, dynamic_config, experiment)
}

/**
 * Statsig Integration Service
 * Handles Client SDK initialization and real-time evaluation
 */
export class StatsigIntegrationService {
  private client: StatsigClient | null = null
  private currentUser: StatsigUser | null = null
  private isInitialized = false
  private clientSdkKey = ''

  /**
   * Initialize the Statsig Client SDK
   */
  async initialize(clientSdkKey: string, user?: StatsigUser): Promise<void> {
    logger.info('Initializing Statsig Client SDK...')

    try {
      this.clientSdkKey = clientSdkKey.trim()

      // Check if this is a Console API key (not supported by Client SDK)
      if (this.clientSdkKey.startsWith('console-')) {
        logger.warn('Console API keys are not supported by Client SDK. Skipping initialization.')
        this.isInitialized = false
        return
      }

      this.currentUser = user || this.buildDefaultUser()

      // Create new client instance
      this.client = new StatsigClient(this.clientSdkKey, this.currentUser, {
        logLevel: LogLevel.Error, // Reduce console noise
        disableStorage: false, // Allow caching for better performance
        // disableNetworkKeepalive: true, // Property doesn't exist in current version
        disableLogging: true, // We'll handle errors ourselves
      })

      // Initialize the client
      await this.client.initializeAsync()
      this.isInitialized = true

      logger.info('Statsig Client SDK initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Statsig Client SDK:', error)
      this.cleanup()
      throw new Error(`SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update the user context and re-initialize if needed
   */
  async updateUser(user: StatsigUser): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Statsig client not initialized')
    }

    logger.info('Updating user context...')

    try {
      this.currentUser = user
      await this.client.updateUserAsync(user)
      logger.info('User context updated successfully')
    } catch (error) {
      logger.error('Failed to update user context:', error)
      throw new Error(`User update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build user context from storage overrides
   */
  buildUserFromOverrides(overrides: StorageOverride[]): StatsigUser {
    const user: StatsigUser = this.buildDefaultUser()
    const custom: Record<string, unknown> = {}

    // Process storage overrides
    for (const override of overrides) {
      // For Statsig-specific overrides, use the feature name as the key
      if (override.featureName) {
        custom[`override_${override.featureName}`] = override.value
      } else {
        // Fallback to generic storage-based keys
        if (override.type === 'cookie') {
          custom[`cookie_${override.key}`] = override.value
        } else if (override.type === 'localStorage') {
          custom[`localStorage_${override.key}`] = override.value
        } else if (override.type === 'sessionStorage') {
          custom[`sessionStorage_${override.key}`] = override.value
        }
      }
    }

    // Add custom fields if any
    if (Object.keys(custom).length > 0) {
      user.custom = { ...user.custom, ...custom } as Record<string, string | number | boolean | Array<string>>
    }

    return user
  }

  /**
   * Get overrides for a specific feature
   */
  getOverridesForFeature(overrides: StorageOverride[], featureName: string): StorageOverride[] {
    return overrides.filter((override) => override.featureName === featureName)
  }

  /**
   * Evaluate a feature gate
   */
  async evaluateFeatureGate(gateName: string): Promise<EvaluationResult> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Statsig client not initialized')
    }

    try {
      const result = this.client.checkGate(gateName)

      return {
        configurationName: gateName,
        type: 'feature_gate',
        passed: result,
        value: result,
        // Don't set ruleId for gates since SDK doesn't provide it
        reason: 'Gate evaluation',
        debugInfo: {
          evaluatedRules: [],
          userContext: this.currentUser || {},
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      logger.error(`Failed to evaluate feature gate ${gateName}:`, error)
      throw new Error(`Gate evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Evaluate an experiment
   */
  async evaluateExperiment(experimentName: string): Promise<EvaluationResult> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Statsig client not initialized')
    }

    try {
      const result = this.client.getExperiment(experimentName)

      return {
        configurationName: experimentName,
        type: 'experiment',
        passed: true, // Experiments always "pass" but return different groups
        value: result.groupName,
        ruleId: result.ruleID,
        groupName: result.groupName || undefined,
        reason: result.details?.reason || 'Unknown',
        debugInfo: {
          evaluatedRules: [],
          userContext: this.currentUser || {},
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      logger.error(`Failed to evaluate experiment ${experimentName}:`, error)
      throw new Error(`Experiment evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Evaluate a dynamic config
   */
  async evaluateDynamicConfig(configName: string): Promise<EvaluationResult> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Statsig client not initialized')
    }

    try {
      const result = this.client.getDynamicConfig(configName)

      return {
        configurationName: configName,
        type: 'dynamic_config',
        passed: true, // Dynamic configs always "pass" but return different values
        value: result.value,
        ruleId: result.ruleID,
        reason: result.details?.reason || 'Unknown',
        debugInfo: {
          evaluatedRules: [],
          userContext: this.currentUser || {},
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      logger.error(`Failed to evaluate dynamic config ${configName}:`, error)
      throw new Error(`Config evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Evaluate all configurations
   */
  async evaluateAllConfigurations(configurations: StatsigConfigurationItem[]): Promise<EvaluationResult[]> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Statsig client not initialized')
    }

    logger.info(`Evaluating ${configurations.length} configurations...`)

    const results: EvaluationResult[] = []

    for (const config of configurations) {
      try {
        let result: EvaluationResult

        switch (config.type) {
          case 'feature_gate':
            result = await this.evaluateFeatureGate(config.name)
            break
          case 'experiment':
            result = await this.evaluateExperiment(config.name)
            break
          case 'dynamic_config':
            result = await this.evaluateDynamicConfig(config.name)
            break
          default:
            logger.error(`Unknown configuration type: ${config.type}`)
            continue
        }

        results.push(result)
      } catch (error) {
        logger.error(`Failed to evaluate configuration ${config.name}:`, error)
        // Continue with other configurations even if one fails
        results.push({
          configurationName: config.name,
          type: config.type,
          passed: false,
          reason: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          debugInfo: {
            evaluatedRules: [],
            userContext: this.currentUser || {},
            timestamp: new Date().toISOString(),
          },
        })
      }
    }

    logger.info(`Successfully evaluated ${results.length} configurations`)
    return results
  }

  /**
   * Build default user context
   */
  private buildDefaultUser(): StatsigUser {
    return {
      userID: 'statsig-dev-tools-user',
      email: undefined,
      ip: undefined,
      userAgent: navigator.userAgent,
      country: undefined,
      locale: navigator.language,
      appVersion: getExtensionVersion(),
      custom: {},
      privateAttributes: {},
    }
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null
  }

  /**
   * Get current user context
   */
  getCurrentUser(): StatsigUser | null {
    return this.currentUser
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.client) {
      // Note: StatsigClient doesn't have a cleanup method in the current version
      // but we set it to null to indicate it's no longer usable
      this.client = null
    }
    this.isInitialized = false
    this.currentUser = null
    this.clientSdkKey = ''
    logger.info('Statsig integration service cleaned up')
  }
}

/**
 * Singleton instance of the Statsig integration service
 */
export const statsigIntegration = new StatsigIntegrationService()

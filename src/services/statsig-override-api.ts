/**
 * Statsig Override API Service
 * Handles experiment overrides using Statsig's official API
 */

import { logger } from '../utils/logger'

// Statsig Console API endpoints
const CONSOLE_API_BASE_URL = 'https://statsigapi.net/console/v1'
const REQUEST_TIMEOUT = 10000

export interface StatsigOverrideRequest {
  experimentName: string
  userId?: string
  stableId?: string
  groupName: string
}

export interface StatsigOverrideResponse {
  success: boolean
  message?: string
  overrideId?: string
}

/**
 * Service for managing experiment overrides via Statsig API
 */
export class StatsigOverrideApiService {
  private consoleApiKey: string = ''

  /**
   * Initialize the service with Console API key
   */
  initialize(consoleApiKey: string): void {
    this.consoleApiKey = consoleApiKey.trim()
    logger.info('Statsig Override API Service initialized')
  }

  /**
   * Create an experiment override for a specific user
   */
  async createExperimentOverride(request: StatsigOverrideRequest): Promise<StatsigOverrideResponse> {
    if (!this.consoleApiKey) {
      throw new Error('Console API key not configured')
    }

    if (!this.consoleApiKey.startsWith('console-')) {
      throw new Error('Console API key required for overrides')
    }

    try {
      logger.info(`Creating experiment override for ${request.experimentName}`, {
        userId: request.userId,
        stableId: request.stableId,
        groupName: request.groupName,
      })

      // Prepare the override payload
      const payload = {
        experiment_name: request.experimentName,
        group_name: request.groupName,
        ...(request.userId && { user_id: request.userId }),
        ...(request.stableId && { stable_id: request.stableId }),
      }

      const response = await this.makeApiRequest('/experiments/overrides', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (response.success) {
        logger.info(`Successfully created override for experiment ${request.experimentName}`)
        return {
          success: true,
          message: 'Override created successfully',
          overrideId: response.override_id,
        }
      } else {
        throw new Error(response.message || 'Failed to create override')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to create experiment override: ${errorMessage}`)
      throw new Error(`Override creation failed: ${errorMessage}`)
    }
  }

  /**
   * Remove an experiment override for a specific user
   */
  async removeExperimentOverride(request: Omit<StatsigOverrideRequest, 'groupName'>): Promise<StatsigOverrideResponse> {
    if (!this.consoleApiKey) {
      throw new Error('Console API key not configured')
    }

    try {
      logger.info(`Removing experiment override for ${request.experimentName}`, {
        userId: request.userId,
        stableId: request.stableId,
      })

      const payload = {
        experiment_name: request.experimentName,
        ...(request.userId && { user_id: request.userId }),
        ...(request.stableId && { stable_id: request.stableId }),
      }

      const response = await this.makeApiRequest('/experiments/overrides', {
        method: 'DELETE',
        body: JSON.stringify(payload),
      })

      if (response.success) {
        logger.info(`Successfully removed override for experiment ${request.experimentName}`)
        return {
          success: true,
          message: 'Override removed successfully',
        }
      } else {
        throw new Error(response.message || 'Failed to remove override')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to remove experiment override: ${errorMessage}`)
      throw new Error(`Override removal failed: ${errorMessage}`)
    }
  }

  /**
   * Make an API request to Statsig Console API
   */
  private async makeApiRequest(endpoint: string, options: RequestInit): Promise<any> {
    const url = `${CONSOLE_API_BASE_URL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'STATSIG-API-KEY': this.consoleApiKey,
      ...options.headers,
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network request failed')
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.consoleApiKey && this.consoleApiKey.startsWith('console-')
  }
}

// Export singleton instance
export const statsigOverrideApiService = new StatsigOverrideApiService()
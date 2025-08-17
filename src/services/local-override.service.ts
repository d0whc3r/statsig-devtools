/**
 * Local Override Service
 * Handles local experiment overrides using Statsig's LocalOverrideAdapter
 * This service provides a clean interface for managing local overrides without API calls
 */

import { logger } from '../utils/logger'

export interface LocalExperimentOverride {
  experimentName: string
  groupName: string
  userId?: string
  stableId?: string
  timestamp: number
}

export interface LocalOverrideRequest {
  experimentName: string
  groupName: string
  userId?: string
  stableId?: string
}

export interface LocalOverrideResponse {
  success: boolean
  message: string
  override?: LocalExperimentOverride
}

/**
 * Service for managing local experiment overrides
 * Uses localStorage for persistence and integrates with Statsig SDK
 */
export class LocalOverrideService {
  private static readonly STORAGE_KEY = 'statsig_local_overrides'
  private overrides: Map<string, LocalExperimentOverride> = new Map()

  constructor() {
    this.loadOverrides().catch((error) => {
      logger.error('Failed to load overrides during initialization:', error)
    })
  }

  /**
   * Create a local experiment override
   */
  async createExperimentOverride(request: LocalOverrideRequest): Promise<LocalOverrideResponse> {
    try {
      logger.info(`Creating local experiment override for ${request.experimentName}`, {
        groupName: request.groupName,
        userId: request.userId,
        stableId: request.stableId,
      })

      const override: LocalExperimentOverride = {
        experimentName: request.experimentName,
        groupName: request.groupName,
        userId: request.userId,
        stableId: request.stableId,
        timestamp: Date.now(),
      }

      // Store override in memory and localStorage
      const overrideKey = this.getOverrideKey(request.experimentName, request.userId, request.stableId)
      this.overrides.set(overrideKey, override)
      await this.saveOverrides()

      // Apply override to current page via content script
      await this.applyOverrideToPage(override)

      logger.info(`Successfully created local override for experiment ${request.experimentName}`)
      return {
        success: true,
        message: 'Local override created successfully',
        override,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to create local experiment override: ${errorMessage}`)
      return {
        success: false,
        message: `Failed to create override: ${errorMessage}`,
      }
    }
  }

  /**
   * Remove a local experiment override
   */
  async removeExperimentOverride(
    experimentName: string,
    userId?: string,
    stableId?: string,
  ): Promise<LocalOverrideResponse> {
    try {
      logger.info(`Removing local experiment override for ${experimentName}`, {
        userId,
        stableId,
      })

      const overrideKey = this.getOverrideKey(experimentName, userId, stableId)
      const override = this.overrides.get(overrideKey)

      if (!override) {
        return {
          success: false,
          message: 'Override not found',
        }
      }

      // Remove override from memory and localStorage
      this.overrides.delete(overrideKey)
      await this.saveOverrides()

      // Remove override from current page via content script
      await this.removeOverrideFromPage(experimentName)

      logger.info(`Successfully removed local override for experiment ${experimentName}`)
      return {
        success: true,
        message: 'Local override removed successfully',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to remove local experiment override: ${errorMessage}`)
      return {
        success: false,
        message: `Failed to remove override: ${errorMessage}`,
      }
    }
  }

  /**
   * Get all active overrides
   */
  getActiveOverrides(): LocalExperimentOverride[] {
    return Array.from(this.overrides.values())
  }

  /**
   * Get overrides for a specific experiment
   */
  getOverridesForExperiment(experimentName: string): LocalExperimentOverride[] {
    return this.getActiveOverrides().filter((override) => override.experimentName === experimentName)
  }

  /**
   * Check if an experiment has active overrides
   */
  hasOverrides(experimentName: string): boolean {
    return this.getOverridesForExperiment(experimentName).length > 0
  }

  /**
   * Clear all overrides
   */
  async clearAllOverrides(): Promise<void> {
    try {
      logger.info('Clearing all local experiment overrides')

      // Remove all overrides from current page
      for (const override of this.overrides.values()) {
        await this.removeOverrideFromPage(override.experimentName)
      }

      this.overrides.clear()
      await this.saveOverrides()

      logger.info('Successfully cleared all local overrides')
    } catch (error) {
      logger.error('Failed to clear all overrides:', error)
      throw error
    }
  }

  /**
   * Apply override to the current page via content script injection
   */
  private async applyOverrideToPage(override: LocalExperimentOverride): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.id) {
        throw new Error('No active tab found')
      }

      // Inject script to apply local override
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (experimentName: string, groupName: string) => {
          // Store override in window for Statsig SDK to use
          const statsigWindow = window as any
          if (!statsigWindow.statsigLocalOverrides) {
            statsigWindow.statsigLocalOverrides = {}
          }

          statsigWindow.statsigLocalOverrides[experimentName] = {
            groupName,
            timestamp: Date.now(),
          }

          // If Statsig SDK is available, apply override directly
          if (statsigWindow.Statsig && typeof statsigWindow.Statsig.overrideExperiment === 'function') {
            // Use SDK's override method if available
            statsigWindow.Statsig.overrideExperiment(experimentName, { groupName })
          }

          console.log(`🎯 STATSIG: Applied local override for experiment ${experimentName} → ${groupName}`)
        },
        args: [override.experimentName, override.groupName],
      })
    } catch (error) {
      logger.error('Failed to apply override to page:', error)
      // Don't throw - override is still stored locally
    }
  }

  /**
   * Remove override from the current page via content script injection
   */
  private async removeOverrideFromPage(experimentName: string): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.id) {
        throw new Error('No active tab found')
      }

      // Inject script to remove local override
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (experimentName: string) => {
          const statsigWindow = window as any
          if (statsigWindow.statsigLocalOverrides && statsigWindow.statsigLocalOverrides[experimentName]) {
            delete statsigWindow.statsigLocalOverrides[experimentName]
          }

          // If Statsig SDK is available, remove override
          if (statsigWindow.Statsig && typeof statsigWindow.Statsig.removeExperimentOverride === 'function') {
            statsigWindow.Statsig.removeExperimentOverride(experimentName)
          }

          console.log(`🗑️ STATSIG: Removed local override for experiment ${experimentName}`)
        },
        args: [experimentName],
      })
    } catch (error) {
      logger.error('Failed to remove override from page:', error)
      // Don't throw - override is still removed locally
    }
  }

  /**
   * Generate unique key for override storage
   */
  private getOverrideKey(experimentName: string, userId?: string, stableId?: string): string {
    const identifier = userId || stableId || 'default'
    return `${experimentName}:${identifier}`
  }

  /**
   * Load overrides from chrome storage
   */
  private async loadOverrides(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([LocalOverrideService.STORAGE_KEY])
      const stored = result[LocalOverrideService.STORAGE_KEY]

      if (stored) {
        const overridesArray: LocalExperimentOverride[] = stored
        this.overrides.clear()

        for (const override of overridesArray) {
          const key = this.getOverrideKey(override.experimentName, override.userId, override.stableId)
          this.overrides.set(key, override)
        }

        logger.info(`Loaded ${this.overrides.size} local overrides from storage`)
      }
    } catch (error) {
      logger.error('Failed to load overrides from storage:', error)
      this.overrides.clear()
    }
  }

  /**
   * Save overrides to chrome storage
   */
  private async saveOverrides(): Promise<void> {
    try {
      const overridesArray = Array.from(this.overrides.values())
      await chrome.storage.local.set({ [LocalOverrideService.STORAGE_KEY]: overridesArray })
      logger.debug(`Saved ${overridesArray.length} local overrides to storage`)
    } catch (error) {
      logger.error('Failed to save overrides to storage:', error)
      throw error
    }
  }
}

// Export singleton instance
export const localOverrideService = new LocalOverrideService()

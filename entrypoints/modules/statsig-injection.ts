/**
 * Statsig-specific override injection functionality
 */

import { logger } from '@/src/utils/logger'

import { executeScriptDirect } from './script-execution'

import type { StatsigSDK, StatsigWindow } from '../types/content-types'
import type { StorageOverride } from '@/src/services/statsig-integration'

/**
 * Inject Statsig-specific override logic with improved error handling and reliability
 */
export async function injectStatsigOverride(override: StorageOverride): Promise<void> {
  if (!override.featureName || !override.featureType) {
    // eslint-disable-next-line no-console
    console.warn('Statsig: Override missing featureName or featureType, skipping Statsig injection')
    return
  }

  try {
    await executeScriptDirect(
      (featureName: string, featureType: string, overrideValue: string) => {
        // eslint-disable-next-line no-console
        console.log('🎯 STATSIG: Injecting override', { featureName, featureType, overrideValue })

        // Initialize overrides storage
        const statsigWindow = window as StatsigWindow
        if (!statsigWindow.statsigOverrides) {
          statsigWindow.statsigOverrides = {}
        }

        // Store the override
        statsigWindow.statsigOverrides[featureName] = {
          type: featureType,
          value: overrideValue,
          timestamp: Date.now(),
        }

        // Intercept Statsig SDK calls if available
        if (statsigWindow.Statsig) {
          interceptStatsigSDK(statsigWindow.Statsig, featureName, featureType, overrideValue)
        }

        // eslint-disable-next-line no-console
        console.log('✅ STATSIG: Override injected successfully', { featureName, featureType, overrideValue })
      },
      [override.featureName, override.featureType, override.value],
    )

    logger.log(`✅ Statsig override injected successfully for ${override.featureName}`)
  } catch (error) {
    logger.error(`❌ Failed to inject Statsig override for ${override.featureName}:`, error)
    throw error
  }
}

/**
 * Intercept Statsig SDK methods to apply overrides
 * This function is executed in the page context
 */
function interceptStatsigSDK(
  statsig: StatsigSDK,
  featureName: string,
  featureType: string,
  overrideValue: string,
): void {
  const originalCheckGate = statsig.checkGate
  const originalGetConfig = statsig.getConfig
  const originalGetExperiment = statsig.getExperiment

  if (originalCheckGate && featureType === 'feature_gate') {
    statsig.checkGate = function (gateName: string, user?: Record<string, unknown>) {
      if (gateName === featureName) {
        // eslint-disable-next-line no-console
        console.log('🎯 STATSIG: Overriding checkGate', { gateName, overrideValue })
        return overrideValue === 'true'
      }
      return originalCheckGate.call(this, gateName, user)
    }
  }

  if (originalGetConfig && featureType === 'dynamic_config') {
    statsig.getConfig = function (configName: string, user?: Record<string, unknown>) {
      if (configName === featureName) {
        // eslint-disable-next-line no-console
        console.log('🎯 STATSIG: Overriding getConfig', { configName, overrideValue })
        try {
          return { value: JSON.parse(overrideValue) }
        } catch {
          return { value: overrideValue }
        }
      }
      return originalGetConfig.call(this, configName, user)
    }
  }

  if (originalGetExperiment && featureType === 'experiment') {
    statsig.getExperiment = function (experimentName: string, user?: Record<string, unknown>) {
      if (experimentName === featureName) {
        // eslint-disable-next-line no-console
        console.log('🎯 STATSIG: Overriding getExperiment', { experimentName, overrideValue })
        try {
          return { value: JSON.parse(overrideValue) }
        } catch {
          return { value: overrideValue }
        }
      }
      return originalGetExperiment.call(this, experimentName, user)
    }
  }
}

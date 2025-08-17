import { useCallback } from 'react'

import type { StorageOverride } from '../../types'

/**
 * Hook to manage configuration overrides logic
 */
export const useConfigurationOverrides = (activeOverrides: StorageOverride[]) => {
  /**
   * Check if a configuration has active overrides
   */
  const hasOverrides = useCallback(
    (configName: string) =>
      activeOverrides.some((override) => {
        // Check for Statsig-specific overrides first
        const extendedOverride = override as StorageOverride & { featureName?: string }
        if (extendedOverride.featureName) {
          return extendedOverride.featureName === configName
        }
        // Fallback to legacy key/value matching
        return override.key.includes(configName) || override.value?.toString().includes(configName)
      }),
    [activeOverrides],
  )

  /**
   * Get override count for a configuration
   */
  const getOverrideCount = useCallback(
    (configName: string) =>
      activeOverrides.filter((override) => {
        // Check for Statsig-specific overrides first
        const extendedOverride = override as StorageOverride & { featureName?: string }
        if (extendedOverride.featureName) {
          return extendedOverride.featureName === configName
        }
        // Fallback to legacy key/value matching
        return override.key.includes(configName) || override.value?.toString().includes(configName)
      }).length,
    [activeOverrides],
  )

  return {
    hasOverrides,
    getOverrideCount,
  }
}

import { useCallback, useEffect, useState } from 'react'

import { errorHandler } from '../services/error-handler'
import { unifiedStatsigService } from '../services/unified-statsig-api'

import type { AuthState, StatsigConfigurationItem } from '../types'

/**
 * Custom hook for managing configuration data loading and state
 */
export const useConfigurationData = (authState: AuthState) => {
  const [configurations, setConfigurations] = useState<StatsigConfigurationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  /**
   * Load configurations
   */
  const loadConfigurations = useCallback(async () => {
    const apiKey = authState.consoleApiKey

    if (!apiKey) {
      setError('API key not available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      // Initialize service if not ready
      if (!unifiedStatsigService.isReady()) {
        await unifiedStatsigService.initialize(apiKey)
      }

      // Get configurations
      const allConfigurations = await unifiedStatsigService.getAllConfigurations()
      setConfigurations(allConfigurations)
    } catch (err) {
      const handledError = errorHandler.handleError(err, 'Loading configurations')
      setError(handledError.userMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authState.consoleApiKey])

  /**
   * Refresh configurations
   */
  const refreshConfigurations = useCallback(() => {
    loadConfigurations()
  }, [loadConfigurations])

  /**
   * Load configurations on mount and when auth state changes
   */
  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  return {
    configurations,
    isLoading,
    error,
    refreshConfigurations,
  }
}

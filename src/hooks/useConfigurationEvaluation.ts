import { useCallback, useEffect, useState } from 'react'

import { errorHandler } from '../services/error-handler'
import { statsigIntegration } from '../services/statsig-integration'

import type { EvaluationResult, StorageOverride } from '../services/statsig-integration'
import type { AuthState, StatsigConfigurationItem } from '../types'

/**
 * Custom hook for managing configuration evaluation and results
 */
export const useConfigurationEvaluation = (
  authState: AuthState,
  configurations: StatsigConfigurationItem[],
  activeOverrides: StorageOverride[],
) => {
  const [evaluationResults, setEvaluationResults] = useState<Map<string, EvaluationResult>>(new Map())
  const [isEvaluating, setIsEvaluating] = useState(false)

  /**
   * Initialize SDK and evaluate all configurations
   */
  const initializeAndEvaluate = useCallback(async () => {
    if (!authState.clientSdkKey || configurations.length === 0) {
      return
    }

    // Skip evaluation if we only have a Console API key (not compatible with Client SDK)
    if (authState.clientSdkKey.startsWith('console-')) {
      // eslint-disable-next-line no-console
      console.info('Skipping client-side evaluation: Console API key detected (not compatible with Client SDK)')
      setEvaluationResults(new Map())
      setIsEvaluating(false)
      return
    }

    setIsEvaluating(true)

    try {
      // Build user context from overrides
      const user = statsigIntegration.buildUserFromOverrides(activeOverrides)

      // Initialize or update SDK
      if (!statsigIntegration.isReady()) {
        await statsigIntegration.initialize(authState.clientSdkKey, user)
      } else {
        await statsigIntegration.updateUser(user)
      }

      // Evaluate all configurations
      const results = await statsigIntegration.evaluateAllConfigurations(configurations)

      // Convert to Map for easier lookup
      const resultsMap = new Map<string, EvaluationResult>()
      results.forEach((result) => {
        resultsMap.set(result.configurationName, result)
      })

      setEvaluationResults(resultsMap)
    } catch (err) {
      errorHandler.handleError(err, 'Evaluating configurations')
      // Set empty results on error to prevent UI issues
      setEvaluationResults(new Map())
    } finally {
      setIsEvaluating(false)
    }
  }, [authState.clientSdkKey, configurations, activeOverrides])

  /**
   * Re-evaluate configurations when dependencies change
   */
  useEffect(() => {
    if (configurations.length > 0) {
      initializeAndEvaluate()
    }
  }, [configurations, activeOverrides, initializeAndEvaluate])

  /**
   * Cleanup on unmount
   */
  useEffect(
    () => () => {
      statsigIntegration.cleanup()
    },
    [],
  )

  return {
    evaluationResults,
    isEvaluating,
    initializeAndEvaluate,
  }
}

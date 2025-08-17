import { useCallback, useEffect, useState } from 'react'

import { unifiedStatsigService } from '../services/unified-statsig-api'
import { logger } from '../utils/logger'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { AuthState } from '../types'

/**
 * Hook for evaluating Statsig configurations with override support
 */
export const useConfigurationEvaluation = (authState: AuthState) => {
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)

  /**
   * Evaluate all configurations for the current user
   */
  const evaluateConfigurations = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.consoleApiKey) {
      logger.warn('Cannot evaluate configurations: not authenticated')
      setEvaluationResults([])
      return
    }

    setIsEvaluating(true)
    setEvaluationError(null)

    try {
      // Initialize the service if not already done
      if (!unifiedStatsigService.isReady()) {
        await unifiedStatsigService.initialize(authState.consoleApiKey)
      }

      // Get all configurations
      const configurations = await unifiedStatsigService.getAllConfigurations()

      // Evaluate each configuration
      const results: EvaluationResult[] = []

      for (const config of configurations) {
        try {
          let result: EvaluationResult

          if (config.type === 'feature_gate') {
            result = await unifiedStatsigService.evaluateFeatureGate(config.name)
          } else {
            // For experiments and dynamic configs, create a basic evaluation result
            result = {
              configurationName: config.name,
              type: config.type,
              passed: config.enabled || false,
              value: config.enabled || false,
              reason: 'Configuration evaluation',
            }
          }

          results.push(result)
        } catch (configError) {
          logger.error(`Failed to evaluate configuration ${config.name}:`, configError)
          // Add a failed evaluation result
          results.push({
            configurationName: config.name,
            type: config.type,
            passed: false,
            value: false,
            reason: 'Evaluation failed',
          })
        }
      }

      setEvaluationResults(results)
      logger.info(`Evaluated ${results.length} configurations`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Configuration evaluation failed:', error)
      setEvaluationError(errorMessage)
      setEvaluationResults([])
    } finally {
      setIsEvaluating(false)
    }
  }, [authState.isAuthenticated, authState.consoleApiKey])

  /**
   * Re-evaluate configurations with fresh data
   */
  const refreshEvaluations = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.consoleApiKey) {
      return
    }

    setIsEvaluating(true)
    setEvaluationError(null)

    try {
      // Refresh configurations from the service
      await unifiedStatsigService.refreshConfigurations()

      // Re-evaluate all configurations
      await evaluateConfigurations()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Configuration refresh failed:', error)
      setEvaluationError(errorMessage)
    } finally {
      setIsEvaluating(false)
    }
  }, [authState.isAuthenticated, authState.consoleApiKey, evaluateConfigurations])

  /**
   * Get evaluation result for a specific configuration
   */
  const getEvaluationResult = useCallback(
    (configurationName: string): EvaluationResult | undefined =>
      evaluationResults.find((result) => result.configurationName === configurationName),
    [evaluationResults],
  )

  /**
   * Check if a feature gate is enabled
   */
  const isFeatureEnabled = useCallback(
    (gateName: string): boolean => {
      const result = getEvaluationResult(gateName)
      return result?.passed || false
    },
    [getEvaluationResult],
  )

  /**
   * Get experiment value
   */
  const getExperimentValue = useCallback(
    (experimentName: string): unknown => {
      const result = getEvaluationResult(experimentName)
      return result?.value
    },
    [getEvaluationResult],
  )

  // Auto-evaluate when authentication state changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.consoleApiKey) {
      evaluateConfigurations()
    } else {
      setEvaluationResults([])
      setEvaluationError(null)
    }
  }, [authState.isAuthenticated, authState.consoleApiKey, evaluateConfigurations])

  return {
    evaluationResults,
    isEvaluating,
    evaluationError,
    evaluateConfigurations,
    refreshEvaluations,
    getEvaluationResult,
    isFeatureEnabled,
    getExperimentValue,
  }
}

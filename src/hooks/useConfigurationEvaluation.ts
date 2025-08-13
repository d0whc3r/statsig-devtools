import { useCallback, useEffect, useRef, useState } from 'react'

import { errorHandler } from '../services/error-handler'
import { statsigIntegration } from '../services/statsig-integration'
import { statsigOverrideApiService } from '../services/statsig-override-api'

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

  // Use refs to track previous values and avoid unnecessary re-evaluations
  const prevAuthStateRef = useRef<string | undefined>(undefined)
  const prevConfigurationsRef = useRef<string | null>(null)
  const prevOverridesRef = useRef<string | null>(null)

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
        
        // Initialize override API service if we have a console API key
        if (authState.consoleApiKey && authState.consoleApiKey.startsWith('console-')) {
          statsigOverrideApiService.initialize(authState.consoleApiKey)
        }
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
  }, [authState.clientSdkKey, authState.consoleApiKey, configurations, activeOverrides])

  /**
   * Re-evaluate configurations when dependencies change
   */
  useEffect(() => {
    if (configurations.length === 0) {
      return
    }

    // Create stable hashes for comparison
    const currentAuthState = authState.clientSdkKey
    const currentConfigurations = JSON.stringify(configurations.map((c) => c.name))
    const currentOverrides = JSON.stringify(activeOverrides.map((o) => `${o.type}:${o.key}:${o.value}`))

    // Check if any dependencies have actually changed
    const authStateChanged = prevAuthStateRef.current !== currentAuthState
    const configurationsChanged = prevConfigurationsRef.current !== currentConfigurations
    const overridesChanged = prevOverridesRef.current !== currentOverrides

    if (authStateChanged || configurationsChanged || overridesChanged) {
      // Update refs
      prevAuthStateRef.current = currentAuthState
      prevConfigurationsRef.current = currentConfigurations
      prevOverridesRef.current = currentOverrides

      // Only evaluate if we have a valid auth state
      if (currentAuthState) {
        // Execute evaluation logic directly here to avoid dependency issues
        const evaluateConfigurations = async () => {
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
              
              // Initialize override API service if we have a console API key
              if (authState.consoleApiKey && authState.consoleApiKey.startsWith('console-')) {
                statsigOverrideApiService.initialize(authState.consoleApiKey)
              }
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
        }

        evaluateConfigurations()
      }
    }
  }, [authState.clientSdkKey, configurations, activeOverrides, authState.consoleApiKey])

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

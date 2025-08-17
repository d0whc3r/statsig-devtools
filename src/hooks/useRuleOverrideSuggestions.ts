import { useMemo } from 'react'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem, StorageOverride } from '../types'

interface UseRuleOverrideSuggestionsResult {
  getSuggestedKey: () => string
  getSuggestedOverrideValue: () => string
  inferDefaultType: () => StorageOverride['type']
}

export function useRuleOverrideSuggestions(
  configuration: StatsigConfigurationItem,
  evaluationResult?: EvaluationResult,
): UseRuleOverrideSuggestionsResult {
  const getSuggestedOverrideValue = useMemo(
    () => () => {
      if (configuration.type === 'feature_gate') {
        return evaluationResult?.value ? 'false' : 'true'
      }
      if (configuration.type === 'dynamic_config') {
        return JSON.stringify({ overridden: true, value: 'custom_value' })
      }
      if (configuration.type === 'experiment') {
        return JSON.stringify({ group: 'test_group', value: 'experiment_override' })
      }
      return 'true'
    },
    [configuration.type, evaluationResult?.value],
  )

  const getSuggestedKey = useMemo(
    () => () => `statsig_${configuration.id ?? configuration.name}`,
    [configuration.id, configuration.name],
  )

  const inferDefaultType = useMemo(
    () => (): StorageOverride['type'] => {
      const text = `${configuration.name} ${JSON.stringify(configuration.rules || [])}`.toLowerCase()
      if (text.includes('cookie')) return 'cookie'
      if (text.includes('storage')) return 'localStorage'
      return 'localStorage'
    },
    [configuration.name, configuration.rules],
  )

  return {
    getSuggestedKey,
    getSuggestedOverrideValue,
    inferDefaultType,
  }
}

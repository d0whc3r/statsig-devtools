import { useConfigurationData } from './useConfigurationData'
import { useConfigurationEvaluation } from './useConfigurationEvaluation'

import type { AuthState } from '../types'

export interface UseDashboardHeaderReturn {
  isLoading: boolean
  isEvaluating: boolean
  refreshConfigurations: () => void
}

/**
 * Hook for dashboard header functionality
 */
export function useDashboardHeader(authState: AuthState): UseDashboardHeaderReturn {
  const { isLoading, refreshConfigurations } = useConfigurationData(authState)
  const { isEvaluating } = useConfigurationEvaluation(authState)

  return {
    isLoading,
    isEvaluating,
    refreshConfigurations,
  }
}

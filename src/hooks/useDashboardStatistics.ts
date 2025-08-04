import { calculateDashboardStatistics, type DashboardStatistics } from '../utils/dashboard-statistics'
import { useConfigurationData } from './useConfigurationData'
import { useConfigurationEvaluation } from './useConfigurationEvaluation'
import { useStorageOverrides } from './useStorageOverrides'

import type { AuthState } from '../types'

export interface UseDashboardStatisticsReturn {
  statistics: DashboardStatistics
  isLoading: boolean
}

/**
 * Hook for dashboard statistics
 */
export function useDashboardStatistics(authState: AuthState): UseDashboardStatisticsReturn {
  const { configurations, isLoading } = useConfigurationData(authState)
  const { activeOverrides } = useStorageOverrides()
  const { evaluationResults } = useConfigurationEvaluation(authState, configurations, activeOverrides)

  const statistics = calculateDashboardStatistics(configurations, evaluationResults, activeOverrides)

  return {
    statistics,
    isLoading,
  }
}

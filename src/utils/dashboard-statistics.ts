import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem, StorageOverride } from '../types'

/**
 * Interface for dashboard statistics
 */
export interface DashboardStatistics {
  totalConfigurations: number
  evaluatedConfigurations: number
  passedConfigurations: number
  failedConfigurations: number
  activeOverridesCount: number
  configurationsByType: Record<string, number>
  evaluationSuccessRate: number
}

/**
 * Calculate comprehensive dashboard statistics
 */
export const calculateDashboardStatistics = (
  configurations: StatsigConfigurationItem[],
  evaluationResults: Map<string, EvaluationResult>,
  activeOverrides: StorageOverride[],
): DashboardStatistics => {
  const totalConfigurations = configurations.length
  const evaluatedConfigurations = evaluationResults.size
  const activeOverridesCount = activeOverrides.length

  // Count passed and failed configurations
  let passedConfigurations = 0
  let failedConfigurations = 0

  evaluationResults.forEach((result) => {
    if (result.passed) {
      passedConfigurations++
    } else {
      failedConfigurations++
    }
  })

  // Count configurations by type
  const configurationsByType: Record<string, number> = {}
  configurations.forEach((config) => {
    configurationsByType[config.type] = (configurationsByType[config.type] || 0) + 1
  })

  // Calculate success rate
  const evaluationSuccessRate = evaluatedConfigurations > 0 ? passedConfigurations / evaluatedConfigurations : 0

  return {
    totalConfigurations,
    evaluatedConfigurations,
    passedConfigurations,
    failedConfigurations,
    activeOverridesCount,
    configurationsByType,
    evaluationSuccessRate,
  }
}

/**
 * Get statistics summary text
 */
export const getStatisticsSummary = (statistics: DashboardStatistics): string => {
  const { totalConfigurations, evaluatedConfigurations, passedConfigurations, failedConfigurations } = statistics

  if (totalConfigurations === 0) {
    return 'No configurations found'
  }

  if (evaluatedConfigurations === 0) {
    return `${totalConfigurations} configurations loaded, none evaluated yet`
  }

  return `${totalConfigurations} configurations, ${evaluatedConfigurations} evaluated (${passedConfigurations} passed, ${failedConfigurations} failed)`
}

/**
 * Get configuration type distribution
 */
export const getTypeDistribution = (
  statistics: DashboardStatistics,
): { type: string; count: number; percentage: number }[] => {
  const { configurationsByType, totalConfigurations } = statistics

  return Object.entries(configurationsByType).map(([type, count]) => ({
    type,
    count,
    percentage: totalConfigurations > 0 ? (count / totalConfigurations) * 100 : 0,
  }))
}

/**
 * Check if statistics indicate healthy state
 */
export const isHealthyState = (statistics: DashboardStatistics): boolean => {
  const { totalConfigurations, evaluatedConfigurations, evaluationSuccessRate } = statistics

  // Consider healthy if:
  // - Has configurations
  // - Most configurations are evaluated
  // - Success rate is reasonable
  return totalConfigurations > 0 && evaluatedConfigurations / totalConfigurations > 0.8 && evaluationSuccessRate > 0.5
}

/**
 * Get health status message
 */
export const getHealthStatusMessage = (statistics: DashboardStatistics): string => {
  if (statistics.totalConfigurations === 0) {
    return 'No configurations available'
  }

  if (statistics.evaluatedConfigurations === 0) {
    return 'Configurations not yet evaluated'
  }

  const evaluationCoverage = statistics.evaluatedConfigurations / statistics.totalConfigurations
  const successRate = statistics.evaluationSuccessRate

  if (evaluationCoverage < 0.5) {
    return 'Low evaluation coverage'
  }

  if (successRate < 0.3) {
    return 'High failure rate detected'
  }

  if (successRate > 0.8) {
    return 'All systems operational'
  }

  return 'Partial success rate'
}

/**
 * Get recommended actions based on statistics
 */
export const getRecommendedActions = (statistics: DashboardStatistics): string[] => {
  const actions: string[] = []

  if (statistics.totalConfigurations === 0) {
    actions.push('Add configurations to get started')
    return actions
  }

  const evaluationCoverage = statistics.evaluatedConfigurations / statistics.totalConfigurations

  if (evaluationCoverage < 0.8) {
    actions.push('Evaluate remaining configurations')
  }

  if (statistics.evaluationSuccessRate < 0.5) {
    actions.push('Review failed configurations')
    actions.push('Check override settings')
  }

  if (statistics.activeOverridesCount === 0 && statistics.failedConfigurations > 0) {
    actions.push('Consider adding overrides for testing')
  }

  if (statistics.activeOverridesCount > statistics.totalConfigurations) {
    actions.push('Review and clean up excessive overrides')
  }

  return actions
}

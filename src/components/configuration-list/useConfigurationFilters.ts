import { useCallback, useMemo, useState } from 'react'

import { useDebouncedSearch } from '../VirtualizedList'

import type { EvaluationResult } from '../../services/unified-statsig-api'
import type { StatsigConfigurationItem } from '../../types'
import type React from 'react'

export type FilterType = 'all' | 'feature_gate' | 'experiment' | 'dynamic_config'
export type FilterStatus = 'all' | 'passed' | 'failed'

/**
 * Hook to manage configuration filtering and searching
 */
export const useConfigurationFilters = (
  configurations: StatsigConfigurationItem[],
  evaluationResults: Map<string, EvaluationResult>,
) => {
  const [debouncedSearchQuery, setSearchQuery, immediateSearchQuery] = useDebouncedSearch('', 300)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  /**
   * Filter configurations by type
   */
  const filterByType = useCallback(
    (configs: StatsigConfigurationItem[]) =>
      filterType === 'all' ? configs : configs.filter((config) => config.type === filterType),
    [filterType],
  )

  /**
   * Filter configurations by evaluation status
   */
  const filterByStatus = useCallback(
    (configs: StatsigConfigurationItem[]) => {
      if (filterStatus === 'all') return configs

      return configs.filter((config) => {
        const result = evaluationResults.get(config.name)
        if (!result) return filterStatus === 'failed'
        return filterStatus === 'passed' ? result.passed : !result.passed
      })
    },
    [filterStatus, evaluationResults],
  )

  /**
   * Filter configurations by search query (searches both name and ID)
   */
  const filterBySearch = useCallback(
    (configs: StatsigConfigurationItem[]) => {
      if (!debouncedSearchQuery.trim()) return configs

      const query = debouncedSearchQuery.toLowerCase().trim()
      return configs.filter((config) => {
        const nameMatch = config.name.toLowerCase().includes(query)
        const idMatch = config.id ? config.id.toLowerCase().includes(query) : false
        return nameMatch || idMatch
      })
    },
    [debouncedSearchQuery],
  )

  /**
   * Filter and search configurations
   */
  const filteredConfigurations = useMemo(() => {
    let filtered = configurations
    filtered = filterByType(filtered)
    filtered = filterByStatus(filtered)
    filtered = filterBySearch(filtered)
    return filtered
  }, [configurations, filterByType, filterByStatus, filterBySearch])

  /**
   * Handle search input change with debouncing
   */
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
    },
    [setSearchQuery],
  )

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterType('all')
    setFilterStatus('all')
  }, [setSearchQuery])

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(
    () => immediateSearchQuery.trim() !== '' || filterType !== 'all' || filterStatus !== 'all',
    [immediateSearchQuery, filterType, filterStatus],
  )

  return {
    searchQuery: immediateSearchQuery,
    filterType,
    filterStatus,
    filteredConfigurations,
    handleSearchChange,
    setFilterType,
    setFilterStatus,
    clearFilters,
    hasActiveFilters,
  }
}

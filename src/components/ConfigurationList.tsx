import React, { useCallback, useMemo, useState } from 'react'

import { formatTypeName, formatValue, getTypeBadgeClass } from '../utils/configuration-formatters'
import { ConfigurationStatusIndicator } from './ConfigurationStatusIndicator'
import { LoadingSpinner } from './LoadingSpinner'
import { useDebouncedSearch } from './VirtualizedList'

import type { EvaluationResult, StorageOverride } from '../services/statsig-integration'
import type { StatsigConfigurationItem } from '../types'

interface ConfigurationListProps {
  configurations: StatsigConfigurationItem[]
  evaluationResults: Map<string, EvaluationResult>
  activeOverrides?: StorageOverride[]
  onConfigurationSelect: (config: StatsigConfigurationItem) => void
  selectedConfiguration?: StatsigConfigurationItem
  isLoading?: boolean
  error?: string
  viewMode?: 'popup' | 'sidebar' | 'tab'
}

/**
 * Configuration list component with search, filter, and virtual scrolling
 */
export const ConfigurationList: React.FC<ConfigurationListProps> = React.memo(
  ({
    configurations,
    evaluationResults,
    activeOverrides = [],
    onConfigurationSelect,
    selectedConfiguration,
    isLoading = false,
    error,
    viewMode: _viewMode = 'popup',
  }) => {
    const [searchQuery, setSearchQuery] = useDebouncedSearch('', 300)
    const [filterType, setFilterType] = useState<'all' | 'feature_gate' | 'experiment' | 'dynamic_config'>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all')

    /**
     * Memoized configuration item component
     */
    const ConfigurationItem = React.memo<{
      config: StatsigConfigurationItem
      isSelected: boolean
      result?: EvaluationResult
      onSelect: (config: StatsigConfigurationItem) => void
    }>(({ config, isSelected, result, onSelect }) => {
      const handleClick = useCallback(() => {
        onSelect(config)
      }, [config, onSelect])

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        },
        [handleClick],
      )

      return (
        <div
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          className={`card-professional mx-3 my-2 cursor-pointer p-5 ${isSelected ? 'selected' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-3">
                <ConfigurationStatusIndicator result={result} size="sm" />
                <h3 className="truncate text-base font-semibold text-gray-900">{config.name}</h3>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span className={getTypeBadgeClass(config.type)}>{formatTypeName(config.type)}</span>

                {!config.enabled && (
                  <span className="type-badge bg-gray-100 text-gray-800">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                      />
                    </svg>
                    Disabled
                  </span>
                )}

                {hasOverrides(config.name) && (
                  <span className="type-badge border border-orange-200 bg-orange-100 text-orange-800">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    {getOverrideCount(config.name)} Override{getOverrideCount(config.name) !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {result && (
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {config.type === 'feature_gate' && (
                    <span className="font-medium">
                      Value:{' '}
                      <span className={result.value ? 'text-green-700' : 'text-red-700'}>
                        {formatValue(result.value)}
                      </span>
                    </span>
                  )}
                  {config.type === 'experiment' && result.groupName && (
                    <span className="font-medium">
                      Group: <span className="text-purple-700">{result.groupName}</span>
                    </span>
                  )}
                  {config.type === 'dynamic_config' && (
                    <span className="font-medium text-green-700">Configuration loaded successfully</span>
                  )}
                </div>
              )}
            </div>

            <div className="ml-4 flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )
    })

    ConfigurationItem.displayName = 'ConfigurationItem'

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
     * Filter configurations by search query
     */
    const filterBySearch = useCallback(
      (configs: StatsigConfigurationItem[]) => {
        if (!searchQuery.trim()) return configs

        const query = searchQuery.toLowerCase().trim()
        return configs.filter((config) => config.name.toLowerCase().includes(query))
      },
      [searchQuery],
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

    if (error) {
      return (
        <div className="p-4">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading configurations</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex h-full flex-col">
        {/* Search and Filter Controls */}
        <div className="border-b border-gray-200 p-4">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search configurations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'feature_gate' | 'experiment' | 'dynamic_config')
              }
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="feature_gate">Feature Gates</option>
              <option value="experiment">Experiments</option>
              <option value="dynamic_config">Dynamic Configs</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'passed' | 'failed')}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>

            {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Showing {filteredConfigurations.length} of {configurations.length} configurations
          </div>
        </div>

        {/* Configuration List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="mt-2 text-sm text-gray-600">Loading configurations...</p>
              </div>
            </div>
          ) : filteredConfigurations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No configurations available.'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredConfigurations.map((config) => {
                const isSelected = selectedConfiguration?.name === config.name
                const result = evaluationResults.get(config.name)

                return (
                  <ConfigurationItem
                    key={config.name}
                    config={config}
                    isSelected={isSelected}
                    result={result}
                    onSelect={onConfigurationSelect}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  },
)

ConfigurationList.displayName = 'ConfigurationList'

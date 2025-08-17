import React from 'react'

import {
  ConfigurationEmptyState,
  ConfigurationErrorState,
  ConfigurationItem,
  ConfigurationLoadingState,
  ConfigurationSearchAndFilters,
  useConfigurationFilters,
  useConfigurationOverrides,
} from './configuration-list'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem, StorageOverride } from '../types'

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
export const ConfigurationList = React.memo(
  ({
    configurations,
    evaluationResults,
    activeOverrides = [],
    onConfigurationSelect,
    selectedConfiguration,
    isLoading = false,
    error,
    viewMode: _viewMode = 'popup',
  }: ConfigurationListProps) => {
    // Use custom hooks for filtering and overrides logic
    const {
      searchQuery,
      filterType,
      filterStatus,
      filteredConfigurations,
      handleSearchChange,
      setFilterType,
      setFilterStatus,
      clearFilters,
      hasActiveFilters,
    } = useConfigurationFilters(configurations, evaluationResults)

    const { hasOverrides, getOverrideCount } = useConfigurationOverrides(activeOverrides)

    // Handle error state
    if (error) {
      return <ConfigurationErrorState error={error} />
    }

    return (
      <div className="flex h-full flex-col">
        {/* Search and Filter Controls */}
        <div className="relative z-30">
          <ConfigurationSearchAndFilters
            searchQuery={searchQuery}
            filterType={filterType}
            filterStatus={filterStatus}
            onSearchChange={handleSearchChange}
            onFilterTypeChange={setFilterType}
            onFilterStatusChange={setFilterStatus}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            totalConfigurations={configurations.length}
            filteredCount={filteredConfigurations.length}
          />
        </div>

        {/* Configuration List */}
        <div
          className={`custom-scrollbar min-h-0 flex-1 ${_viewMode === 'sidebar' ? 'overflow-visible' : 'overflow-y-auto'}`}
        >
          {isLoading ? (
            <ConfigurationLoadingState />
          ) : filteredConfigurations.length === 0 ? (
            <ConfigurationEmptyState hasActiveFilters={hasActiveFilters} />
          ) : (
            <div className="py-2">
              {filteredConfigurations.map((config) => {
                const isSelected = selectedConfiguration?.name === config.name
                const result = evaluationResults.get(config.name)
                const configHasOverrides = hasOverrides(config.name)
                const overrideCount = getOverrideCount(config.name)

                return (
                  <ConfigurationItem
                    key={config.name}
                    config={config}
                    isSelected={isSelected}
                    result={result}
                    onSelect={onConfigurationSelect}
                    hasOverrides={configHasOverrides}
                    overrideCount={overrideCount}
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

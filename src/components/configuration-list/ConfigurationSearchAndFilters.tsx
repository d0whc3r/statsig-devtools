import React from 'react'

import type { FilterStatus, FilterType } from './useConfigurationFilters'

interface ConfigurationSearchAndFiltersProps {
  searchQuery: string
  filterType: FilterType
  filterStatus: FilterStatus
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFilterTypeChange: (filterType: FilterType) => void
  onFilterStatusChange: (filterStatus: FilterStatus) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  totalConfigurations: number
  filteredCount: number
}

/**
 * Search and filter controls component
 */
export function ConfigurationSearchAndFilters({
  searchQuery,
  filterType,
  filterStatus,
  onSearchChange,
  onFilterTypeChange,
  onFilterStatusChange,
  onClearFilters,
  hasActiveFilters,
  totalConfigurations,
  filteredCount,
}: ConfigurationSearchAndFiltersProps) {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 p-3">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value as FilterType)}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="feature_gate">Gates</option>
          <option value="experiment">Experiments</option>
          <option value="dynamic_config">Configs</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex-shrink-0 cursor-pointer rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-2 truncate text-xs text-gray-500">
        {filteredCount} of {totalConfigurations}
      </div>
    </div>
  )
}

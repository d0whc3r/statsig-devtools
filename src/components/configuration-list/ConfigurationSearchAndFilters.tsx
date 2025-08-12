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
      <div className="mb-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
            className="input-professional w-full py-2.5 pr-4 pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value as FilterType)}
          className="input-professional min-w-0 flex-1 px-3 py-1.5 text-xs font-medium"
        >
          <option value="all">All Types</option>
          <option value="feature_gate">🚪 Gates</option>
          <option value="experiment">🧪 Experiments</option>
          <option value="dynamic_config">⚙️ Configs</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
          className="input-professional min-w-0 flex-1 px-3 py-1.5 text-xs font-medium"
        >
          <option value="all">All Status</option>
          <option value="passed">✅ Passed</option>
          <option value="failed">❌ Failed</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="icon-button-professional h-8 w-8 flex-shrink-0 text-slate-600 hover:text-red-600"
            title="Clear filters"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="font-medium">
            {filteredCount === totalConfigurations ? (
              <span>{totalConfigurations} configurations</span>
            ) : (
              <span>
                <span className="font-semibold text-blue-600">{filteredCount}</span> of {totalConfigurations}
              </span>
            )}
          </span>
        </div>
        {hasActiveFilters && <div className="text-xs font-medium text-orange-600">Filtered</div>}
      </div>
    </div>
  )
}

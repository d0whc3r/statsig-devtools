import React from 'react'

interface ConfigurationEmptyStateProps {
  hasActiveFilters: boolean
}

/**
 * Empty state component for configuration list
 */
export function ConfigurationEmptyState({ hasActiveFilters }: ConfigurationEmptyStateProps) {
  return (
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
        {hasActiveFilters ? 'Try adjusting your search or filters.' : 'No configurations available.'}
      </p>
    </div>
  )
}

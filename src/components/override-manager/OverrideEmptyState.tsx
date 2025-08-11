import type { OverrideEmptyStateProps } from './types'

/**
 * Component to display when there are no active overrides
 */
export function OverrideEmptyState({ className = '' }: OverrideEmptyStateProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-gray-50 p-4 ${className}`}>
      <div className="flex items-center text-sm text-gray-600">
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        No active overrides
      </div>
    </div>
  )
}

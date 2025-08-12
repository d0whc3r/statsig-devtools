import type { OverrideHeaderProps } from './types'

/**
 * Header component for the override manager with expand/collapse and clear all functionality
 */
export function OverrideHeader({
  overrideCount,
  isExpanded,
  compact,
  onToggleExpanded,
  onClearAll,
}: OverrideHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b border-gray-200 ${compact ? 'p-2' : 'p-4'}`}>
      <div className="flex items-center">
        <button
          onClick={onToggleExpanded}
          className={`flex cursor-pointer items-center ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 hover:text-gray-700`}
        >
          <svg
            className={`mr-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Active Overrides ({overrideCount})
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onClearAll}
          className={`cursor-pointer text-red-600 underline hover:text-red-500 ${compact ? 'text-xs' : 'text-xs'}`}
          disabled={overrideCount === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

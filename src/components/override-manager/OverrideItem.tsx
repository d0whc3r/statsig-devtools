import { useCallback } from 'react'

import { getOverrideColor, getOverrideIcon, getOverrideId, truncateValue } from './utils'

import type { ExtendedStorageOverride, OverrideItemProps } from './types'

/**
 * Individual override item component
 */
export function OverrideItem({ override, index, compact, onRemove }: OverrideItemProps) {
  const overrideId = getOverrideId(override, index)
  const extendedOverride = override as ExtendedStorageOverride

  /**
   * Handle removing this specific override
   */
  const handleRemove = useCallback(() => {
    onRemove(overrideId)
  }, [overrideId, onRemove])

  return (
    <div
      className={`flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100 ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="min-w-0 flex-1">
        <div className={`mb-2 flex items-center space-x-2 ${compact ? 'mb-1' : 'mb-2'}`}>
          <span className="text-lg">{getOverrideIcon(override.type)}</span>
          <span
            className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${getOverrideColor(override.type)}`}
          >
            {override.type}
          </span>
        </div>

        <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          {/* Feature name if this is a Statsig override */}
          {extendedOverride.featureName && (
            <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900">
              <span className="text-blue-600">Feature:</span> {extendedOverride.featureName}
              {extendedOverride.featureType && (
                <span className="ml-2 text-blue-500">({extendedOverride.featureType.replace('_', ' ')})</span>
              )}
            </div>
          )}

          <div className="font-medium text-gray-900">
            <span className="text-gray-600">Key:</span> {override.key}
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Value:</span>{' '}
            <span className="break-all">{truncateValue(override.value, compact ? 30 : 50)}</span>
          </div>

          {/* Cookie-specific details */}
          {override.type === 'cookie' && (
            <div className="mt-1 space-y-0.5 text-xs text-gray-500">
              {override.domain && (
                <div>
                  <span className="font-medium">Domain:</span> {override.domain}
                </div>
              )}
              {override.path && (
                <div>
                  <span className="font-medium">Path:</span> {override.path}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleRemove}
        className="ml-3 flex-shrink-0 rounded-md p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-500"
        title="Remove override"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  )
}

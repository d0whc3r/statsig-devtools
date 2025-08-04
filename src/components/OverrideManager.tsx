import { useCallback, useState } from 'react'

import { logger } from '../utils/logger'

import type { StorageOverride } from '../services/statsig-integration'

interface OverrideManagerProps {
  overrides: StorageOverride[]
  onRemoveOverride: (overrideId: string) => void
  onClearAllOverrides: () => void
  className?: string
}

/**
 * Component to manage and display active storage overrides
 */
export function OverrideManager({
  overrides,
  onRemoveOverride,
  onClearAllOverrides,
  className = '',
}: OverrideManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Debug log
  logger.info('OverrideManager rendered with overrides:', overrides.length, overrides)

  /**
   * Handle removing a specific override
   */
  const handleRemoveOverride = useCallback(
    (overrideId: string) => {
      logger.info('Removing override:', overrideId)
      onRemoveOverride(overrideId)
    },
    [onRemoveOverride],
  )

  /**
   * Generate override ID
   */
  const getOverrideId = useCallback(
    (override: StorageOverride, index: number) =>
      (override as StorageOverride & { id?: string }).id ||
      `${override.type}:${override.key}:${override.domain || 'default'}:${index}`,
    [],
  )

  /**
   * Handle clearing all overrides
   */
  const handleClearAll = useCallback(() => {
    if (overrides.length === 0) return
    setShowConfirmDialog(true)
  }, [overrides.length])

  /**
   * Confirm clearing all overrides
   */
  const confirmClearAll = useCallback(() => {
    logger.info('Clearing all overrides')
    onClearAllOverrides()
    setShowConfirmDialog(false)
  }, [onClearAllOverrides])

  /**
   * Cancel clearing all overrides
   */
  const cancelClearAll = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  /**
   * Get override type icon
   */
  const getOverrideIcon = (type: string) => {
    switch (type) {
      case 'localStorage':
        return '💾'
      case 'sessionStorage':
        return '🔄'
      case 'cookie':
        return '🍪'
      default:
        return '⚙️'
    }
  }

  /**
   * Get override type color
   */
  const getOverrideColor = (type: string) => {
    switch (type) {
      case 'localStorage':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sessionStorage':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cookie':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (overrides.length === 0) {
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

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
          >
            <svg
              className={`mr-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Active Overrides ({overrides.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 underline hover:text-red-500"
            disabled={overrides.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Override List */}
      {isExpanded && (
        <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto p-3">
          {overrides.map((override, index) => {
            const overrideId = getOverrideId(override, index)
            return (
              <div
                key={overrideId}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="text-lg">{getOverrideIcon(override.type)}</span>
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${getOverrideColor(override.type)}`}
                    >
                      {override.type}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    {/* Feature name if this is a Statsig override */}
                    {(override as StorageOverride & { featureName?: string }).featureName && (
                      <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900">
                        <span className="text-blue-600">Feature:</span>{' '}
                        {(override as StorageOverride & { featureName?: string }).featureName}
                        {(override as StorageOverride & { featureType?: string }).featureType && (
                          <span className="ml-2 text-blue-500">
                            ({(override as StorageOverride & { featureType?: string }).featureType?.replace('_', ' ')})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="font-medium text-gray-900">
                      <span className="text-gray-600">Key:</span> {override.key}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Value:</span>{' '}
                      <span className="break-all">
                        {typeof override.value === 'string' && override.value.length > 50
                          ? `${override.value.substring(0, 50)}...`
                          : typeof override.value === 'string'
                            ? override.value
                            : JSON.stringify(override.value)}
                      </span>
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
                  onClick={() => handleRemoveOverride(overrideId)}
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
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear All Overrides</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="mb-6 text-gray-700">
              Are you sure you want to remove all {overrides.length} override{overrides.length !== 1 ? 's' : ''}? This
              will permanently delete all active overrides.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelClearAll}
                className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

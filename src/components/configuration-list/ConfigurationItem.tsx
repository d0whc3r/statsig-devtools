import React, { useCallback } from 'react'

import { formatTypeName, formatValue, getTypeBadgeClass } from '../../utils/configuration-formatters'
import { ConfigurationStatusIndicator } from '../ConfigurationStatusIndicator'

import type { EvaluationResult } from '../../services/statsig-integration'
import type { StatsigConfigurationItem } from '../../types'

interface ConfigurationItemProps {
  config: StatsigConfigurationItem
  isSelected: boolean
  result?: EvaluationResult
  onSelect: (config: StatsigConfigurationItem) => void
  hasOverrides: boolean
  overrideCount: number
}

/**
 * Individual configuration item component
 */
export const ConfigurationItem = React.memo(
  ({ config, isSelected, result, onSelect, hasOverrides, overrideCount }: ConfigurationItemProps) => {
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

              {hasOverrides && (
                <span className="type-badge border border-orange-200 bg-orange-100 text-orange-800">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {overrideCount} Override{overrideCount !== 1 ? 's' : ''}
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
  },
)

ConfigurationItem.displayName = 'ConfigurationItem'

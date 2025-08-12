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
        className={`card-professional mx-2 my-1.5 cursor-pointer p-3 ${isSelected ? 'selected' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <ConfigurationStatusIndicator result={result} size="sm" />
              <h3 className="truncate text-sm font-semibold text-gray-900">{config.name}</h3>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`badge-professional ${getTypeBadgeClass(config.type)}`}>
                {formatTypeName(config.type)}
              </span>

              {!config.enabled && (
                <span className="badge-professional border-gray-200 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700">
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
                <span className="badge-professional border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {overrideCount}
                </span>
              )}
            </div>

            {result && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-2 text-sm">
                {config.type === 'feature_gate' && (
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${result.value ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-semibold text-slate-700">
                      Status:{' '}
                      <span className={result.value ? 'text-green-700' : 'text-red-700'}>
                        {formatValue(result.value)}
                      </span>
                    </span>
                  </div>
                )}
                {config.type === 'experiment' && (
                  <div className="space-y-2">
                    {result.groupName && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="font-semibold text-slate-700">
                          Group: <span className="text-purple-700">{result.groupName}</span>
                        </span>
                      </div>
                    )}
                    {config.groups && config.groups.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-600">Variants:</div>
                        <div className="flex flex-wrap gap-1">
                          {config.groups.map((group) => (
                            <span
                              key={group.name}
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                result.groupName === group.name
                                  ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-600'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {group.name} ({group.size}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {config.type === 'dynamic_config' && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-semibold text-green-700">Configuration Ready</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ml-2 flex-shrink-0">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    )
  },
)

ConfigurationItem.displayName = 'ConfigurationItem'

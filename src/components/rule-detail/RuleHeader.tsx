import React from 'react'

import type { StatsigConfigurationItem } from '../../types'

interface RuleHeaderProps {
  configuration: StatsigConfigurationItem
  compact: boolean
  allowOverrides: boolean
  showOverrideForm: boolean
  onOverrideButtonClick: () => void
  showExperimentOverrideForm?: boolean
  onExperimentOverrideButtonClick?: () => void
}

export function RuleHeader({
  configuration,
  compact,
  allowOverrides,
  showOverrideForm,
  onOverrideButtonClick,
  showExperimentOverrideForm = false,
  onExperimentOverrideButtonClick,
}: RuleHeaderProps) {
  return (
    <div className={compact ? 'mb-2' : 'mb-4'}>
      <div className={compact ? 'mb-1' : 'mb-2'}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              className={
                compact ? 'mb-1 text-base font-semibold text-gray-900' : 'mb-2 text-lg font-bold text-gray-900'
              }
            >
              {configuration.id || configuration.name}
            </h2>
            {configuration.id && configuration.id !== configuration.name && (
              <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>{configuration.name}</p>
            )}
          </div>

          {allowOverrides && (
            <div className="flex items-center gap-2">
              {/* Experiment Override Button - Only for experiments */}
              {configuration.type === 'experiment' && onExperimentOverrideButtonClick && (
                <button
                  onClick={onExperimentOverrideButtonClick}
                  className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
                    showExperimentOverrideForm ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-purple-500 text-white hover:bg-purple-600'
                  } flex items-center gap-1.5 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    showExperimentOverrideForm ? 'focus:ring-red-500' : 'focus:ring-purple-500'
                  } flex-shrink-0`}
                >
                  {showExperimentOverrideForm ? (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Override Group
                    </>
                  )}
                </button>
              )}
              
              {/* Regular Override Button */}
              <button
                onClick={onOverrideButtonClick}
                className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
                  showOverrideForm ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                } flex items-center gap-1.5 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                  showOverrideForm ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                } flex-shrink-0`}
              >
                {showOverrideForm ? (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Override
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`${compact ? 'mb-2' : 'mb-3'} flex flex-wrap items-center gap-2`}>
        <span
          className={`type-badge ${
            configuration.type === 'feature_gate'
              ? 'type-badge-feature-gate'
              : configuration.type === 'experiment'
                ? 'type-badge-experiment'
                : 'type-badge-dynamic-config'
          }`}
        >
          {configuration.type === 'feature_gate'
            ? 'Feature Gate'
            : configuration.type === 'experiment'
              ? 'Experiment'
              : 'Dynamic Config'}
        </span>

        {!configuration.enabled && (
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
      </div>
    </div>
  )
}

import React, { useState } from 'react'

import { RuleConditions } from './RuleConditions'
import { RuleDetailOverrideForm } from './RuleDetailOverrideForm'

import type { EvaluationResult, StorageOverride } from '../services/statsig-integration'
import type { StatsigConfigurationItem } from '../types'

interface RuleDetailProps {
  configuration: StatsigConfigurationItem
  evaluationResult?: EvaluationResult
  onOverrideCreate?: (override: StorageOverride) => void
  compact?: boolean
  allowOverrides?: boolean
}

/**
 * Rule detail component for displaying configuration rules and evaluation results
 */
export const RuleDetail: React.FC<RuleDetailProps> = ({
  configuration,
  evaluationResult,
  onOverrideCreate,
  compact = false,
  allowOverrides = true,
}) => {
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideForm, setOverrideForm] = useState<Partial<StorageOverride>>({
    type: 'localStorage',
    key: '',
    value: '',
  })

  /**
   * Get suggested override value based on configuration type and current evaluation
   */
  const getSuggestedOverrideValue = () => {
    if (configuration.type === 'feature_gate') {
      return evaluationResult?.value ? 'false' : 'true'
    } else if (configuration.type === 'dynamic_config') {
      return JSON.stringify({ overridden: true, value: 'custom_value' })
    } else if (configuration.type === 'experiment') {
      return JSON.stringify({ group: 'test_group', value: 'experiment_override' })
    }
    return 'true'
  }

  /**
   * Get suggested key for Statsig override
   */
  const getSuggestedKey = () => `statsig_override_${configuration.name}`

  /**
   * Handle override form submission
   */
  const handleOverrideSubmit = () => {
    if (!overrideForm.key || !overrideForm.value || !overrideForm.type) {
      return
    }

    const override: StorageOverride = {
      type: overrideForm.type as StorageOverride['type'],
      key: overrideForm.key,
      value: overrideForm.value,
      domain: overrideForm.domain,
      path: overrideForm.path,
      // Add metadata for Statsig-specific overrides
      id: `${configuration.name}_${Date.now()}`,
      featureName: configuration.name,
      featureType: configuration.type,
    } as StorageOverride & { featureName: string; featureType: string }

    onOverrideCreate?.(override)
    setShowOverrideForm(false)
    setOverrideForm({
      type: 'localStorage',
      key: '',
      value: '',
    })
  }

  /**
   * Format target value for display
   */
  const formatTargetValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null'
    }
    if (typeof value === 'string') {
      return `"${value}"`
    }
    if (Array.isArray(value)) {
      return `[${value.map((v) => formatTargetValue(v)).join(', ')}]`
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Configuration Header */}
        <div className={compact ? 'mb-3' : 'mb-6'}>
          {/* Title and Description */}
          <div className={compact ? 'mb-2' : 'mb-4'}>
            <h2
              className={compact ? 'mb-1 text-lg font-semibold text-gray-900' : 'mb-2 text-2xl font-bold text-gray-900'}
            >
              {configuration.name}
            </h2>
            {!compact && (
              <p className="text-sm text-gray-600">
                Configuration ID:{' '}
                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-800">{configuration.name}</span>
              </p>
            )}
          </div>

          {/* Action Button Row - Only show if overrides are allowed */}
          {allowOverrides && (
            <div className={compact ? 'mb-2' : 'mb-4'}>
              <button
                onClick={() => {
                  if (!showOverrideForm) {
                    // Pre-fill form with suggested values
                    setOverrideForm({
                      type: 'localStorage',
                      key: getSuggestedKey(),
                      value: getSuggestedOverrideValue(),
                    })
                  }
                  setShowOverrideForm(!showOverrideForm)
                }}
                className={` ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-2'} ${
                  showOverrideForm
                    ? 'scale-105 transform bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:from-red-600 hover:to-pink-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
                } flex items-center gap-2 rounded-lg border-0 font-semibold transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none ${showOverrideForm ? 'focus:ring-red-500' : 'focus:ring-blue-500'} `}
              >
                {showOverrideForm ? (
                  <>
                    <svg
                      className={compact ? 'h-3 w-3' : 'h-4 w-4'}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {compact ? 'Cancel' : 'Cancel Override'}
                  </>
                ) : (
                  <>
                    <svg
                      className={compact ? 'h-3 w-3' : 'h-4 w-4'}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {compact ? 'Override' : 'Create Override'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Configuration Type and Status */}
          <div className="mb-4 flex items-center gap-3">
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

          {/* Evaluation Result */}
          {evaluationResult && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`status-badge ${evaluationResult.passed ? 'status-badge-success' : 'status-badge-error'}`}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={evaluationResult.passed ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
                    />
                  </svg>
                  {evaluationResult.passed ? 'Pass' : 'Fail'}
                </span>
                <span className="text-sm font-medium text-gray-600">Evaluation Result</span>
              </div>

              {evaluationResult.value !== undefined && (
                <div className="mt-1 text-sm text-gray-700">
                  <span className="font-medium">Current Value:</span>{' '}
                  <span className="font-mono">{formatTargetValue(evaluationResult.value)}</span>
                </div>
              )}

              {evaluationResult.ruleId && (
                <div className="mt-1 text-sm text-gray-700">
                  <span className="font-medium">Rule ID:</span>{' '}
                  <span className="font-mono">{evaluationResult.ruleId}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Override Form - Only show if overrides are allowed */}
        {allowOverrides && showOverrideForm && (
          <RuleDetailOverrideForm
            configuration={configuration}
            overrideForm={overrideForm}
            setOverrideForm={setOverrideForm}
            onSubmit={handleOverrideSubmit}
            onCancel={() => setShowOverrideForm(false)}
            getSuggestedOverrideValue={getSuggestedOverrideValue}
            getSuggestedKey={getSuggestedKey}
          />
        )}

        {/* Rules Section */}
        <div className={compact ? 'mt-3' : 'mt-6'}>
          <RuleConditions rules={configuration.rules || []} compact={compact} />
        </div>

        {/* Default Value */}
        {configuration.defaultValue !== undefined && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-900">Default Value</h3>
            <div className="rounded-md bg-gray-50 p-3">
              <span className="font-mono text-sm text-gray-900">{formatTargetValue(configuration.defaultValue)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

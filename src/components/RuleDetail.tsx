import React, { useState } from 'react'

import { useRuleOverrideSuggestions } from '../hooks/useRuleOverrideSuggestions'
import { EvaluationResultCard } from './EvaluationResultCard'
import { RuleHeader } from './rule-detail/RuleHeader'
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
export function RuleDetail({
  configuration,
  evaluationResult,
  onOverrideCreate,
  compact = false,
  allowOverrides = true,
}: RuleDetailProps) {
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideForm, setOverrideForm] = useState<Partial<StorageOverride>>({
    type: 'localStorage',
    key: '',
    value: '',
  })

  /**
   * Get suggested override value based on configuration type and current evaluation
   */
  const { getSuggestedKey, getSuggestedOverrideValue, inferDefaultType } = useRuleOverrideSuggestions(
    configuration,
    evaluationResult,
  )

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
    <div className="h-full">
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Configuration Header */}
        <RuleHeader
          configuration={configuration}
          compact={compact}
          allowOverrides={allowOverrides}
          showOverrideForm={showOverrideForm}
          onOverrideButtonClick={() => {
            if (!showOverrideForm) {
              setOverrideForm({ type: inferDefaultType(), key: getSuggestedKey(), value: getSuggestedOverrideValue() })
            }
            setShowOverrideForm(!showOverrideForm)
          }}
        />
        {/* Evaluation Result */}
        {evaluationResult && <EvaluationResultCard result={evaluationResult} />}

        {/* Override Form - Only show if overrides are allowed (popup mode only) */}
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

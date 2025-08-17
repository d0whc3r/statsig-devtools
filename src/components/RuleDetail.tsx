import React, { useState } from 'react'

import { useRuleOverrideSuggestions } from '../hooks/useRuleOverrideSuggestions'
import { formatValue } from '../utils/configuration-formatters'
import { EvaluationResultCard } from './EvaluationResultCard'
import { ExperimentOverrideForm } from './ExperimentOverrideForm'
import { ExperimentVisualization } from './ExperimentVisualization'
import { RuleHeader } from './rule-detail/RuleHeader'
import { RuleConditions } from './RuleConditions'
import { RuleDetailOverrideForm } from './RuleDetailOverrideForm'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem, StorageOverride } from '../types'

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
  const [showExperimentOverrideForm, setShowExperimentOverrideForm] = useState(false)
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

  return (
    <div className="h-full">
      <div className={compact ? 'p-2' : 'p-3'}>
        {/* Configuration Header */}
        <RuleHeader
          configuration={configuration}
          compact={compact}
          allowOverrides={allowOverrides}
          showOverrideForm={showOverrideForm}
          showExperimentOverrideForm={showExperimentOverrideForm}
          onOverrideButtonClick={() => {
            if (!showOverrideForm) {
              setOverrideForm({ type: inferDefaultType(), key: getSuggestedKey(), value: getSuggestedOverrideValue() })
            }
            setShowOverrideForm(!showOverrideForm)
            // Close experiment form if open
            if (showExperimentOverrideForm) {
              setShowExperimentOverrideForm(false)
            }
          }}
          onExperimentOverrideButtonClick={() => {
            setShowExperimentOverrideForm(!showExperimentOverrideForm)
            // Close regular form if open
            if (showOverrideForm) {
              setShowOverrideForm(false)
            }
          }}
        />
        {/* Evaluation Result */}
        {evaluationResult && <EvaluationResultCard result={evaluationResult} />}

        {/* Experiment Override Form - Only show for experiments */}
        {allowOverrides && showExperimentOverrideForm && configuration.type === 'experiment' && (
          <div className="mt-4">
            <ExperimentOverrideForm experiment={configuration} onClose={() => setShowExperimentOverrideForm(false)} />
          </div>
        )}

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
        <div className={compact ? 'mt-2' : 'mt-3'}>
          <RuleConditions rules={configuration.rules || []} compact={compact} />
        </div>

        {/* Experiment Visualization - Only show for experiments */}
        {configuration.type === 'experiment' && configuration.groups && configuration.groups.length > 0 && (
          <div className={`${compact ? 'mt-2 mb-2' : 'mt-3 mb-3'}`}>
            <ExperimentVisualization
              configuration={configuration}
              evaluationResult={evaluationResult}
              compact={compact}
            />
          </div>
        )}

        {/* Default Value */}
        {configuration.defaultValue !== undefined && (
          <div className={`${compact ? 'mt-2 mb-2' : 'mt-3 mb-3'}`}>
            <h3 className="mb-2 text-sm font-medium text-gray-900">Default Value</h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <pre className="overflow-x-auto font-mono text-sm break-words whitespace-pre-wrap text-slate-900">
                <code>{formatValue(configuration.defaultValue)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useConfigurationEvaluation } from '../hooks/useConfigurationEvaluation'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { RuleDetail } from './RuleDetail'

import type { StorageOverride } from '../services/statsig-integration'
import type { AuthState, StatsigConfigurationItem } from '../types'

interface ConfigurationDetailPanelProps {
  authState: AuthState
  configuration: StatsigConfigurationItem
  compact?: boolean
  onClose?: () => void
}

export function ConfigurationDetailPanel({
  authState,
  configuration,
  compact = false,
  onClose,
}: ConfigurationDetailPanelProps) {
  const { evaluationResults } = useConfigurationEvaluation(authState, [configuration], [])
  const { createOverride } = useStorageOverrides()

  const handleOverrideCreate = async (override: StorageOverride) => {
    try {
      await createOverride(override)
    } catch {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="border-light border-t bg-white">
      {onClose && (
        <div className="border-b bg-gray-100 px-4 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{configuration.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close details">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className={`custom-scrollbar overflow-y-auto ${compact ? 'max-h-80' : ''}`}>
        <RuleDetail
          configuration={configuration}
          evaluationResult={evaluationResults.get(configuration.name)}
          onOverrideCreate={handleOverrideCreate}
          compact={compact}
        />
      </div>
    </div>
  )
}

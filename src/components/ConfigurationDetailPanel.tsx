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
  allowOverrides?: boolean
}

export function ConfigurationDetailPanel({
  authState,
  configuration,
  compact = false,
  onClose,
  allowOverrides = true,
}: ConfigurationDetailPanelProps) {
  const { evaluationResults } = useConfigurationEvaluation(authState, [configuration], [])
  const { activeOverrides, createOverride, removeOverride } = useStorageOverrides()

  const relatedOverrides = activeOverrides.filter((ov) => {
    const ext = ov as StorageOverride & { featureName?: string }
    if (ext.featureName) return ext.featureName === configuration.name
    return ov.key.includes(configuration.name) || String(ov.value ?? '').includes(configuration.name)
  })

  const handleOverrideCreate = async (override: StorageOverride) => {
    if (!allowOverrides) {
      return
    }

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
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Close details"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className={`custom-scrollbar overflow-y-auto ${compact ? 'max-h-80' : 'max-h-[60vh]'}`}>
        <RuleDetail
          configuration={configuration}
          evaluationResult={evaluationResults.get(configuration.name)}
          onOverrideCreate={handleOverrideCreate}
          compact={compact}
          allowOverrides={allowOverrides}
        />

        {relatedOverrides.length > 0 && (
          <div className={`mt-3 border-t ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">Active overrides for this configuration</span>
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                  {relatedOverrides.length}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {relatedOverrides.map((ov, idx) => {
                const overrideId = `${ov.type}:${ov.key}:${(ov as StorageOverride & { domain?: string }).domain || 'default'}`
                return (
                  <div
                    key={`${overrideId}:${idx}`}
                    className="flex items-center justify-between rounded border bg-gray-50 px-2 py-1 text-xs"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-row items-center gap-1">
                        <span className="rounded border px-1 font-medium text-gray-700">{ov.type}</span>
                        <span className="font-medium text-gray-800">{ov.key}</span>
                        <span className="text-gray-500">=</span>
                        <span className="break-all text-gray-700">{String(ov.value)}</span>
                      </div>
                      {ov.domain && <span className="rounded text-[10px] text-gray-600">{ov.domain}</span>}
                    </div>
                    {allowOverrides && (
                      <button
                        className="ml-2 cursor-pointer rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove override"
                        onClick={() => removeOverride(overrideId)}
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
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

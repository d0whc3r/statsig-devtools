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
  domain?: string
}

export function ConfigurationDetailPanel({
  authState,
  configuration,
  compact = false,
  onClose,
  allowOverrides = true,
  domain,
}: ConfigurationDetailPanelProps) {
  const { evaluationResults } = useConfigurationEvaluation(authState, [configuration], [])
  const { activeOverrides, createOverride, removeOverride } = useStorageOverrides(domain)

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
      <div className="flex h-full flex-col">
        {/* Main content area with proper scrolling */}
        <div className={`custom-scrollbar flex-1 overflow-y-auto ${compact ? 'max-h-80' : ''}`}>
          <RuleDetail
            configuration={configuration}
            evaluationResult={evaluationResults.get(configuration.name)}
            onOverrideCreate={handleOverrideCreate}
            compact={compact}
            allowOverrides={allowOverrides}
          />

          {/* Active overrides section - Now part of scrollable content */}
          {relatedOverrides.length > 0 && (
            <div
              className={`border-t border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${compact ? 'mx-3 mb-3 px-3 py-3' : 'mx-4 mb-4 px-4 py-4'}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-blue-800">Configuration Overrides</span>
                  <span className="badge-professional border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                    {relatedOverrides.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {relatedOverrides.map((ov, idx) => {
                  const overrideId = `${ov.type}:${ov.key}:${(ov as StorageOverride & { domain?: string }).domain || 'default'}`
                  return (
                    <div key={`${overrideId}:${idx}`} className="card-professional bg-white/80 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-col gap-2">
                          <div className="flex flex-row flex-wrap items-center gap-2">
                            <span className="badge-professional border-slate-200 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700">
                              {ov.type}
                            </span>
                            <span className="font-semibold text-slate-800">{ov.key}</span>
                            <span className="text-slate-500">=</span>
                            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-sm break-all text-slate-700">
                              {String(ov.value)}
                            </span>
                          </div>
                          {ov.domain && (
                            <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              📍 {ov.domain}
                            </span>
                          )}
                        </div>
                        {allowOverrides && (
                          <button
                            className="icon-button-professional ml-3 h-8 w-8 flex-shrink-0 text-slate-600 hover:border-red-200 hover:text-red-600"
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

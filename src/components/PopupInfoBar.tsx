import { useDashboardStatistics } from '../hooks/useDashboardStatistics'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { ActiveTabInfo } from './ActiveTabInfo'
import { DashboardStatistics } from './DashboardStatistics'

import type { StorageOverride } from '../services/statsig-integration'
import type { AuthState } from '../types'

interface PopupInfoBarProps {
  authState: AuthState
  viewMode: 'popup' | 'sidebar' | 'tab'
  activeOverrides?: StorageOverride[]
}

export function PopupInfoBar({ authState, viewMode, activeOverrides: overridesFromProps }: PopupInfoBarProps) {
  const { statistics } = useDashboardStatistics(authState)
  const { activeOverrides } = useStorageOverrides()
  const overridesToDisplay = overridesFromProps ?? activeOverrides

  // For tab mode, show the full dashboard statistics
  if (viewMode === 'tab') {
    return <DashboardStatistics statistics={statistics} />
  }

  // Compact, responsive layout for popup and sidebar
  return (
    <div
      className={`border-b border-gray-200 ${viewMode === 'sidebar' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-white to-slate-50'}`}
    >
      <div className="px-4 py-3">
        <div className="flex flex-wrap-reverse items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="badge-professional badge-feature-gate">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {statistics.configurationsByType.feature_gate || 0}
              </div>
              <div className="badge-professional badge-dynamic-config">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                </svg>
                {statistics.configurationsByType.dynamic_config || 0}
              </div>
              <div className="badge-professional badge-experiment">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                {statistics.configurationsByType.experiment || 0}
              </div>
            </div>
            {overridesToDisplay.length > 0 && (
              <div
                className={`badge-professional ${viewMode === 'sidebar' ? 'border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700' : 'border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                {overridesToDisplay.length}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <ActiveTabInfo compact />
          </div>
        </div>
      </div>
    </div>
  )
}

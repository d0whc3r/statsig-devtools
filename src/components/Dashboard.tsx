import { useConfigurationData } from '../hooks/useConfigurationData'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { DashboardContent } from './DashboardContent'
import { DashboardHeader } from './DashboardHeader'
import { LoadingSpinner } from './LoadingSpinner'
import { OverrideManager } from './OverrideManager'
import { PopupInfoBar } from './PopupInfoBar'

import type { AuthState } from '../types'

interface DashboardProps {
  authState: AuthState
  isPopupMode?: boolean
  viewMode?: 'popup' | 'sidebar' | 'tab'
}

/**
 * Main dashboard component that orchestrates the configuration management
 */
export function Dashboard({ authState, isPopupMode = false, viewMode = 'popup' }: DashboardProps) {
  const { isLoading } = useConfigurationData(authState)
  const { activeOverrides, removeOverride, clearAllOverrides } = useStorageOverrides()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${viewMode === 'tab' || viewMode === 'sidebar' ? 'min-h-full' : 'h-full'}`}>
      {/* Header */}
      <DashboardHeader authState={authState} isPopupMode={isPopupMode} />

      {/* Statistics/Info Bar - Show in popup and sidebar modes */}
      {(viewMode === 'popup' || viewMode === 'sidebar') && <PopupInfoBar authState={authState} viewMode={viewMode} />}

      {/* Main Content */}
      <div className={`flex-1 ${viewMode === 'tab' || viewMode === 'sidebar' ? '' : 'overflow-hidden'}`}>
        <DashboardContent authState={authState} viewMode={viewMode} />
      </div>

      {/* Override Manager - Only show in popup mode when there are active overrides */}
      {viewMode === 'popup' && activeOverrides.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
          <OverrideManager
            overrides={activeOverrides}
            onRemoveOverride={removeOverride}
            onClearAllOverrides={clearAllOverrides}
            compact
          />
        </div>
      )}

      {/* Readonly Override Display - Show in sidebar mode when there are active overrides */}
      {viewMode === 'sidebar' && activeOverrides.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Active Overrides (Read-only - Use popup to modify)
          </div>
          <div className="space-y-1">
            {activeOverrides.map((override, index) => (
              <div key={index} className="rounded border bg-white px-2 py-1 text-xs">
                <span className="font-medium">{override.key}:</span> {String(override.value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

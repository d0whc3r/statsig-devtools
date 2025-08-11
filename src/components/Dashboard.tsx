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
  onLogout: () => void
  isPopupMode?: boolean
  viewMode?: 'popup' | 'sidebar' | 'tab'
}

/**
 * Main dashboard component that orchestrates the configuration management
 */
export const Dashboard = ({ authState, onLogout, isPopupMode = false, viewMode = 'popup' }: DashboardProps) => {
  const { isLoading } = useConfigurationData(authState)
  const { activeOverrides, removeOverride, clearAllOverrides } = useStorageOverrides()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <DashboardHeader authState={authState} isPopupMode={isPopupMode} onLogout={onLogout} />

      {/* Statistics/Info Bar - Only show in popup mode */}
      {viewMode === 'popup' && <PopupInfoBar authState={authState} viewMode={viewMode} />}

      {/* Main Content */}
      <DashboardContent authState={authState} viewMode={viewMode} />

      {/* Override Manager - Only show in popup mode when there are active overrides */}
      {viewMode === 'popup' && activeOverrides.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-3">
          <OverrideManager
            overrides={activeOverrides}
            onRemoveOverride={removeOverride}
            onClearAllOverrides={clearAllOverrides}
            compact
          />
        </div>
      )}
    </div>
  )
}

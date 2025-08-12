import { useActiveTab } from '../hooks/useActiveTab'
import { useConfigurationData } from '../hooks/useConfigurationData'
import { useSidebarAutoRefresh } from '../hooks/useSidebarAutoRefresh'
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
  const { isLoading, refreshConfigurations } = useConfigurationData(authState)
  const { activeOverrides, removeOverride, clearAllOverrides } = useStorageOverrides()
  const { refreshTabInfo } = useActiveTab()

  // Enable auto-refresh only for sidebar mode
  useSidebarAutoRefresh(refreshConfigurations, refreshTabInfo, viewMode === 'sidebar')

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
    <div
      className={`flex flex-col ${viewMode === 'sidebar' ? 'h-full' : viewMode === 'tab' ? 'min-h-full' : 'h-full'}`}
    >
      {/* Header - Fixed at top */}
      <div className={`flex-shrink-0 ${viewMode === 'sidebar' ? 'px-4' : ''}`}>
        <DashboardHeader authState={authState} isPopupMode={isPopupMode} />
        {/* Statistics/Info Bar - Show in popup and sidebar modes */}
        {(viewMode === 'popup' || viewMode === 'sidebar') && <PopupInfoBar authState={authState} viewMode={viewMode} />}
      </div>

      {/* Main Content - Scrollable area */}
      <div
        className={`flex-1 ${viewMode === 'sidebar' ? 'overflow-hidden px-4' : viewMode === 'tab' ? '' : 'overflow-hidden'}`}
      >
        <DashboardContent authState={authState} viewMode={viewMode} />
      </div>

      {/* Override Manager - Fixed at bottom for both popup and sidebar */}
      {(viewMode === 'popup' || viewMode === 'sidebar') && activeOverrides.length > 0 && (
        <div
          className={`flex-shrink-0 border-t border-gray-200 bg-white ${viewMode === 'sidebar' ? 'px-4 py-3' : 'p-3'}`}
        >
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

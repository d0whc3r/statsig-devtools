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
 * Get dashboard container styles based on view mode
 */
const getDashboardContainerStyles = (viewMode: string) => {
  const baseStyles = 'flex flex-col'
  const viewModeStyles = {
    sidebar: 'h-full',
    tab: 'min-h-full',
    popup: 'h-full',
  }
  return `${baseStyles} ${viewModeStyles[viewMode as keyof typeof viewModeStyles] || viewModeStyles.popup}`
}

/**
 * Get header container styles based on view mode
 */
const getHeaderContainerStyles = (viewMode: string) => `flex-shrink-0 ${viewMode === 'sidebar' ? 'px-4' : ''}`

/**
 * Get main content styles based on view mode
 */
const getMainContentStyles = (viewMode: string) => {
  const baseStyles = 'flex-1'
  const viewModeStyles = {
    sidebar: 'overflow-hidden px-4',
    tab: '',
    popup: 'overflow-hidden',
  }
  return `${baseStyles} ${viewModeStyles[viewMode as keyof typeof viewModeStyles] || viewModeStyles.popup}`
}

/**
 * Get override manager styles based on view mode
 */
const getOverrideManagerStyles = (viewMode: string) => {
  const baseStyles = 'flex-shrink-0 border-t border-gray-200 bg-white'
  return `${baseStyles} ${viewMode === 'sidebar' ? 'px-4 py-3' : 'p-3'}`
}

/**
 * Check if info bar should be shown
 */
const shouldShowInfoBar = (viewMode: string) => viewMode === 'popup' || viewMode === 'sidebar'

/**
 * Check if override manager should be shown
 */
const shouldShowOverrideManager = (viewMode: string, hasOverrides: boolean) =>
  (viewMode === 'popup' || viewMode === 'sidebar') && hasOverrides

/**
 * Main dashboard component that orchestrates the configuration management
 */
export function Dashboard({ authState, isPopupMode = false, viewMode = 'popup' }: DashboardProps) {
  const { isLoading, refreshConfigurations } = useConfigurationData(authState)
  const { tabInfo, refreshTabInfo } = useActiveTab()
  const { activeOverrides, removeOverride, clearAllOverrides } = useStorageOverrides(tabInfo.domain ?? undefined)

  // Enable auto-refresh only for sidebar mode
  useSidebarAutoRefresh(refreshConfigurations, refreshTabInfo, viewMode === 'sidebar')

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={getDashboardContainerStyles(viewMode)}>
      {/* Header - Fixed at top */}
      <div className={getHeaderContainerStyles(viewMode)}>
        <DashboardHeader authState={authState} isPopupMode={isPopupMode} />
        {/* Statistics/Info Bar - Show in popup and sidebar modes */}
        {shouldShowInfoBar(viewMode) && (
          <PopupInfoBar authState={authState} viewMode={viewMode} activeOverrides={activeOverrides} />
        )}
      </div>

      {/* Main Content - Scrollable area */}
      <div className={getMainContentStyles(viewMode)}>
        <DashboardContent authState={authState} viewMode={viewMode} />
      </div>

      {/* Override Manager - Fixed at bottom for both popup and sidebar */}
      {shouldShowOverrideManager(viewMode, activeOverrides.length > 0) && (
        <div className={getOverrideManagerStyles(viewMode)}>
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

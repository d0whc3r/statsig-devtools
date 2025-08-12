import { useDashboardStatistics } from '../hooks/useDashboardStatistics'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { ActiveTabInfo } from './ActiveTabInfo'
import { DashboardStatistics } from './DashboardStatistics'

import type { AuthState } from '../types'

interface PopupInfoBarProps {
  authState: AuthState
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function PopupInfoBar({ authState, viewMode }: PopupInfoBarProps) {
  const { statistics } = useDashboardStatistics(authState)
  const { activeOverrides } = useStorageOverrides()

  // For tab mode, show the full dashboard statistics
  if (viewMode === 'tab') {
    return <DashboardStatistics statistics={statistics} />
  }

  // Compact, responsive layout for popup and sidebar
  return (
    <div className={`border-b border-gray-200 ${viewMode === 'sidebar' ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="grid grid-cols-2 gap-2 px-3 py-2 text-xs sm:grid-cols-3">
        <div className="flex flex-wrap items-center gap-2 text-gray-600">
          <span className="font-medium">Gates: {statistics.configurationsByType.feature_gate || 0}</span>
          <span className="font-medium">Configs: {statistics.configurationsByType.dynamic_config || 0}</span>
          <span className="font-medium">Experiments: {statistics.configurationsByType.experiment || 0}</span>
          {activeOverrides.length > 0 && (
            <span className={`font-bold ${viewMode === 'sidebar' ? 'text-blue-700' : 'text-blue-600'}`}>
              Overrides: {activeOverrides.length}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-end sm:col-span-1">
          <ActiveTabInfo compact />
        </div>
      </div>
    </div>
  )
}

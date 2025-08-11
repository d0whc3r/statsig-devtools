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

  // For popup and sidebar modes, show the compact info bar
  return (
    <div className={`border-b border-gray-200 px-3 py-2 ${viewMode === 'sidebar' ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="font-medium">Gates: {statistics.configurationsByType.feature_gate || 0}</span>
          <span className="font-medium">Configs: {statistics.configurationsByType.dynamic_config || 0}</span>
          <span className="font-medium">Experiments: {statistics.configurationsByType.experiment || 0}</span>
          {activeOverrides.length > 0 && (
            <span className={`font-bold ${viewMode === 'sidebar' ? 'text-blue-700' : 'text-blue-600'}`}>
              Overrides: {activeOverrides.length}
            </span>
          )}
          {viewMode === 'sidebar' && <span className="font-medium text-blue-700">• Read-only</span>}
        </div>
        <ActiveTabInfo compact />
      </div>
    </div>
  )
}

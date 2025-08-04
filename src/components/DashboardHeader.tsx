import { useDashboardHeader } from '../hooks/useDashboardHeader'
import { LoadingSpinner } from './LoadingSpinner'

import type { AuthState } from '../types'

interface DashboardHeaderProps {
  authState: AuthState
  isPopupMode: boolean
  onLogout: () => void
}

export function DashboardHeader({ authState, isPopupMode, onLogout }: DashboardHeaderProps) {
  const { isLoading, isEvaluating, refreshConfigurations } = useDashboardHeader(authState)
  return (
    <div className={`header-professional ${isPopupMode ? 'px-4 py-2' : 'px-6 py-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isPopupMode && (
            <div className="flex items-center gap-3">
              <div className="from-statsig-500 to-statsig-700 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-primary text-xl font-bold">Statsig Developer Tools</h1>
            </div>
          )}
          {isEvaluating && (
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium text-blue-700">Evaluating...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshConfigurations}
            disabled={isLoading || isEvaluating}
            className="btn-icon btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={onLogout}
            className="text-muted hover:text-secondary rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

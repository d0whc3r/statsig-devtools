import { useDashboardHeader } from '../hooks/useDashboardHeader'
import { ExtensionInfo } from './ExtensionInfo'
import { LoadingSpinner } from './LoadingSpinner'

import type { AuthState } from '../types'

interface DashboardHeaderProps {
  authState: AuthState
  isPopupMode: boolean
}

export function DashboardHeader({ authState, isPopupMode }: DashboardHeaderProps) {
  const { isEvaluating } = useDashboardHeader(authState)

  return (
    <div className={`header-professional ${isPopupMode ? 'px-4 py-2' : 'px-6 py-4'}`}>
      {/* Main header content */}
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
              <div>
                <h1 className="text-primary text-xl font-bold">Statsig Developer Tools</h1>
                <ExtensionInfo compact className="mt-0.5" />
              </div>
            </div>
          )}
          {isEvaluating && (
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium text-blue-700">Evaluating...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

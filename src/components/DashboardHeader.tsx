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
    <div className={`${isPopupMode ? 'px-4 py-3' : 'px-6 py-5'}`}>
      {/* Main header content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isPopupMode && (
            <div className="flex items-center gap-4">
              <div className="logo-professional flex h-10 w-10 items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
                  Statsig Developer Tools
                </h1>
                <ExtensionInfo compact className="mt-1" />
              </div>
            </div>
          )}
          {isEvaluating && (
            <div className="flex items-center gap-3 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 shadow-sm">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-semibold text-blue-700">Evaluating configurations...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

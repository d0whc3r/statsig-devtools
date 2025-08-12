import React from 'react'

import { useActiveTab } from '../hooks/useActiveTab'
import { useAuth } from '../hooks/useAuth'
import { useDashboardHeader } from '../hooks/useDashboardHeader'
import { AuthForm } from './auth'
import { Dashboard } from './Dashboard'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSpinner } from './LoadingSpinner'
import { ViewModeToggle } from './ViewModeToggle'

import type { ViewMode } from '../services/view-mode'
import type { AuthState } from '../types'

/**
 * Get container styles based on view mode
 */
const getContainerStyles = (viewMode: ViewMode) => {
  const isTabMode = viewMode === 'tab'
  const isPopupMode = viewMode === 'popup'
  const isSidebarMode = viewMode === 'sidebar'

  return `flex flex-col ${
    isTabMode
      ? 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
      : isPopupMode
        ? 'popup-layout bg-gray-50'
        : isSidebarMode
          ? 'h-screen bg-gray-50 overflow-hidden'
          : 'h-screen bg-gray-50'
  }`
}

/**
 * Get header styles based on view mode
 */
const getHeaderStyles = (viewMode: ViewMode) => {
  const isTabMode = viewMode === 'tab'
  const isPopupMode = viewMode === 'popup'
  return `bg-white border-b border-gray-200 flex items-center justify-between shadow-sm ${
    isTabMode ? 'px-8 py-4' : isPopupMode ? 'px-2 py-2' : 'px-4 py-3'
  }`
}

/**
 * Get logo styles based on view mode
 */
const getLogoStyles = (viewMode: ViewMode) => {
  const isTabMode = viewMode === 'tab'
  const isPopupMode = viewMode === 'popup'
  return `bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center ${
    isTabMode ? 'h-10 w-10' : isPopupMode ? 'h-6 w-6' : 'h-8 w-8'
  }`
}

interface AppLayoutProps {
  viewMode: ViewMode
}

/**
 * Common layout component shared between popup and sidepanel
 */
export function AppLayout({ viewMode }: AppLayoutProps) {
  const { authState, handleAuthenticated, handleLogout } = useAuth()

  // Loading state
  if (authState.isLoading) {
    return (
      <div className={`flex items-center justify-center ${getContainerStyles(viewMode)}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading Statsig Developer Tools...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={getContainerStyles(viewMode)}>
        {/* Header */}
        <div className={getHeaderStyles(viewMode)}>
          <div className={`flex items-center ${viewMode === 'popup' ? 'gap-1' : 'gap-3'}`}>
            {/* Show action buttons when authenticated, logo when not */}
            {authState.isAuthenticated ? (
              <HeaderActionButtons viewMode={viewMode} authState={authState} onLogout={handleLogout} />
            ) : (
              <div className={getLogoStyles(viewMode)}>
                <svg
                  className={`text-white ${viewMode === 'tab' ? 'h-6 w-6' : viewMode === 'popup' ? 'h-4 w-4' : 'h-5 w-5'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            )}
            {/* Avoid double title: show compact title only in popup, rely on DashboardHeader elsewhere */}
            {viewMode === 'popup' && <span className="text-xs font-semibold text-gray-900">Statsig Tools</span>}
          </div>

          <ViewModeToggle currentMode={viewMode} />
        </div>

        {/* Main Content with consistent side padding for tab/sidebar */}
        <div
          className={
            viewMode === 'popup'
              ? 'popup-content'
              : viewMode === 'sidebar'
                ? 'flex flex-1 flex-col overflow-hidden'
                : viewMode === 'tab'
                  ? 'flex-1 px-6'
                  : 'flex-1 overflow-hidden'
          }
        >
          {authState.isAuthenticated ? (
            <Dashboard authState={authState} isPopupMode={viewMode === 'popup'} viewMode={viewMode} />
          ) : (
            <div
              className={`${
                viewMode === 'popup'
                  ? 'flex flex-1 items-center justify-center overflow-hidden'
                  : `flex items-center justify-center p-4 ${viewMode === 'tab' ? 'min-h-[calc(100vh-80px)]' : 'h-full'}`
              }`}
            >
              <div
                className={`w-full ${viewMode === 'tab' ? 'max-w-2xl' : 'max-w-md'} ${viewMode === 'popup' ? 'px-4' : ''}`}
              >
                <AuthForm onAuthenticated={handleAuthenticated} initialError={authState.error} viewMode={viewMode} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

/**
 * Header action buttons component (refresh and logout)
 */
interface HeaderActionButtonsProps {
  viewMode: ViewMode
  authState: AuthState
  onLogout: () => void
}

function HeaderActionButtons({ viewMode, authState, onLogout }: HeaderActionButtonsProps) {
  const { isLoading, isEvaluating, refreshConfigurations } = useDashboardHeader(authState)
  const { refreshTabInfo } = useActiveTab()

  const isPopupMode = viewMode === 'popup'
  const buttonSize = isPopupMode ? 'h-6 w-6' : 'h-7 w-7'
  const iconSize = isPopupMode ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <div className="flex items-center gap-1">
      {/* Refresh Button */}
      <button
        onClick={() => {
          refreshConfigurations()
          refreshTabInfo()
        }}
        disabled={isLoading || isEvaluating}
        className={`flex ${buttonSize} items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50`}
        title="Refresh configurations and tab info"
      >
        <svg className={`${iconSize}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`flex ${buttonSize} items-center justify-center rounded-md bg-red-100 text-red-600 transition-colors hover:bg-red-200 hover:text-red-800`}
        title="Logout"
      >
        <svg className={`${iconSize}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  )
}

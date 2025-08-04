import React from 'react'

import { useAuth } from '../hooks/useAuth'
import { AuthComponent } from './AuthComponent'
import { Dashboard } from './Dashboard'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSpinner } from './LoadingSpinner'
import { ViewModeToggle } from './ViewModeToggle'

import type { ViewMode } from '../services/view-mode'

/**
 * Get container styles based on view mode
 */
const getContainerStyles = (viewMode: ViewMode) => {
  const isTabMode = viewMode === 'tab'
  const isPopupMode = viewMode === 'popup'

  return `flex flex-col ${
    isTabMode
      ? 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
      : isPopupMode
        ? 'h-full bg-gray-50'
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

/**
 * Get title component based on view mode
 */
const getTitleComponent = (viewMode: ViewMode) => {
  const isPopupMode = viewMode === 'popup'
  const isTabMode = viewMode === 'tab'
  const isSidebarMode = viewMode === 'sidebar'

  if (isPopupMode) {
    return <span className="text-xs font-semibold text-gray-900">Statsig Tools</span>
  }

  return (
    <>
      <h1 className={`font-bold text-gray-900 ${isTabMode ? 'text-2xl' : 'text-lg'}`}>Statsig Developer Tools</h1>
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          isTabMode
            ? 'bg-purple-100 text-purple-800'
            : isSidebarMode
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isTabMode ? 'Full Tab' : isSidebarMode ? 'Sidebar' : 'Popup'}
      </span>
    </>
  )
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
            {getTitleComponent(viewMode)}
          </div>

          <ViewModeToggle currentMode={viewMode} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {authState.isAuthenticated ? (
            <Dashboard authState={authState} onLogout={handleLogout} isPopupMode viewMode={viewMode} />
          ) : (
            <div
              className={`flex items-center justify-center p-4 ${
                viewMode === 'tab' ? 'min-h-[calc(100vh-80px)]' : 'h-full'
              }`}
            >
              <div className={`w-full ${viewMode === 'tab' ? 'max-w-2xl' : 'max-w-md'}`}>
                <AuthComponent
                  onAuthenticated={handleAuthenticated}
                  initialError={authState.error}
                  viewMode={viewMode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

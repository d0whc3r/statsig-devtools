import React, { useState } from 'react'

import { type ViewMode, viewModeService } from '../services/view-mode'
import { logger } from '../utils/logger'

/**
 * Get button configuration based on target mode
 */
const getButtonConfig = (targetMode: ViewMode) => ({
  text: targetMode === 'tab' ? 'Open in Tab' : targetMode === 'sidebar' ? 'Open Sidebar' : 'Switch to Popup',
  mobileText: targetMode === 'tab' ? 'Tab' : targetMode === 'sidebar' ? 'Sidebar' : 'Popup',
  iconPath:
    targetMode === 'tab'
      ? 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      : targetMode === 'sidebar'
        ? 'M4 6h16M4 10h16M4 14h16M4 18h16'
        : 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
})

/**
 * Get button styling based on target mode, loading state, and current mode
 */
const getButtonStyle = (targetMode: ViewMode, isLoading: boolean, currentMode: ViewMode) => {
  const isPopup = currentMode === 'popup'
  const baseStyle = isPopup
    ? 'group relative inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium text-xs transition-all duration-200 ease-in-out'
    : 'group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out'

  const colorStyle =
    targetMode === 'tab'
      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-lg'
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'

  const interactionStyle = isLoading
    ? 'opacity-75 cursor-not-allowed'
    : isPopup
      ? 'hover:scale-102 active:scale-95'
      : 'hover:scale-105 active:scale-95'
  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  return `${baseStyle} ${colorStyle} ${interactionStyle} ${disabledStyle}`
}

interface ViewModeToggleProps {
  currentMode: ViewMode
  className?: string
}

/**
 * Toggle component for switching between popup and sidebar modes
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentMode, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      if (currentMode === 'popup') {
        await viewModeService.switchToTab()
      } else if (currentMode === 'sidebar') {
        await viewModeService.switchToTab()
      } else {
        await viewModeService.switchToPopup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch view mode')
      // Log error for debugging
      logger.error('View mode toggle error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getTargetMode = (): ViewMode => {
    if (currentMode === 'popup') return 'tab'
    if (currentMode === 'sidebar') return 'tab'
    return 'popup'
  }

  const targetMode = getTargetMode()
  const isSupported = viewModeService.isSidebarSupported()

  if (!isSupported && targetMode === 'sidebar') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-gray-500">Sidebar not supported</span>
      </div>
    )
  }

  const buttonConfig = getButtonConfig(targetMode)
  const buttonStyle = getButtonStyle(targetMode, isLoading, currentMode)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {error && (
        <div className="max-w-32 truncate text-xs text-red-600" title={error}>
          {error}
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={buttonStyle}
        title={`Switch to ${targetMode} mode`}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className={`animate-spin ${currentMode === 'popup' ? 'h-3 w-3' : 'h-4 w-4'}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Icon */}
        {!isLoading && (
          <svg
            className={`transition-transform group-hover:scale-110 ${currentMode === 'popup' ? 'h-3 w-3' : 'h-4 w-4'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={buttonConfig.iconPath} />
          </svg>
        )}

        {/* Text */}
        {currentMode === 'popup' ? (
          <span className="text-xs">{buttonConfig.mobileText}</span>
        ) : (
          <>
            <span className="hidden sm:inline">{isLoading ? 'Switching...' : buttonConfig.text}</span>
            <span className="sm:hidden">{buttonConfig.mobileText}</span>
          </>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-10" />
      </button>

      {/* Info tooltip for first-time users - hide in popup mode */}
      {currentMode === 'sidebar' && (
        <div className="hidden items-center lg:flex">
          <div className="group relative">
            <svg
              className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Open in full tab for the best experience
              <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

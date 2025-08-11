import React from 'react'

import type { ViewMode } from '../../services/view-mode'

interface ReadOnlyTooltipProps {
  currentMode: ViewMode
}

/**
 * Tooltip component for read-only modes
 */
export function ReadOnlyTooltip({ currentMode }: ReadOnlyTooltipProps) {
  // Only show for sidebar and tab modes
  if (currentMode !== 'sidebar' && currentMode !== 'tab') {
    return null
  }

  const tooltipText =
    currentMode === 'sidebar'
      ? 'Sidebar is read-only. Use popup for overrides.'
      : 'Tab mode is read-only. Use popup for overrides.'

  return (
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
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  )
}

import React from 'react'

import type { ViewMode } from '../../services/view-mode'
import type { ButtonConfig } from '../../utils/viewModeToggleConfig'

interface ToggleIconProps {
  currentMode: ViewMode
  buttonConfig: ButtonConfig
}

/**
 * Icon component for view mode toggle button
 */
export function ToggleIcon({ currentMode, buttonConfig }: ToggleIconProps) {
  const iconSize = currentMode === 'popup' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <svg
      className={`transition-transform group-hover:scale-110 ${iconSize}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={buttonConfig.iconPath} />
    </svg>
  )
}

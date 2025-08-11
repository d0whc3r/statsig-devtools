import React from 'react'

import type { ViewMode } from '../../services/view-mode'
import type { ButtonConfig } from '../../utils/viewModeToggleConfig'

interface ToggleTextProps {
  currentMode: ViewMode
  buttonConfig: ButtonConfig
  isLoading: boolean
}

/**
 * Text component for view mode toggle button
 */
export function ToggleText({ currentMode, buttonConfig, isLoading }: ToggleTextProps) {
  if (currentMode === 'popup') {
    return <span className="text-xs">{buttonConfig.mobileText}</span>
  }

  return (
    <>
      <span className="hidden sm:inline">{isLoading ? 'Switching...' : buttonConfig.text}</span>
      <span className="sm:hidden">{buttonConfig.mobileText}</span>
    </>
  )
}

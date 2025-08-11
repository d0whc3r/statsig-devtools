import React from 'react'

import { LoadingSpinner } from './LoadingSpinner'
import { ToggleIcon } from './ToggleIcon'
import { ToggleText } from './ToggleText'

import type { ViewMode } from '../../services/view-mode'
import type { ButtonConfig } from '../../utils/viewModeToggleConfig'

interface ToggleButtonProps {
  currentMode: ViewMode
  targetMode: ViewMode
  buttonConfig: ButtonConfig
  buttonStyle: string
  isLoading: boolean
  onToggle: () => void
}

/**
 * Main toggle button component
 */
export function ToggleButton({
  currentMode,
  targetMode,
  buttonConfig,
  buttonStyle,
  isLoading,
  onToggle,
}: ToggleButtonProps) {
  const tooltipText = `Switch to ${targetMode} mode${targetMode !== 'popup' ? ' (read-only)' : ' (full functionality)'}`

  return (
    <button onClick={onToggle} disabled={isLoading} className={buttonStyle} title={tooltipText}>
      {/* Loading spinner */}
      {isLoading && <LoadingSpinner currentMode={currentMode} />}

      {/* Icon */}
      {!isLoading && <ToggleIcon currentMode={currentMode} buttonConfig={buttonConfig} />}

      {/* Text */}
      <ToggleText currentMode={currentMode} buttonConfig={buttonConfig} isLoading={isLoading} />

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-10" />
    </button>
  )
}

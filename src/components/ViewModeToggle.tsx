import React from 'react'

import { useViewModeToggle } from '../hooks/useViewModeToggle'
import { getButtonConfig, getButtonStyle } from '../utils/viewModeToggleConfig'
import { DebugButton, ErrorDisplay, ReadOnlyTooltip, ToggleButton, UnsupportedMessage } from './ViewModeToggle/index'

import type { ViewMode } from '../services/view-mode'

interface ViewModeToggleProps {
  currentMode: ViewMode
  className?: string
}

/**
 * Toggle component for switching between popup and sidebar modes
 */
export function ViewModeToggle({ currentMode, className = '' }: ViewModeToggleProps) {
  const { isLoading, error, targetMode, isSupported, handleToggle, handleDebugTest } = useViewModeToggle(currentMode)

  // Show unsupported message if sidebar is not supported
  if (!isSupported && targetMode === 'sidebar') {
    return <UnsupportedMessage className={className} />
  }

  const buttonConfig = getButtonConfig(targetMode)
  const buttonStyle = getButtonStyle(targetMode, isLoading, currentMode)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ErrorDisplay error={error} />
      <DebugButton currentMode={currentMode} onDebugTest={handleDebugTest} />
      <ToggleButton
        currentMode={currentMode}
        targetMode={targetMode}
        buttonConfig={buttonConfig}
        buttonStyle={buttonStyle}
        isLoading={isLoading}
        onToggle={handleToggle}
      />
      <ReadOnlyTooltip currentMode={currentMode} />
    </div>
  )
}

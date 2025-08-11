import React from 'react'

import type { ViewMode } from '../../services/view-mode'

interface DebugButtonProps {
  currentMode: ViewMode
  onDebugTest: () => void
}

/**
 * Debug button component (development only)
 */
export function DebugButton({ currentMode, onDebugTest }: DebugButtonProps) {
  // Only show in development mode and popup mode
  if (process.env.NODE_ENV !== 'development' || currentMode !== 'popup') {
    return null
  }

  return (
    <button
      onClick={onDebugTest}
      className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
      title="Test sidebar API"
    >
      🔧
    </button>
  )
}

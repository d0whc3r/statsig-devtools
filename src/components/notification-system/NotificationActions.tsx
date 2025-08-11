import React from 'react'

import type { ErrorRecoveryAction } from '../../services/error-handler'

interface NotificationActionsProps {
  actions: ErrorRecoveryAction[]
  onActionClick: (action: ErrorRecoveryAction) => void
}

/**
 * Action buttons component for notifications
 */
export function NotificationActions({ actions, onActionClick }: NotificationActionsProps) {
  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionClick(action)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            action.primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

import React from 'react'

import { NotificationItem } from './NotificationItem'

import type { Notification } from './types'

interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onClearAll: () => void
}

/**
 * Container component for displaying notifications with clear all option
 */
export function NotificationContainer({ notifications, onDismiss, onClearAll }: NotificationContainerProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}

      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button onClick={onClearAll} className="cursor-pointer text-xs text-gray-500 underline hover:text-gray-700">
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

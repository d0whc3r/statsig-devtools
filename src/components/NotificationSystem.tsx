import React, { useEffect } from 'react'

import { NotificationContainer, useNotificationManager } from './notification-system'

import type { NotificationSystemProps } from './notification-system'

/**
 * Main notification system component that orchestrates all notification functionality
 */
export function NotificationSystem({ maxNotifications = 5, defaultDuration = 5000 }: NotificationSystemProps) {
  const { notifications, addNotification, removeNotification, clearAll, addErrorNotification } = useNotificationManager(
    maxNotifications,
    defaultDuration,
  )

  // Expose methods globally for development (this could be replaced with React Context)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      ;(window as unknown as Record<string, unknown>).notificationSystem = {
        addNotification,
        addErrorNotification,
        removeNotification,
        clearAll,
      }
    }
  }, [addNotification, addErrorNotification, removeNotification, clearAll])

  return <NotificationContainer notifications={notifications} onDismiss={removeNotification} onClearAll={clearAll} />
}

// Re-export types and hooks for backward compatibility
export type { Notification, NotificationType } from './notification-system'
export { useNotifications } from './notification-system'

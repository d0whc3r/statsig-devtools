import { useEffect, useState } from 'react'

import type { StatsigError } from '../../services/error-handler'
import type { Notification } from './types'

interface NotificationSystemMethods {
  addNotification: (notification: Omit<Notification, 'id'>) => string
  addErrorNotification: (error: StatsigError) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

/**
 * Hook for using the notification system
 * This provides access to notification methods when the system is available
 */
export const useNotifications = () => {
  const [notificationSystem, setNotificationSystem] = useState<NotificationSystemMethods | null>(null)

  useEffect(() => {
    // This would be better implemented with React Context
    // For now, using window object for simplicity in development
    if (process.env.NODE_ENV === 'development' && (window as unknown as Record<string, unknown>).notificationSystem) {
      setNotificationSystem(
        (window as unknown as Record<string, unknown>).notificationSystem as NotificationSystemMethods,
      )
    }
  }, [])

  return notificationSystem
}

import { useCallback, useState } from 'react'

import { logger } from '../../utils/logger'

import type { ErrorRecoveryAction, StatsigError } from '../../services/error-handler'
import type { Notification } from './types'

/**
 * Hook for managing notifications state and operations
 */
export const useNotificationManager = (maxNotifications = 5, defaultDuration = 5000) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  /**
   * Add a notification to the system
   */
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? defaultDuration,
      }

      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        // Limit number of notifications
        return updated.slice(0, maxNotifications)
      })

      return id
    },
    [maxNotifications, defaultDuration],
  )

  /**
   * Remove a notification by ID
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  /**
   * Add error notification from StatsigError
   */
  const addErrorNotification = useCallback(
    (error: StatsigError) => {
      const actions: ErrorRecoveryAction[] = []

      if (error.recoveryActions) {
        error.recoveryActions.forEach((actionLabel) => {
          actions.push({
            label: actionLabel,
            action: () => {
              // This would be implemented based on the specific recovery action
              logger.info(`Recovery action: ${actionLabel}`)
            },
          })
        })
      }

      return addNotification({
        type: 'error',
        title: `${error.category.charAt(0).toUpperCase() + error.category.slice(1)} Error`,
        message: error.userMessage,
        persistent: error.severity === 'critical',
        actions,
      })
    },
    [addNotification],
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    addErrorNotification,
  }
}

import React, { useCallback, useEffect, useState } from 'react'

import { logger } from '../utils/logger'

import type { ErrorRecoveryAction, StatsigError } from '../services/error-handler'

/**
 * Notification types
 */
export type NotificationType = 'error' | 'warning' | 'info' | 'success'

/**
 * Notification interface
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: ErrorRecoveryAction[]
  onDismiss?: () => void
}

/**
 * Notification system props
 */
interface NotificationSystemProps {
  maxNotifications?: number
  defaultDuration?: number
}

/**
 * Individual notification component props
 */
interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

/**
 * Individual notification component
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
      notification.onDismiss?.()
    }, 300) // Animation duration
  }, [notification, onDismiss])

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.persistent, handleDismiss])

  const getNotificationStyles = () => {
    const baseStyles = `
      transform transition-all duration-300 ease-in-out
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      rounded-lg border p-4 shadow-lg max-w-sm w-full
    `

    switch (notification.type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="mt-1 text-sm opacity-90">{notification.message}</p>

          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action()
                    if (!notification.persistent) {
                      handleDismiss()
                    }
                  }}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Notification system component
 */
export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  maxNotifications = 5,
  defaultDuration = 5000,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  /**
   * Add a notification
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
   * Remove a notification
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

  // Expose methods through a ref or context if needed
  React.useEffect(() => {
    // Store methods in window for global access (development only)
    if (process.env.NODE_ENV === 'development') {
      ;(window as unknown as Record<string, unknown>).notificationSystem = {
        addNotification,
        addErrorNotification,
        removeNotification,
        clearAll,
      }
    }
  }, [addNotification, addErrorNotification, removeNotification, clearAll])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={removeNotification} />
      ))}

      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button onClick={clearAll} className="text-xs text-gray-500 underline hover:text-gray-700">
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Hook for using notifications
 */
export const useNotifications = () => {
  const [notificationSystem, setNotificationSystem] = useState<{
    addNotification: (notification: Omit<Notification, 'id'>) => string
    addErrorNotification: (error: StatsigError) => string
    removeNotification: (id: string) => void
    clearAll: () => void
  } | null>(null)

  useEffect(() => {
    // This would be better implemented with React Context
    // For now, using window object for simplicity
    if (process.env.NODE_ENV === 'development' && (window as unknown as Record<string, unknown>).notificationSystem) {
      setNotificationSystem(
        (window as unknown as Record<string, unknown>).notificationSystem as typeof notificationSystem,
      )
    }
  }, [])

  return notificationSystem
}

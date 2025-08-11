import React, { useCallback, useEffect, useState } from 'react'

import { NotificationActions } from './NotificationActions'
import { NotificationIcon } from './NotificationIcon'
import { useNotificationStyles } from './useNotificationStyles'

import type { NotificationItemProps } from './types'

/**
 * Individual notification component with animation and actions
 */
export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const notificationStyles = useNotificationStyles(notification.type, isVisible, isExiting)

  /**
   * Handle notification dismissal with animation
   */
  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
      notification.onDismiss?.()
    }, 300) // Animation duration
  }, [notification, onDismiss])

  /**
   * Handle action button clicks
   */
  const handleActionClick = useCallback(
    (action: { action: () => void }) => {
      action.action()
      if (!notification.persistent) {
        handleDismiss()
      }
    },
    [notification.persistent, handleDismiss],
  )

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Auto-dismiss after duration if not persistent
  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.persistent, handleDismiss])

  return (
    <div className={notificationStyles}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <NotificationIcon type={notification.type} />
        </div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="mt-1 text-sm opacity-90">{notification.message}</p>

          <NotificationActions actions={notification.actions || []} onActionClick={handleActionClick} />
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

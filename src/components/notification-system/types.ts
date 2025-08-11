import type { ErrorRecoveryAction } from '../../services/error-handler'

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
export interface NotificationSystemProps {
  maxNotifications?: number
  defaultDuration?: number
}

/**
 * Individual notification component props
 */
export interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

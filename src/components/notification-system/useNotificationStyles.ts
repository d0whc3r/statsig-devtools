import { useMemo } from 'react'

import type { NotificationType } from './types'

/**
 * Hook for generating notification styles based on type and animation state
 */
export const useNotificationStyles = (type: NotificationType, isVisible: boolean, isExiting: boolean) =>
  useMemo(() => {
    const baseStyles = `
      transform transition-all duration-300 ease-in-out
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      rounded-lg border p-4 shadow-lg max-w-sm w-full
    `

    switch (type) {
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
  }, [type, isVisible, isExiting])

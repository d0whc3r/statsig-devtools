import { useState } from 'react'

import { type ViewMode, viewModeService } from '../services/view-mode'
import { logger } from '../utils/logger'

/**
 * Custom hook for managing view mode toggle logic
 */
export function useViewModeToggle(currentMode: ViewMode) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTargetMode = (): ViewMode => {
    if (currentMode === 'popup') {
      // From popup, prefer sidebar if supported, otherwise tab
      return viewModeService.isSidebarSupported() ? 'sidebar' : 'tab'
    }
    if (currentMode === 'sidebar') return 'tab'
    return 'popup'
  }

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      if (currentMode === 'popup') {
        // From popup, switch to sidebar if supported, otherwise tab
        if (viewModeService.isSidebarSupported()) {
          logger.info('Attempting to switch to sidebar...')
          await viewModeService.switchToSidebar()
        } else {
          logger.info('Sidebar not supported, switching to tab...')
          await viewModeService.switchToTab()
        }
      } else if (currentMode === 'sidebar') {
        await viewModeService.switchToTab()
      } else {
        await viewModeService.switchToPopup()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch view mode')
      logger.error('View mode toggle error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugTest = async () => {
    try {
      const testResult = await viewModeService.testSidebarAPI()
      logger.info('Sidebar API test result:', testResult)

      // Show result to user
      const message = testResult.supported
        ? 'Sidebar API is supported and working!'
        : `Sidebar API test failed: ${testResult.error}`

      // Create temporary notification
      const notification = document.createElement('div')
      notification.className =
        'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm text-sm'
      notification.textContent = message
      document.body.appendChild(notification)

      setTimeout(() => {
        document.body.removeChild(notification)
      }, 5000)
    } catch (error) {
      logger.error('Debug test failed:', error)
    }
  }

  const targetMode = getTargetMode()
  const isSupported = viewModeService.isSidebarSupported()

  return {
    isLoading,
    error,
    targetMode,
    isSupported,
    handleToggle,
    handleDebugTest,
  }
}

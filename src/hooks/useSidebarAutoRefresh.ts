import { useCallback, useEffect, useRef } from 'react'

import { useActiveTab } from './useActiveTab'

/**
 * Custom hook for auto-refreshing sidebar data when tab changes
 */
export const useSidebarAutoRefresh = (
  refreshConfigurations: () => void,
  refreshTabInfo: () => void,
  isEnabled: boolean = true,
) => {
  const { tabInfo } = useActiveTab()
  const previousTabUrl = useRef<string | null>(null)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)

  /**
   * Handle tab change detection and refresh
   */
  const handleTabChange = useCallback(() => {
    if (!isEnabled) return

    const currentUrl = tabInfo.url

    // If tab URL changed, refresh data immediately
    if (previousTabUrl.current !== currentUrl) {
      previousTabUrl.current = currentUrl

      // Refresh both configurations and tab info
      refreshConfigurations()
      refreshTabInfo()
    }
  }, [tabInfo.url, refreshConfigurations, refreshTabInfo, isEnabled])

  /**
   * Start periodic refresh for sidebar
   */
  const startPeriodicRefresh = useCallback(() => {
    if (!isEnabled) return

    // Clear existing interval
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
    }

    // Set up faster refresh for sidebar (every 3 seconds instead of default)
    refreshInterval.current = setInterval(() => {
      refreshConfigurations()
      refreshTabInfo()
    }, 3000)
  }, [refreshConfigurations, refreshTabInfo, isEnabled])

  /**
   * Stop periodic refresh
   */
  const stopPeriodicRefresh = useCallback(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
      refreshInterval.current = null
    }
  }, [])

  /**
   * Handle tab change detection
   */
  useEffect(() => {
    handleTabChange()
  }, [handleTabChange])

  /**
   * Start/stop periodic refresh based on enabled state
   */
  useEffect(() => {
    if (isEnabled) {
      startPeriodicRefresh()
    } else {
      stopPeriodicRefresh()
    }

    // Cleanup on unmount
    return () => {
      stopPeriodicRefresh()
    }
  }, [isEnabled, startPeriodicRefresh, stopPeriodicRefresh])

  /**
   * Listen for tab activation events (when user switches tabs)
   */
  useEffect(() => {
    if (!isEnabled) return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became active, refresh immediately
        refreshConfigurations()
        refreshTabInfo()
      }
    }

    const handleFocus = () => {
      // Window gained focus, refresh data
      refreshConfigurations()
      refreshTabInfo()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshConfigurations, refreshTabInfo, isEnabled])

  return {
    startPeriodicRefresh,
    stopPeriodicRefresh,
  }
}

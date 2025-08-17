import { useCallback, useEffect } from 'react'

import { type ConnectionStatus, useDashboardStore } from '@/src/stores/dashboard-store'
import { tabCommunication } from '@/src/utils/tab-communication'

export function useConnection() {
  const { activeTab, connectionStatus, setActiveTab, setConnectionStatus } = useDashboardStore()

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    try {
      // Get active tab
      const tab = await tabCommunication.getActiveTab()
      setActiveTab(tab)

      if (tab) {
        // Check connection
        const connection = await tabCommunication.checkConnection()
        const status: ConnectionStatus = {
          isReady: connection.isReady,
          lastChecked: Date.now(),
        }
        if (connection.error) {
          status.error = connection.error
        }
        setConnectionStatus(status)

        // If not ready, try to inject script
        if (!connection.isReady) {
          const injected = await tabCommunication.injectScript()
          if (injected) {
            // Wait a bit and check again
            setTimeout(async () => {
              const newConnection = await tabCommunication.checkConnection()
              const newStatus: ConnectionStatus = {
                isReady: newConnection.isReady,
                lastChecked: Date.now(),
              }
              if (newConnection.error) {
                newStatus.error = newConnection.error
              }
              setConnectionStatus(newStatus)
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing connection:', error)
      const errorStatus: ConnectionStatus = {
        isReady: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: Date.now(),
      }
      setConnectionStatus(errorStatus)
    }
  }, [setActiveTab, setConnectionStatus])

  // Refresh connection
  const refreshConnection = useCallback(async () => {
    try {
      const connection = await tabCommunication.checkConnection()
      const refreshStatus: ConnectionStatus = {
        isReady: connection.isReady,
        lastChecked: Date.now(),
      }
      if (connection.error) {
        refreshStatus.error = connection.error
      }
      setConnectionStatus(refreshStatus)
    } catch (error) {
      console.error('Error refreshing connection:', error)
      const refreshErrorStatus: ConnectionStatus = {
        isReady: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: Date.now(),
      }
      setConnectionStatus(refreshErrorStatus)
    }
  }, [setConnectionStatus])

  // Initialize on mount
  useEffect(() => {
    initializeConnection()
  }, [initializeConnection])

  return {
    activeTab,
    connectionStatus,
    refreshConnection,
  }
}

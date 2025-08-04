import { useCallback, useEffect, useState } from 'react'

import { storageManager } from '../services/storage-manager'
import { viewModeService } from '../services/view-mode'
import { logger } from '../utils/logger'

import type { AuthState } from '../types'

/**
 * Custom hook for managing authentication state
 * Shared between popup and sidepanel
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  })

  /**
   * Initialize authentication and view mode
   */
  const initializeAuth = useCallback(async () => {
    try {
      await storageManager.initialize()
      await viewModeService.initializeViewMode()

      // Check if we have stored credentials
      const [hasConsoleKey, hasClientKey] = await Promise.all([
        storageManager.hasConsoleApiKey(),
        storageManager.hasClientSdkKey(),
      ])

      if (hasConsoleKey || hasClientKey) {
        const [consoleApiKey, clientSdkKey] = await Promise.all([
          storageManager.getConsoleApiKey(),
          storageManager.getClientSdkKey(),
        ])

        // Use whichever key is available, prefer client key if both exist
        const primaryKey = clientSdkKey || consoleApiKey

        if (primaryKey) {
          // For unified mode, ensure both keys are the same
          if (!consoleApiKey) {
            await storageManager.storeConsoleApiKey(primaryKey)
          }
          if (!clientSdkKey) {
            await storageManager.storeClientSdkKey(primaryKey)
          }

          setAuthState({
            isAuthenticated: true,
            consoleApiKey: primaryKey,
            clientSdkKey: primaryKey,
            isLoading: false,
          })
          return
        }
      }

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      logger.error('Failed to initialize authentication:', error)
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to load authentication state',
      })
    }
  }, [])

  /**
   * Handle successful authentication
   */
  const handleAuthenticated = useCallback((newAuthState: AuthState) => {
    setAuthState(newAuthState)
  }, [])

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await storageManager.clearAllData()
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      logger.error('Failed to logout:', error)
      setAuthState((prev) => ({
        ...prev,
        error: 'Failed to logout properly',
      }))
    }
  }, [])

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    authState,
    handleAuthenticated,
    handleLogout,
    initializeAuth,
  }
}

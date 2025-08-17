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
      const consoleApiKey = await storageManager.getConsoleApiKey()

      if (consoleApiKey) {
        setAuthState({
          isAuthenticated: true,
          consoleApiKey,
          isLoading: false,
        })
        return
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
   * Handle login
   */
  const login = useCallback(async (authData: AuthState) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }))

      if (authData.consoleApiKey) {
        await storageManager.storeConsoleApiKey(authData.consoleApiKey)
      }

      setAuthState({
        isAuthenticated: true,
        consoleApiKey: authData.consoleApiKey,
        isLoading: false,
      })
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }))
    }
  }, [])

  /**
   * Handle logout
   */
  const logout = useCallback(async () => {
    try {
      await storageManager.clearConsoleApiKey()

      setAuthState({
        isAuthenticated: false,
        consoleApiKey: undefined,
        isLoading: false,
      })
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
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
    login,
    logout,
    initializeAuth,
  }
}

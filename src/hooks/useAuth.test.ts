import { beforeEach, describe, expect, it, vi } from 'vitest'

import { storageManager } from '../services/storage-manager'
import { viewModeService } from '../services/view-mode'
import { useAuth } from './useAuth'

import type { AuthState } from '../types'

import { act, renderHook, waitFor } from '@testing-library/react'

// Mock dependencies
vi.mock('../services/storage-manager')
vi.mock('../services/view-mode')
vi.mock('../utils/logger')

const mockStorageManager = vi.mocked(storageManager)
const mockViewModeService = vi.mocked(viewModeService)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default successful mocks
    mockStorageManager.initialize.mockResolvedValue(undefined)
    mockViewModeService.initializeViewMode.mockResolvedValue(undefined)
    mockStorageManager.hasConsoleApiKey.mockResolvedValue(false)
    mockStorageManager.hasClientSdkKey.mockResolvedValue(false)
    mockStorageManager.getConsoleApiKey.mockResolvedValue(null)
    mockStorageManager.getClientSdkKey.mockResolvedValue(null)
    mockStorageManager.storeConsoleApiKey.mockResolvedValue(undefined)
    mockStorageManager.storeClientSdkKey.mockResolvedValue(undefined)
    mockStorageManager.clearAllData.mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('should initialize with loading state and then set unauthenticated when no keys exist', async () => {
      const { result } = renderHook(() => useAuth())

      // Should start with loading state
      expect(result.current.authState.isLoading).toBe(true)
      expect(result.current.authState.isAuthenticated).toBe(false)

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
      expect(mockStorageManager.initialize).toHaveBeenCalled()
      expect(mockViewModeService.initializeViewMode).toHaveBeenCalled()
    })

    it('should authenticate when console API key exists', async () => {
      const testApiKey = 'console-test-key-123'
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(testApiKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(true)
      expect(result.current.authState.consoleApiKey).toBe(testApiKey)
      expect(result.current.authState.clientSdkKey).toBe(testApiKey)

      // Should store the same key for both types in unified mode
      expect(mockStorageManager.storeClientSdkKey).toHaveBeenCalledWith(testApiKey)
    })

    it('should authenticate when client SDK key exists', async () => {
      const testSdkKey = 'client-test-key-456'
      mockStorageManager.hasClientSdkKey.mockResolvedValue(true)
      mockStorageManager.getClientSdkKey.mockResolvedValue(testSdkKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(true)
      expect(result.current.authState.consoleApiKey).toBe(testSdkKey)
      expect(result.current.authState.clientSdkKey).toBe(testSdkKey)

      // Should store the same key for both types in unified mode
      expect(mockStorageManager.storeConsoleApiKey).toHaveBeenCalledWith(testSdkKey)
    })

    it('should prefer client SDK key when both keys exist', async () => {
      const consoleKey = 'console-key-123'
      const clientKey = 'client-key-456'

      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(consoleKey)
      mockStorageManager.getClientSdkKey.mockResolvedValue(clientKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(true)
      expect(result.current.authState.consoleApiKey).toBe(clientKey)
      expect(result.current.authState.clientSdkKey).toBe(clientKey)

      // Should not call store methods when both keys already exist
      expect(mockStorageManager.storeConsoleApiKey).not.toHaveBeenCalled()
      expect(mockStorageManager.storeClientSdkKey).not.toHaveBeenCalled()
    })

    it('should handle initialization errors gracefully', async () => {
      const initError = new Error('Storage initialization failed')
      mockStorageManager.initialize.mockRejectedValue(initError)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
      expect(result.current.authState.error).toBe('Failed to load authentication state')
    })

    it('should handle storage read errors gracefully', async () => {
      const storageError = new Error('Failed to read from storage')
      mockStorageManager.hasConsoleApiKey.mockRejectedValue(storageError)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
      expect(result.current.authState.error).toBe('Failed to load authentication state')
    })
  })

  describe('authentication handling', () => {
    it('should update auth state when handleAuthenticated is called', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      const newAuthState: AuthState = {
        isAuthenticated: true,
        consoleApiKey: 'new-console-key',
        clientSdkKey: 'new-client-key',
        isLoading: false,
        projectName: 'Test Project',
      }

      act(() => {
        result.current.handleAuthenticated(newAuthState)
      })

      expect(result.current.authState.isAuthenticated).toBe(true)
      expect(result.current.authState.consoleApiKey).toBe('new-console-key')
      expect(result.current.authState.clientSdkKey).toBe('new-client-key')
      expect(result.current.authState.isLoading).toBe(false)
      expect(result.current.authState.projectName).toBe('Test Project')
    })
  })

  describe('logout functionality', () => {
    it('should clear all data and reset auth state on logout', async () => {
      // Start with authenticated state
      const testApiKey = 'test-key-123'
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(testApiKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isAuthenticated).toBe(true)
      })

      // Reset mocks to simulate cleared storage after logout
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(false)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(false)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(null)
      mockStorageManager.getClientSdkKey.mockResolvedValue(null)

      // Perform logout
      await act(async () => {
        await result.current.handleLogout()
      })

      expect(mockStorageManager.clearAllData).toHaveBeenCalled()

      await waitFor(() => {
        expect(result.current.authState.isAuthenticated).toBe(false)
        expect(result.current.authState.isLoading).toBe(false)
        expect(result.current.authState.consoleApiKey).toBeUndefined()
        expect(result.current.authState.clientSdkKey).toBeUndefined()
      })
    })

    it('should handle logout errors gracefully', async () => {
      const logoutError = new Error('Failed to clear storage')
      mockStorageManager.clearAllData.mockRejectedValue(logoutError)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      await result.current.handleLogout()

      await waitFor(() => {
        expect(result.current.authState.error).toBe('Failed to logout properly')
      })
    })
  })

  describe('re-initialization', () => {
    it('should allow manual re-initialization', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      // Clear mocks to verify re-initialization calls
      vi.clearAllMocks()
      mockStorageManager.initialize.mockResolvedValue(undefined)
      mockViewModeService.initializeViewMode.mockResolvedValue(undefined)
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(false)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(false)

      await result.current.initializeAuth()

      expect(mockStorageManager.initialize).toHaveBeenCalled()
      expect(mockViewModeService.initializeViewMode).toHaveBeenCalled()
    })
  })

  describe('unified mode key synchronization', () => {
    it('should synchronize keys when only console key exists', async () => {
      const consoleKey = 'console-only-key'
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(false)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(consoleKey)
      mockStorageManager.getClientSdkKey.mockResolvedValue(null)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(mockStorageManager.storeClientSdkKey).toHaveBeenCalledWith(consoleKey)
      expect(result.current.authState.consoleApiKey).toBe(consoleKey)
      expect(result.current.authState.clientSdkKey).toBe(consoleKey)
    })

    it('should synchronize keys when only client key exists', async () => {
      const clientKey = 'client-only-key'
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(false)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(null)
      mockStorageManager.getClientSdkKey.mockResolvedValue(clientKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(mockStorageManager.storeConsoleApiKey).toHaveBeenCalledWith(clientKey)
      expect(result.current.authState.consoleApiKey).toBe(clientKey)
      expect(result.current.authState.clientSdkKey).toBe(clientKey)
    })

    it('should not synchronize when both keys already exist', async () => {
      const consoleKey = 'console-key'
      const clientKey = 'client-key'

      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.hasClientSdkKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(consoleKey)
      mockStorageManager.getClientSdkKey.mockResolvedValue(clientKey)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(mockStorageManager.storeConsoleApiKey).not.toHaveBeenCalled()
      expect(mockStorageManager.storeClientSdkKey).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string keys as invalid', async () => {
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue('')

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
    })

    it('should handle null keys as invalid', async () => {
      mockStorageManager.hasConsoleApiKey.mockResolvedValue(true)
      mockStorageManager.getConsoleApiKey.mockResolvedValue(null)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
    })
  })
})

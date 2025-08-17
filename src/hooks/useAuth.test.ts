import { beforeEach, describe, expect, it, vi } from 'vitest'

import { storageManager } from '../services/storage-manager'
import { viewModeService } from '../services/view-mode'
import { useAuth } from './useAuth'

import { act, renderHook, waitFor } from '@testing-library/react'

// Mock dependencies
vi.mock('../services/storage-manager')
vi.mock('../services/view-mode')
vi.mock('../utils/logger')

const mockStorageManager = vi.mocked(storageManager)
const mockViewModeService = vi.mocked(viewModeService)

describe('useAuth', () => {
  beforeEach(() => {
    // Default successful mocks
    mockStorageManager.initialize.mockResolvedValue(undefined)
    mockViewModeService.initializeViewMode.mockResolvedValue(undefined)
    mockStorageManager.hasConsoleApiKey.mockResolvedValue(false)
    mockStorageManager.getConsoleApiKey.mockResolvedValue(null)
    mockStorageManager.storeConsoleApiKey.mockResolvedValue(undefined)
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
  })

  describe('login', () => {
    it('should store console API key and update auth state', async () => {
      const { result } = renderHook(() => useAuth())
      const testApiKey = 'new-console-key-789'

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login({
          isAuthenticated: true,
          consoleApiKey: testApiKey,
          isLoading: false,
        })
      })

      expect(mockStorageManager.storeConsoleApiKey).toHaveBeenCalledWith(testApiKey)
      expect(result.current.authState.isAuthenticated).toBe(true)
      expect(result.current.authState.consoleApiKey).toBe(testApiKey)
    })

    it('should handle login errors', async () => {
      const { result } = renderHook(() => useAuth())
      const loginError = new Error('Storage failed')
      mockStorageManager.storeConsoleApiKey.mockRejectedValue(loginError)

      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login({
          isAuthenticated: true,
          consoleApiKey: 'test-key',
          isLoading: false,
        })
      })

      expect(result.current.authState.isAuthenticated).toBe(false)
      expect(result.current.authState.error).toBe('Storage failed')
    })
  })

  describe('logout', () => {
    it('should clear console API key and reset auth state', async () => {
      const { result } = renderHook(() => useAuth())

      // First login
      await act(async () => {
        await result.current.login({
          isAuthenticated: true,
          consoleApiKey: 'test-console-key',
          isLoading: false,
        })
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(mockStorageManager.clearConsoleApiKey).toHaveBeenCalled()
      expect(result.current.authState.isAuthenticated).toBe(false)
      expect(result.current.authState.consoleApiKey).toBeUndefined()
    })

    it('should handle logout errors', async () => {
      const { result } = renderHook(() => useAuth())
      const logoutError = new Error('Clear failed')
      mockStorageManager.clearConsoleApiKey.mockRejectedValue(logoutError)

      // First set up an authenticated state
      await act(async () => {
        await result.current.login({
          isAuthenticated: true,
          consoleApiKey: 'test-console-key',
          isLoading: false,
        })
      })

      // Then try to logout with error
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.authState.error).toBe('Clear failed')
    })
  })

  describe('initializeAuth', () => {
    it('should be callable directly', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.initializeAuth()
      })

      expect(mockStorageManager.initialize).toHaveBeenCalled()
      expect(mockViewModeService.initializeViewMode).toHaveBeenCalled()
    })
  })
})

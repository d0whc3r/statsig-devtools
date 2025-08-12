import { beforeEach, describe, expect, it, vi } from 'vitest'

import { errorHandler } from '../services/error-handler'
import { unifiedStatsigService } from '../services/unified-statsig-api'
import { useConfigurationData } from './useConfigurationData'

import type { AuthState, StatsigConfigurationItem } from '../types'

import { renderHook, waitFor } from '@testing-library/react'

// Mock dependencies
vi.mock('../services/error-handler')
vi.mock('../services/unified-statsig-api')

const mockErrorHandler = vi.mocked(errorHandler)
const mockUnifiedStatsigService = vi.mocked(unifiedStatsigService)

describe('useConfigurationData', () => {
  const mockConfigurations: StatsigConfigurationItem[] = [
    {
      name: 'test_gate',
      type: 'feature_gate',
      enabled: true,
    },
    {
      name: 'test_config',
      type: 'dynamic_config',
      enabled: true,
    },
  ]

  const mockAuthState: AuthState = {
    isAuthenticated: true,
    consoleApiKey: 'console-test-key',
    clientSdkKey: 'client-test-key',
    isLoading: false,
    projectName: 'Test Project',
  }

  beforeEach(() => {
    // Default mock implementations
    mockUnifiedStatsigService.isReady.mockReturnValue(true)
    mockUnifiedStatsigService.initialize.mockResolvedValue(undefined)
    mockUnifiedStatsigService.getAllConfigurations.mockResolvedValue(mockConfigurations)
    mockErrorHandler.handleError.mockReturnValue({
      id: 'test-error-id',
      category: 'api' as any,
      severity: 'medium' as any,
      message: 'Test error',
      userMessage: 'Test error message',
      timestamp: new Date().toISOString(),
      recoverable: true,
    })
  })

  it('loads configurations successfully when service is ready', async () => {
    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.configurations).toEqual([])
    expect(result.current.error).toBeUndefined()

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.configurations).toEqual(mockConfigurations)
    expect(result.current.error).toBeUndefined()
    expect(mockUnifiedStatsigService.getAllConfigurations).toHaveBeenCalled()
  })

  it('initializes service when not ready', async () => {
    mockUnifiedStatsigService.isReady.mockReturnValue(false)

    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockUnifiedStatsigService.initialize).toHaveBeenCalledWith('client-test-key')
    expect(mockUnifiedStatsigService.getAllConfigurations).toHaveBeenCalled()
  })

  it('uses console API key when client SDK key is not available', async () => {
    const authStateWithoutClientKey: AuthState = {
      ...mockAuthState,
      clientSdkKey: undefined,
    }

    mockUnifiedStatsigService.isReady.mockReturnValue(false)

    const { result } = renderHook(() => useConfigurationData(authStateWithoutClientKey))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockUnifiedStatsigService.initialize).toHaveBeenCalledWith('console-test-key')
  })

  it('handles error when no API key is available', async () => {
    const authStateWithoutKeys: AuthState = {
      ...mockAuthState,
      consoleApiKey: undefined,
      clientSdkKey: undefined,
    }

    const { result } = renderHook(() => useConfigurationData(authStateWithoutKeys))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('API key not available')
    expect(result.current.configurations).toEqual([])
    expect(mockUnifiedStatsigService.initialize).not.toHaveBeenCalled()
  })

  it('handles service initialization error', async () => {
    const initError = new Error('Initialization failed')
    mockUnifiedStatsigService.isReady.mockReturnValue(false)
    mockUnifiedStatsigService.initialize.mockRejectedValue(initError)

    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Test error message')
    expect(result.current.configurations).toEqual([])
    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(initError, 'Loading configurations')
  })

  it('handles configuration loading error', async () => {
    const loadError = new Error('Loading failed')
    mockUnifiedStatsigService.getAllConfigurations.mockRejectedValue(loadError)

    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Test error message')
    expect(result.current.configurations).toEqual([])
    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(loadError, 'Loading configurations')
  })

  it('refreshes configurations when refreshConfigurations is called', async () => {
    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockUnifiedStatsigService.getAllConfigurations.mockResolvedValue(mockConfigurations)

    // Call refresh
    result.current.refreshConfigurations()

    await waitFor(() => {
      expect(mockUnifiedStatsigService.getAllConfigurations).toHaveBeenCalled()
    })
  })

  it('reloads configurations when auth state changes', async () => {
    const { result, rerender } = renderHook(({ authState }) => useConfigurationData(authState), {
      initialProps: { authState: mockAuthState },
    })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockUnifiedStatsigService.getAllConfigurations.mockResolvedValue(mockConfigurations)

    // Change auth state
    const newAuthState: AuthState = {
      ...mockAuthState,
      clientSdkKey: 'new-client-key',
    }

    rerender({ authState: newAuthState })

    await waitFor(() => {
      expect(mockUnifiedStatsigService.getAllConfigurations).toHaveBeenCalled()
    })
  })

  it('clears error when loading starts', async () => {
    // First, create an error state
    mockUnifiedStatsigService.getAllConfigurations.mockRejectedValueOnce(new Error('First error'))

    const { result } = renderHook(() => useConfigurationData(mockAuthState))

    await waitFor(() => {
      expect(result.current.error).toBe('Test error message')
    })

    // Now mock success and refresh
    mockUnifiedStatsigService.getAllConfigurations.mockResolvedValue(mockConfigurations)

    result.current.refreshConfigurations()

    // Wait for the error to be cleared and loading to complete
    await waitFor(() => {
      expect(result.current.error).toBeUndefined()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.configurations).toEqual(mockConfigurations)
  })
})

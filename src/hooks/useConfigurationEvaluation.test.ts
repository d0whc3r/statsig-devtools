import { beforeEach, describe, expect, it, vi } from 'vitest'

import { errorHandler } from '../services/error-handler'
import { statsigIntegration } from '../services/statsig-integration'
import { useConfigurationEvaluation } from './useConfigurationEvaluation'

import type { EvaluationResult, StorageOverride } from '../services/statsig-integration'
import type { AuthState, StatsigConfigurationItem } from '../types'

import { renderHook, waitFor } from '@testing-library/react'

// Mock dependencies
vi.mock('../services/error-handler')
vi.mock('../services/statsig-integration')

const mockErrorHandler = vi.mocked(errorHandler)
const mockStatsigIntegration = vi.mocked(statsigIntegration)

describe('useConfigurationEvaluation', () => {
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

  const mockOverrides: StorageOverride[] = [
    {
      type: 'localStorage',
      key: 'userID',
      value: 'test-user',
    },
  ]

  const mockEvaluationResults: EvaluationResult[] = [
    {
      configurationName: 'test_gate',
      type: 'feature_gate',
      passed: true,
      value: true,
      reason: 'Test evaluation',
    },
    {
      configurationName: 'test_config',
      type: 'dynamic_config',
      passed: true,
      value: { key: 'value' },
      reason: 'Test evaluation',
    },
  ]

  const mockUser = { userID: 'test-user' }

  beforeEach(() => {
    // Default mock implementations
    mockStatsigIntegration.isReady.mockReturnValue(false)
    mockStatsigIntegration.initialize.mockResolvedValue(undefined)
    mockStatsigIntegration.updateUser.mockResolvedValue(undefined)
    mockStatsigIntegration.buildUserFromOverrides.mockReturnValue(mockUser)
    mockStatsigIntegration.evaluateAllConfigurations.mockResolvedValue(mockEvaluationResults)
    mockStatsigIntegration.cleanup.mockReturnValue(undefined)
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

  it('evaluates configurations successfully when SDK is not ready', async () => {
    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    // Initially evaluating
    expect(result.current.isEvaluating).toBe(true)
    expect(result.current.evaluationResults.size).toBe(0)

    // Wait for evaluation to complete
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    expect(mockStatsigIntegration.initialize).toHaveBeenCalledWith('client-test-key', mockUser)
    expect(mockStatsigIntegration.evaluateAllConfigurations).toHaveBeenCalledWith(mockConfigurations)
    expect(result.current.evaluationResults.size).toBe(2)
    expect(result.current.evaluationResults.get('test_gate')).toEqual(mockEvaluationResults[0])
    expect(result.current.evaluationResults.get('test_config')).toEqual(mockEvaluationResults[1])
  })

  it('updates user when SDK is already ready', async () => {
    mockStatsigIntegration.isReady.mockReturnValue(true)

    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    expect(mockStatsigIntegration.initialize).not.toHaveBeenCalled()
    expect(mockStatsigIntegration.updateUser).toHaveBeenCalledWith(mockUser)
    expect(mockStatsigIntegration.evaluateAllConfigurations).toHaveBeenCalledWith(mockConfigurations)
  })

  it('skips evaluation when no client SDK key is provided', async () => {
    const authStateWithoutClientKey: AuthState = {
      ...mockAuthState,
      clientSdkKey: undefined,
    }

    const { result } = renderHook(() =>
      useConfigurationEvaluation(authStateWithoutClientKey, mockConfigurations, mockOverrides),
    )

    // Should not be evaluating
    expect(result.current.isEvaluating).toBe(false)
    expect(result.current.evaluationResults.size).toBe(0)

    expect(mockStatsigIntegration.initialize).not.toHaveBeenCalled()
    expect(mockStatsigIntegration.evaluateAllConfigurations).not.toHaveBeenCalled()
  })

  it('skips evaluation when no configurations are provided', async () => {
    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, [], mockOverrides))

    // Should not be evaluating
    expect(result.current.isEvaluating).toBe(false)
    expect(result.current.evaluationResults.size).toBe(0)

    expect(mockStatsigIntegration.initialize).not.toHaveBeenCalled()
    expect(mockStatsigIntegration.evaluateAllConfigurations).not.toHaveBeenCalled()
  })

  it('skips evaluation when console API key is provided', async () => {
    const authStateWithConsoleKey: AuthState = {
      ...mockAuthState,
      clientSdkKey: 'console-test-key',
    }

    const { result } = renderHook(() =>
      useConfigurationEvaluation(authStateWithConsoleKey, mockConfigurations, mockOverrides),
    )

    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    expect(result.current.evaluationResults.size).toBe(0)
    expect(mockStatsigIntegration.initialize).not.toHaveBeenCalled()
    expect(mockStatsigIntegration.evaluateAllConfigurations).not.toHaveBeenCalled()
  })

  it('handles evaluation errors gracefully', async () => {
    const evaluationError = new Error('Evaluation failed')
    mockStatsigIntegration.evaluateAllConfigurations.mockRejectedValue(evaluationError)

    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(evaluationError, 'Evaluating configurations')
    expect(result.current.evaluationResults.size).toBe(0)
  })

  it('handles initialization errors gracefully', async () => {
    const initError = new Error('Initialization failed')
    mockStatsigIntegration.initialize.mockRejectedValue(initError)

    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(initError, 'Evaluating configurations')
    expect(result.current.evaluationResults.size).toBe(0)
  })

  it('re-evaluates when auth state changes', async () => {
    const { result, rerender } = renderHook(
      ({ authState }) => useConfigurationEvaluation(authState, mockConfigurations, mockOverrides),
      {
        initialProps: { authState: mockAuthState },
      },
    )

    // Wait for initial evaluation
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockStatsigIntegration.evaluateAllConfigurations.mockResolvedValue(mockEvaluationResults)

    // Change auth state
    const newAuthState: AuthState = {
      ...mockAuthState,
      clientSdkKey: 'new-client-key',
    }

    rerender({ authState: newAuthState })

    await waitFor(() => {
      expect(mockStatsigIntegration.initialize).toHaveBeenCalledWith('new-client-key', mockUser)
    })
  })

  it('re-evaluates when configurations change', async () => {
    const { result, rerender } = renderHook(
      ({ configurations }) => useConfigurationEvaluation(mockAuthState, configurations, mockOverrides),
      {
        initialProps: { configurations: mockConfigurations },
      },
    )

    // Wait for initial evaluation
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockStatsigIntegration.evaluateAllConfigurations.mockResolvedValue(mockEvaluationResults)

    // Change configurations
    const newConfigurations: StatsigConfigurationItem[] = [
      {
        name: 'new_gate',
        type: 'feature_gate',
        enabled: true,
      },
    ]

    rerender({ configurations: newConfigurations })

    await waitFor(() => {
      expect(mockStatsigIntegration.evaluateAllConfigurations).toHaveBeenCalledWith(newConfigurations)
    })
  })

  it('re-evaluates when overrides change', async () => {
    const { result, rerender } = renderHook(
      ({ overrides }) => useConfigurationEvaluation(mockAuthState, mockConfigurations, overrides),
      {
        initialProps: { overrides: mockOverrides },
      },
    )

    // Wait for initial evaluation
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockStatsigIntegration.evaluateAllConfigurations.mockResolvedValue(mockEvaluationResults)

    // Change overrides
    const newOverrides: StorageOverride[] = [
      {
        type: 'localStorage',
        key: 'userID',
        value: 'new-user',
      },
    ]

    rerender({ overrides: newOverrides })

    await waitFor(() => {
      expect(mockStatsigIntegration.buildUserFromOverrides).toHaveBeenCalledWith(newOverrides)
    })
  })

  it('calls initializeAndEvaluate manually', async () => {
    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    // Wait for initial evaluation
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()
    mockStatsigIntegration.evaluateAllConfigurations.mockResolvedValue(mockEvaluationResults)

    // Call manual evaluation
    result.current.initializeAndEvaluate()

    await waitFor(() => {
      expect(mockStatsigIntegration.evaluateAllConfigurations).toHaveBeenCalledWith(mockConfigurations)
    })
  })

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides))

    unmount()

    expect(mockStatsigIntegration.cleanup).toHaveBeenCalled()
  })

  it('does not re-evaluate when dependencies have not changed', async () => {
    const { result, rerender } = renderHook(() =>
      useConfigurationEvaluation(mockAuthState, mockConfigurations, mockOverrides),
    )

    // Wait for initial evaluation
    await waitFor(() => {
      expect(result.current.isEvaluating).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()

    // Re-render with same props
    rerender()

    // Should not trigger new evaluation
    expect(mockStatsigIntegration.initialize).not.toHaveBeenCalled()
    expect(mockStatsigIntegration.evaluateAllConfigurations).not.toHaveBeenCalled()
  })
})

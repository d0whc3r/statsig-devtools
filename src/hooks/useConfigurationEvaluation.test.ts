import { beforeEach, describe, expect, it, vi } from 'vitest'

import { errorHandler } from '../services/error-handler'
import { useConfigurationEvaluation } from './useConfigurationEvaluation'

import type { AuthState } from '../types'

import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../services/error-handler')

const mockErrorHandler = vi.mocked(errorHandler)

describe('useConfigurationEvaluation', () => {
  const mockAuthState: AuthState = {
    isAuthenticated: true,
    consoleApiKey: 'console-test-key',
    isLoading: false,
  }

  beforeEach(() => {
    // Default mock implementations for error handler only
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

  it('skips evaluation when not authenticated', async () => {
    const unauth: AuthState = { isAuthenticated: false, isLoading: false }
    const { result } = renderHook(() => useConfigurationEvaluation(unauth))
    expect(result.current.isEvaluating).toBe(false)
    expect(result.current.evaluationResults).toEqual([])
  })

  it('evaluates configs using unified service path (basic shape)', async () => {
    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState))
    await waitFor(() => expect(result.current.isEvaluating).toBe(false))
    expect(Array.isArray(result.current.evaluationResults)).toBe(true)
  })

  it('handles empty state gracefully', async () => {
    const { result } = renderHook(() => useConfigurationEvaluation(mockAuthState))
    await waitFor(() => expect(result.current.isEvaluating).toBe(false))
    expect(Array.isArray(result.current.evaluationResults)).toBe(true)
  })
})

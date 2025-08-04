import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveTab } from '../hooks/useActiveTab'
import { storageInjectionService } from '../services/storage-injection'

import { renderHook, waitFor } from '@testing-library/react'

// Mock storage injection service
vi.mock('../services/storage-injection', () => ({
  storageInjectionService: {
    getCurrentTabUrl: vi.fn(),
    getCurrentTabDomain: vi.fn(),
    canInjectStorage: vi.fn(),
  },
}))

describe('useActiveTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load tab information on mount', async () => {
    // Mock successful responses
    vi.mocked(storageInjectionService.getCurrentTabUrl).mockResolvedValue('https://example.com')
    vi.mocked(storageInjectionService.getCurrentTabDomain).mockResolvedValue('example.com')
    vi.mocked(storageInjectionService.canInjectStorage).mockResolvedValue({
      canInject: true,
    })

    const { result } = renderHook(() => useActiveTab())

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.tabInfo.url).toBeNull()

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check final state
    expect(result.current.tabInfo).toEqual({
      url: 'https://example.com',
      domain: 'example.com',
      canInject: true,
      reason: undefined,
    })
  })

  it('should handle injection failure', async () => {
    // Mock failed injection
    vi.mocked(storageInjectionService.getCurrentTabUrl).mockResolvedValue('chrome://extensions/')
    vi.mocked(storageInjectionService.getCurrentTabDomain).mockResolvedValue('chrome')
    vi.mocked(storageInjectionService.canInjectStorage).mockResolvedValue({
      canInject: false,
      reason: 'Cannot inject into browser internal pages',
    })

    const { result } = renderHook(() => useActiveTab())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tabInfo).toEqual({
      url: 'chrome://extensions/',
      domain: 'chrome',
      canInject: false,
      reason: 'Cannot inject into browser internal pages',
    })
  })

  it('should handle service errors', async () => {
    // Mock service errors
    vi.mocked(storageInjectionService.getCurrentTabUrl).mockRejectedValue(new Error('Service error'))
    vi.mocked(storageInjectionService.getCurrentTabDomain).mockRejectedValue(new Error('Service error'))
    vi.mocked(storageInjectionService.canInjectStorage).mockRejectedValue(new Error('Service error'))

    const { result } = renderHook(() => useActiveTab())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tabInfo).toEqual({
      url: null,
      domain: null,
      canInject: false,
      reason: 'Failed to get tab information',
    })
  })

  it('should refresh tab info when requested', async () => {
    // Initial mock
    vi.mocked(storageInjectionService.getCurrentTabUrl).mockResolvedValue('https://example.com')
    vi.mocked(storageInjectionService.getCurrentTabDomain).mockResolvedValue('example.com')
    vi.mocked(storageInjectionService.canInjectStorage).mockResolvedValue({
      canInject: true,
    })

    const { result } = renderHook(() => useActiveTab())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Change mock responses
    vi.mocked(storageInjectionService.getCurrentTabUrl).mockResolvedValue('https://newsite.com')
    vi.mocked(storageInjectionService.getCurrentTabDomain).mockResolvedValue('newsite.com')

    // Trigger refresh
    result.current.refreshTabInfo()

    // Wait for the refresh to complete and verify new data
    await waitFor(() => {
      expect(result.current.tabInfo.url).toBe('https://newsite.com')
      expect(result.current.tabInfo.domain).toBe('newsite.com')
    })

    // Should not be loading after completion
    expect(result.current.isLoading).toBe(false)
  })
})

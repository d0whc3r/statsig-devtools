import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { storageInjectionService } from '../services/storage-injection'

import type { StorageOverride } from '../types'

import { renderHook, waitFor } from '@testing-library/react'

// Mock storage injection service
vi.mock('../services/storage-injection', () => ({
  storageInjectionService: {
    getActiveOverrides: vi.fn(),
    createOverride: vi.fn(),
    removeOverride: vi.fn(),
    clearAllOverrides: vi.fn(),
  },
}))

describe('useStorageOverrides', () => {
  const mockOverride: StorageOverride = {
    type: 'localStorage',
    key: 'test-key',
    value: 'test-value',
    id: 'test-id',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storageInjectionService.getActiveOverrides).mockResolvedValue([])
  })

  it('should load overrides on mount', async () => {
    const mockOverrides = [mockOverride]
    vi.mocked(storageInjectionService.getActiveOverrides).mockResolvedValue(mockOverrides)

    const { result } = renderHook(() => useStorageOverrides())

    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual(mockOverrides)
    })

    expect(storageInjectionService.getActiveOverrides).toHaveBeenCalled()
  })

  it('should create override', async () => {
    vi.mocked(storageInjectionService.createOverride).mockResolvedValue(undefined)
    vi.mocked(storageInjectionService.getActiveOverrides).mockResolvedValue([mockOverride])

    const { result } = renderHook(() => useStorageOverrides())

    await result.current.createOverride(mockOverride)

    expect(storageInjectionService.createOverride).toHaveBeenCalledWith(mockOverride)

    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual([mockOverride])
    })
  })

  it('should handle create override error', async () => {
    const error = new Error('Create failed')
    vi.mocked(storageInjectionService.createOverride).mockRejectedValue(error)

    const { result } = renderHook(() => useStorageOverrides())

    await expect(result.current.createOverride(mockOverride)).rejects.toThrow('Create failed')
  })

  it('should remove override', async () => {
    vi.mocked(storageInjectionService.removeOverride).mockResolvedValue(undefined)
    vi.mocked(storageInjectionService.getActiveOverrides).mockResolvedValue([])

    const { result } = renderHook(() => useStorageOverrides())

    await result.current.removeOverride('test-id')

    expect(storageInjectionService.removeOverride).toHaveBeenCalledWith('test-id')

    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual([])
    })
  })

  it('should handle remove override error', async () => {
    const error = new Error('Remove failed')
    vi.mocked(storageInjectionService.removeOverride).mockRejectedValue(error)

    const { result } = renderHook(() => useStorageOverrides())

    await expect(result.current.removeOverride('test-id')).rejects.toThrow('Remove failed')
  })

  it('should clear all overrides', async () => {
    vi.mocked(storageInjectionService.clearAllOverrides).mockResolvedValue(undefined)
    vi.mocked(storageInjectionService.getActiveOverrides).mockResolvedValue([])

    const { result } = renderHook(() => useStorageOverrides())

    await result.current.clearAllOverrides()

    expect(storageInjectionService.clearAllOverrides).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual([])
    })
  })

  it('should handle clear all overrides error', async () => {
    const error = new Error('Clear failed')
    vi.mocked(storageInjectionService.clearAllOverrides).mockRejectedValue(error)

    const { result } = renderHook(() => useStorageOverrides())

    await expect(result.current.clearAllOverrides()).rejects.toThrow('Clear failed')
  })

  it('should refresh overrides', async () => {
    const initialOverrides = [mockOverride]
    const updatedOverrides = [mockOverride, { ...mockOverride, id: 'test-id-2', key: 'test-key-2' }]

    vi.mocked(storageInjectionService.getActiveOverrides)
      .mockResolvedValueOnce(initialOverrides)
      .mockResolvedValueOnce(updatedOverrides)

    const { result } = renderHook(() => useStorageOverrides())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual(initialOverrides)
    })

    // Trigger refresh
    await result.current.refreshOverrides()

    // Should have updated overrides
    await waitFor(() => {
      expect(result.current.activeOverrides).toEqual(updatedOverrides)
    })

    expect(storageInjectionService.getActiveOverrides).toHaveBeenCalledTimes(2)
  })
})

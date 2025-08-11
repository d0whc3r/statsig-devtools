import { describe, expect, it, vi } from 'vitest'

import { BrowserRuntime } from '../utils/browser-api'
import { useExtensionInfo } from './useExtensionInfo'

import { renderHook, waitFor } from '@testing-library/react'

// Mock the BrowserRuntime
vi.mock('../utils/browser-api', () => ({
  BrowserRuntime: {
    getManifest: vi.fn(),
  },
}))

describe('useExtensionInfo', () => {
  it('should return extension info from manifest', async () => {
    const mockManifest = {
      name: 'Test Extension',
      version: '2.0.0',
      description: 'Test description',
      manifest_version: 3,
    }

    vi.mocked(BrowserRuntime.getManifest).mockReturnValue(mockManifest as any)

    const { result } = renderHook(() => useExtensionInfo())

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.extensionInfo).toEqual({
      name: 'Test Extension',
      version: '2.0.0',
      description: 'Test description',
      manifestVersion: 3,
    })
  })

  it('should handle missing manifest fields with defaults', async () => {
    const mockManifest = {
      // Missing name, description, etc.
      version: '1.5.0',
    }

    vi.mocked(BrowserRuntime.getManifest).mockReturnValue(mockManifest as any)

    const { result } = renderHook(() => useExtensionInfo())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.extensionInfo).toEqual({
      name: 'Statsig DevTools',
      version: '1.5.0',
      description: '',
      manifestVersion: 3,
    })
  })

  it('should handle errors with fallback values', async () => {
    vi.mocked(BrowserRuntime.getManifest).mockImplementation(() => {
      throw new Error('Manifest not available')
    })

    const { result } = renderHook(() => useExtensionInfo())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.extensionInfo).toEqual({
      name: 'Statsig DevTools',
      version: '1.0.0',
      description: 'Browser extension for testing and debugging Statsig feature flags',
      manifestVersion: 3,
    })
  })

  it('should handle completely empty manifest', async () => {
    vi.mocked(BrowserRuntime.getManifest).mockReturnValue({} as any)

    const { result } = renderHook(() => useExtensionInfo())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.extensionInfo).toEqual({
      name: 'Statsig DevTools',
      version: '1.0.0',
      description: '',
      manifestVersion: 3,
    })
  })
})

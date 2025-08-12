import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StorageInjectionService } from '../services/storage-injection'
import { BrowserStorage, BrowserTabs } from '../utils/browser-api'

import type { StorageOverride } from '../services/statsig-integration'

// Mock browser APIs
vi.mock('../utils/browser-api', () => ({
  BrowserStorage: {
    get: vi.fn(),
    set: vi.fn(),
  },
  BrowserTabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

describe('StorageInjectionService', () => {
  let service: StorageInjectionService
  const mockTab = {
    id: 1,
    url: 'https://example.com',
    index: 0,
    pinned: false,
    highlighted: false,
    windowId: 1,
    active: true,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: true,
  } as chrome.tabs.Tab

  beforeEach(() => {
    vi.clearAllMocks()
    service = new StorageInjectionService()

    // Mock successful tab query
    vi.mocked(BrowserTabs.query).mockResolvedValue([mockTab])
    vi.mocked(BrowserTabs.sendMessage).mockResolvedValue({ success: true })
    vi.mocked(BrowserStorage.get).mockResolvedValue([])
    vi.mocked(BrowserStorage.set).mockResolvedValue(undefined)
  })

  describe('canInjectStorage', () => {
    it('should return true for regular web pages', async () => {
      const result = await service.canInjectStorage()

      expect(result.canInject).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should return false for chrome:// pages', async () => {
      vi.mocked(BrowserTabs.query).mockResolvedValue([
        {
          id: 1,
          url: 'chrome://extensions/',
          index: 0,
          pinned: false,
          highlighted: false,
          windowId: 1,
          active: true,
          incognito: false,
          selected: false,
          discarded: false,
          autoDiscardable: true,
        } as chrome.tabs.Tab,
      ])

      const result = await service.canInjectStorage()

      expect(result.canInject).toBe(false)
      expect(result.reason).toContain('Chrome internal pages')
    })

    it('should return false when no tab is found', async () => {
      vi.mocked(BrowserTabs.query).mockResolvedValue([])

      const result = await service.canInjectStorage()

      expect(result.canInject).toBe(false)
      expect(result.reason).toBe('No active tab found. Please open a webpage first.')
    })

    it('should return false when content script is not available', async () => {
      vi.mocked(BrowserTabs.sendMessage).mockRejectedValue(new Error('No response'))

      const result = await service.canInjectStorage()

      expect(result.canInject).toBe(false)
      expect(result.reason).toBe('Content script not available. Please refresh the page and try again.')
    })
  })

  describe('override management', () => {
    const testOverride: StorageOverride = {
      type: 'localStorage',
      key: 'test-key',
      value: 'test-value',
    }

    it('should create and store override', async () => {
      await service.createOverride(testOverride)

      expect(BrowserTabs.sendMessage).toHaveBeenCalledWith(
        mockTab.id,
        expect.objectContaining({
          type: 'SET_STORAGE_OVERRIDE',
          // We enrich with domain and path; only check type/key/value
          payload: expect.objectContaining({
            type: testOverride.type,
            key: testOverride.key,
            value: testOverride.value,
          }),
        }),
      )
      expect(BrowserStorage.set).toHaveBeenCalled()
    })

    it('should get active overrides', async () => {
      const mockOverrides = [testOverride]
      vi.mocked(BrowserStorage.get).mockResolvedValue(mockOverrides)

      const result = await service.getActiveOverrides()

      expect(result).toEqual(mockOverrides)
      expect(BrowserStorage.get).toHaveBeenCalledWith('statsig_active_overrides')
    })

    it('should remove override', async () => {
      const mockOverrides = [{ ...testOverride, id: 'test-id' }]
      vi.mocked(BrowserStorage.get).mockResolvedValue(mockOverrides)

      await service.removeOverride('test-id')

      expect(BrowserTabs.sendMessage).toHaveBeenCalledWith(
        mockTab.id,
        expect.objectContaining({
          type: 'REMOVE_STORAGE_OVERRIDE',
        }),
      )
      expect(BrowserStorage.set).toHaveBeenCalledWith('statsig_active_overrides', [])
    })

    it('should clear all overrides', async () => {
      const mockOverrides = [testOverride, { ...testOverride, key: 'test-key-2' }]
      vi.mocked(BrowserStorage.get).mockResolvedValue(mockOverrides)

      await service.clearAllOverrides()

      expect(BrowserTabs.sendMessage).toHaveBeenCalledTimes(2)
      expect(BrowserStorage.set).toHaveBeenCalledWith('statsig_active_overrides', [])
    })
  })

  describe('getCurrentTabDomain', () => {
    it('should return domain from current tab URL', async () => {
      const result = await service.getCurrentTabDomain()

      expect(result).toBe('example.com')
    })

    it('should return null when no tab is found', async () => {
      vi.mocked(BrowserTabs.query).mockResolvedValue([])

      const result = await service.getCurrentTabDomain()

      expect(result).toBeNull()
    })

    it('should return null for invalid URLs', async () => {
      vi.mocked(BrowserTabs.query).mockResolvedValue([
        {
          id: 1,
          url: 'invalid-url',
          index: 0,
          pinned: false,
          highlighted: false,
          windowId: 1,
          active: true,
          incognito: false,
          selected: false,
          discarded: false,
          autoDiscardable: true,
        } as chrome.tabs.Tab,
      ])

      const result = await service.getCurrentTabDomain()

      expect(result).toBeNull()
    })
  })

  describe('getCurrentTabUrl', () => {
    it('should return URL from current tab', async () => {
      const result = await service.getCurrentTabUrl()

      expect(result).toBe('https://example.com')
    })

    it('should return null when no tab is found', async () => {
      vi.mocked(BrowserTabs.query).mockResolvedValue([])

      const result = await service.getCurrentTabUrl()

      expect(result).toBeNull()
    })
  })
})

/**
 * Tests for browser API abstraction layer
 * Verifies cross-browser compatibility and webextension-polyfill integration
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  browserAPI,
  BrowserCookies,
  BrowserDetection,
  BrowserError,
  BrowserRuntime,
  BrowserStorage,
  BrowserTabs,
} from './browser-api'

describe('Browser API Abstraction Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('browserAPI', () => {
    it('should expose the browser object', () => {
      expect(browserAPI).toBeDefined()
      expect(browserAPI.storage).toBeDefined()
      expect(browserAPI.tabs).toBeDefined()
      expect(browserAPI.runtime).toBeDefined()
    })
  })

  describe('BrowserStorage', () => {
    describe('set', () => {
      it('should store data in local storage by default', async () => {
        const mockSet = vi.fn().mockResolvedValue(undefined)
        browserAPI.storage.local.set = mockSet

        await BrowserStorage.set('test-key', 'test-value')

        expect(mockSet).toHaveBeenCalledWith({ 'test-key': 'test-value' })
      })

      it('should store data in specified storage area', async () => {
        const mockSet = vi.fn().mockResolvedValue(undefined)
        browserAPI.storage.sync.set = mockSet

        await BrowserStorage.set('test-key', 'test-value', 'sync')

        expect(mockSet).toHaveBeenCalledWith({ 'test-key': 'test-value' })
      })

      it('should handle storage errors', async () => {
        const mockSet = vi.fn().mockRejectedValue(new Error('Storage quota exceeded'))
        browserAPI.storage.local.set = mockSet

        await expect(BrowserStorage.set('test-key', 'test-value')).rejects.toThrow(
          'Storage operation failed: Storage quota exceeded',
        )
      })
    })

    describe('get', () => {
      it('should retrieve data from local storage by default', async () => {
        const mockGet = vi.fn().mockResolvedValue({ 'test-key': 'test-value' })
        browserAPI.storage.local.get = mockGet

        const result = await BrowserStorage.get('test-key')

        expect(mockGet).toHaveBeenCalledWith('test-key')
        expect(result).toBe('test-value')
      })

      it('should return null for non-existent keys', async () => {
        const mockGet = vi.fn().mockResolvedValue({})
        browserAPI.storage.local.get = mockGet

        const result = await BrowserStorage.get('non-existent-key')

        expect(result).toBeNull()
      })

      it('should retrieve data from specified storage area', async () => {
        const mockGet = vi.fn().mockResolvedValue({ 'test-key': 'sync-value' })
        browserAPI.storage.sync.get = mockGet

        const result = await BrowserStorage.get('test-key', 'sync')

        expect(mockGet).toHaveBeenCalledWith('test-key')
        expect(result).toBe('sync-value')
      })
    })

    describe('remove', () => {
      it('should remove data from storage', async () => {
        const mockRemove = vi.fn().mockResolvedValue(undefined)
        browserAPI.storage.local.remove = mockRemove

        await BrowserStorage.remove('test-key')

        expect(mockRemove).toHaveBeenCalledWith('test-key')
      })
    })

    describe('clear', () => {
      it('should clear all data from storage', async () => {
        const mockClear = vi.fn().mockResolvedValue(undefined)
        browserAPI.storage.local.clear = mockClear

        await BrowserStorage.clear()

        expect(mockClear).toHaveBeenCalled()
      })
    })
  })

  describe('BrowserTabs', () => {
    describe('getActiveTab', () => {
      it('should return the active tab', async () => {
        const mockTab = { id: 1, url: 'https://example.com', active: true }
        const mockQuery = vi.fn().mockResolvedValue([mockTab])
        browserAPI.tabs.query = mockQuery

        const result = await BrowserTabs.getActiveTab()

        expect(mockQuery).toHaveBeenCalledWith({ active: true, currentWindow: true })
        expect(result).toEqual(mockTab)
      })

      it('should return null when no active tab found', async () => {
        const mockQuery = vi.fn().mockResolvedValue([])
        browserAPI.tabs.query = mockQuery

        const result = await BrowserTabs.getActiveTab()

        expect(result).toBeNull()
      })
    })

    describe('sendMessage', () => {
      it('should send message to tab', async () => {
        const mockSendMessage = vi.fn().mockResolvedValue({ success: true })
        browserAPI.tabs.sendMessage = mockSendMessage

        const message = { type: 'TEST_MESSAGE' }
        const result = await BrowserTabs.sendMessage(1, message)

        expect(mockSendMessage).toHaveBeenCalledWith(1, message)
        expect(result).toEqual({ success: true })
      })

      it('should handle message sending errors', async () => {
        const mockSendMessage = vi.fn().mockRejectedValue(new Error('Tab not found'))
        browserAPI.tabs.sendMessage = mockSendMessage

        await expect(BrowserTabs.sendMessage(1, { type: 'TEST' })).rejects.toThrow('Tab message failed: Tab not found')
      })
    })
  })

  describe('BrowserCookies', () => {
    describe('set', () => {
      it('should set a cookie', async () => {
        const mockCookie = { name: 'test', value: 'value', domain: 'example.com' }
        const mockSet = vi.fn().mockResolvedValue(mockCookie)
        browserAPI.cookies.set = mockSet

        const details = { url: 'https://example.com', name: 'test', value: 'value' }
        const result = await BrowserCookies.set(details)

        expect(mockSet).toHaveBeenCalledWith(details)
        expect(result).toEqual(mockCookie)
      })
    })

    describe('get', () => {
      it('should get cookies for URL', async () => {
        const mockCookies = [{ name: 'test', value: 'value' }]
        const mockGetAll = vi.fn().mockResolvedValue(mockCookies)
        browserAPI.cookies.getAll = mockGetAll

        const result = await BrowserCookies.get('https://example.com')

        expect(mockGetAll).toHaveBeenCalledWith({ url: 'https://example.com' })
        expect(result).toEqual(mockCookies)
      })
    })
  })

  describe('BrowserRuntime', () => {
    describe('sendMessage', () => {
      it('should send message to background script', async () => {
        const mockSendMessage = vi.fn().mockResolvedValue({ success: true })
        browserAPI.runtime.sendMessage = mockSendMessage

        const message = { type: 'TEST_MESSAGE' }
        const result = await BrowserRuntime.sendMessage(message)

        expect(mockSendMessage).toHaveBeenCalledWith(message)
        expect(result).toEqual({ success: true })
      })
    })

    describe('getManifest', () => {
      it('should return extension manifest', () => {
        const mockManifest = { name: 'Test Extension', version: '1.0.0' }
        browserAPI.runtime.getManifest = vi.fn().mockReturnValue(mockManifest)

        const result = BrowserRuntime.getManifest()

        expect(result).toEqual(mockManifest)
      })
    })

    describe('getURL', () => {
      it('should return extension URL for resource', () => {
        const mockGetURL = vi.fn().mockReturnValue('chrome-extension://abc123/popup.html')
        browserAPI.runtime.getURL = mockGetURL

        const result = BrowserRuntime.getURL('popup.html')

        expect(mockGetURL).toHaveBeenCalledWith('popup.html')
        expect(result).toBe('chrome-extension://abc123/popup.html')
      })
    })
  })

  describe('BrowserDetection', () => {
    it('should detect browser environment', () => {
      // These values are set by WXT build system, may be undefined in test environment
      const { isChrome } = BrowserDetection
      const { isFirefox } = BrowserDetection
      const { isSafari } = BrowserDetection
      const { isEdge } = BrowserDetection

      // In test environment, these may be undefined, which is acceptable
      expect(typeof isChrome === 'boolean' || isChrome === undefined).toBe(true)
      expect(typeof isFirefox === 'boolean' || isFirefox === undefined).toBe(true)
      expect(typeof isSafari === 'boolean' || isSafari === undefined).toBe(true)
      expect(typeof isEdge === 'boolean' || isEdge === undefined).toBe(true)
    })

    it('should return browser name', () => {
      const { browserName } = BrowserDetection
      // In test environment, this may be undefined, which is acceptable
      expect(typeof browserName === 'string' || browserName === undefined).toBe(true)
    })

    it('should return manifest version', () => {
      const { manifestVersion } = BrowserDetection
      // In test environment, this may be undefined, which is acceptable
      expect([2, 3, undefined]).toContain(manifestVersion)
    })

    describe('supportsFeature', () => {
      it('should check scripting API support', () => {
        const result = BrowserDetection.supportsFeature('scripting')
        expect(typeof result).toBe('boolean')
      })

      it('should check declarativeNetRequest support', () => {
        const result = BrowserDetection.supportsFeature('declarativeNetRequest')
        expect(typeof result).toBe('boolean')
      })

      it('should check offscreen API support', () => {
        const result = BrowserDetection.supportsFeature('offscreen')
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('BrowserError', () => {
    it('should create error with operation context', () => {
      const error = new BrowserError('Test error', 'storage.set')

      expect(error.message).toBe('Test error')
      expect(error.operation).toBe('storage.set')
      expect(error.name).toBe('BrowserError')
    })

    it('should create error from caught error', () => {
      const originalError = new Error('Original error')
      const browserError = BrowserError.fromError(originalError, 'tabs.query')

      expect(browserError.message).toBe('tabs.query failed: Original error')
      expect(browserError.operation).toBe('tabs.query')
      expect(browserError.originalError).toBe(originalError)
    })

    it('should handle non-Error objects', () => {
      const browserError = BrowserError.fromError('String error', 'runtime.sendMessage')

      expect(browserError.message).toBe('runtime.sendMessage failed: Unknown error')
      expect(browserError.operation).toBe('runtime.sendMessage')
      expect(browserError.originalError).toBeUndefined()
    })
  })
})

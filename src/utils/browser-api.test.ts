import { describe, expect, it } from 'vitest'

import {
  BrowserCookies,
  BrowserDetection,
  BrowserError,
  BrowserRuntime,
  BrowserStorage,
  BrowserTabs,
} from '../utils/browser-api'

describe('Browser API Integration', () => {
  describe('BrowserStorage', () => {
    it('should have required methods', () => {
      expect(typeof BrowserStorage.get).toBe('function')
      expect(typeof BrowserStorage.set).toBe('function')
      expect(typeof BrowserStorage.remove).toBe('function')
      expect(typeof BrowserStorage.clear).toBe('function')
    })
  })

  describe('BrowserTabs', () => {
    it('should have required methods', () => {
      expect(typeof BrowserTabs.getActiveTab).toBe('function')
      expect(typeof BrowserTabs.executeScript).toBe('function')
    })
  })

  describe('BrowserCookies', () => {
    it('should have required methods', () => {
      expect(typeof BrowserCookies.get).toBe('function')
      expect(typeof BrowserCookies.set).toBe('function')
      expect(typeof BrowserCookies.remove).toBe('function')
    })
  })

  describe('BrowserRuntime', () => {
    it('should have required methods', () => {
      expect(typeof BrowserRuntime.sendMessage).toBe('function')
      expect(typeof BrowserRuntime.addMessageListener).toBe('function')
      expect(typeof BrowserRuntime.removeMessageListener).toBe('function')
      expect(typeof BrowserRuntime.getManifest).toBe('function')
      expect(typeof BrowserRuntime.getURL).toBe('function')
    })
  })

  describe('BrowserDetection', () => {
    it('should have browser detection properties', () => {
      // These properties should exist, even if they're undefined in test environment
      expect('isChrome' in BrowserDetection).toBe(true)
      expect('isFirefox' in BrowserDetection).toBe(true)
      expect('isSafari' in BrowserDetection).toBe(true)
      expect('isEdge' in BrowserDetection).toBe(true)
      expect('browserName' in BrowserDetection).toBe(true)
      expect('manifestVersion' in BrowserDetection).toBe(true)
    })

    it('should have supportsFeature method', () => {
      expect(typeof BrowserDetection.supportsFeature).toBe('function')

      // Method should return boolean values
      const scriptingSupport = BrowserDetection.supportsFeature('scripting')
      const declarativeSupport = BrowserDetection.supportsFeature('declarativeNetRequest')
      const offscreenSupport = BrowserDetection.supportsFeature('offscreen')

      expect(typeof scriptingSupport).toBe('boolean')
      expect(typeof declarativeSupport).toBe('boolean')
      expect(typeof offscreenSupport).toBe('boolean')
    })
  })

  describe('BrowserError', () => {
    it('should be a proper Error class', () => {
      const error = new BrowserError('Test error', 'test-operation')
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('BrowserError')
      expect(error.operation).toBe('test-operation')
    })

    it('should create error from caught error', () => {
      const originalError = new Error('Original error')
      const browserError = BrowserError.fromError(originalError, 'test-operation')

      expect(browserError).toBeInstanceOf(BrowserError)
      expect(browserError.message).toContain('test-operation failed')
      expect(browserError.message).toContain('Original error')
      expect(browserError.operation).toBe('test-operation')
      expect(browserError.originalError).toBe(originalError)
    })
  })
})

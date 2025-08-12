/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Browser API abstraction layer for cross-browser compatibility
 * This module provides a unified interface for browser extension APIs
 * using webextension-polyfill under the hood (via WXT)
 */

import { logger } from './logger'

// Re-export browser object with robust fallback (webextension or chrome)

export const browserAPI: any = (globalThis as any).browser ?? (globalThis as any).chrome

// Logger is imported from './logger' above

/**
 * Storage API abstraction for secure data management
 */
export class BrowserStorage {
  /**
   * Store data securely in extension storage
   * @param key - Storage key
   * @param value - Value to store
   * @param area - Storage area (local, sync, session)
   */
  static async set(key: string, value: unknown, area: 'local' | 'sync' | 'session' = 'local'): Promise<void> {
    try {
      await browserAPI.storage[area].set({ [key]: value })
    } catch (error) {
      logger.error(`Failed to store data in ${area} storage:`, error)
      throw new Error(`Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieve data from extension storage
   * @param key - Storage key
   * @param area - Storage area (local, sync, session)
   * @returns Retrieved value or null if not found
   */
  static async get<T>(key: string, area: 'local' | 'sync' | 'session' = 'local'): Promise<T | null> {
    try {
      const result = await browserAPI.storage[area].get(key)
      return result[key] ?? null
    } catch (error) {
      logger.error(`Failed to retrieve data from ${area} storage:`, error)
      throw new Error(`Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove data from extension storage
   * @param key - Storage key
   * @param area - Storage area (local, sync, session)
   */
  static async remove(key: string, area: 'local' | 'sync' | 'session' = 'local'): Promise<void> {
    try {
      await browserAPI.storage[area].remove(key)
    } catch (error) {
      logger.error(`Failed to remove data from ${area} storage:`, error)
      throw new Error(`Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear all data from extension storage
   * @param area - Storage area (local, sync, session)
   */
  static async clear(area: 'local' | 'sync' | 'session' = 'local'): Promise<void> {
    try {
      await browserAPI.storage[area].clear()
    } catch (error) {
      logger.error(`Failed to clear ${area} storage:`, error)
      throw new Error(`Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Tabs API abstraction for tab management
 */
export class BrowserTabs {
  /**
   * Get the currently active tab
   * @returns Active tab or null if not found
   */
  static async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const tabsApi = (browserAPI as any)?.tabs ?? (globalThis as any)?.chrome?.tabs
      if (!tabsApi?.query) {
        throw new Error('Tabs API unavailable. Ensure the "tabs" permission is granted in the manifest.')
      }
      const tabs = await tabsApi.query({ active: true, currentWindow: true })
      return (tabs[0] as chrome.tabs.Tab) ?? null
    } catch (error) {
      logger.error('Failed to get active tab:', error)
      throw new Error(`Tab operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Query tabs with specific criteria
   * @param queryInfo - Query criteria
   * @returns Array of matching tabs
   */
  static async query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    try {
      const tabsApi = (browserAPI as any)?.tabs ?? (globalThis as any)?.chrome?.tabs
      if (!tabsApi?.query) {
        throw new Error('Tabs API unavailable. Ensure the "tabs" permission is granted in the manifest.')
      }
      return (await tabsApi.query(queryInfo as any)) as chrome.tabs.Tab[]
    } catch (error) {
      logger.error('Failed to query tabs:', error)
      throw new Error(`Tab query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Send message to content script in a specific tab
   * @param tabId - Tab ID
   * @param message - Message to send
   * @returns Response from content script
   */
  static async sendMessage(tabId: number, message: unknown): Promise<unknown> {
    try {
      const tabsApi = (browserAPI as any)?.tabs ?? (globalThis as any)?.chrome?.tabs
      if (!tabsApi?.sendMessage) {
        throw new Error('Tabs API unavailable. Ensure the "tabs" permission is granted in the manifest.')
      }
      return await tabsApi.sendMessage(tabId, message)
    } catch (error) {
      // Don't log as error since this is often expected (content script not available)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Only log as warning for debugging, not as error
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`[Browser API] Tab message failed (tab ${tabId}):`, errorMessage)
      }

      throw new Error(`Tab message failed: ${errorMessage}`)
    }
  }

  /**
   * Execute script in a specific tab
   * @param tabId - Tab ID
   * @param details - Script execution details
   */
  static async executeScript(
    tabId: number,
    details: chrome.scripting.ScriptInjection<unknown[], unknown>,
  ): Promise<void> {
    try {
      await browserAPI.scripting.executeScript({
        ...details,
        target: { tabId },
      })
    } catch (error) {
      logger.error('Failed to execute script:', error)
      throw new Error(`Script execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Cookies API abstraction for cookie management
 */
export class BrowserCookies {
  /**
   * Set a cookie for a specific domain
   * @param details - Cookie details
   */
  static async set(details: chrome.cookies.SetDetails): Promise<chrome.cookies.Cookie | null> {
    try {
      return await browserAPI.cookies.set(details)
    } catch (error) {
      logger.error('Failed to set cookie:', error)
      throw new Error(`Cookie operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get cookies for a specific URL
   * @param url - URL to get cookies for
   * @returns Array of cookies
   */
  static async get(url: string): Promise<chrome.cookies.Cookie[]> {
    try {
      return await browserAPI.cookies.getAll({ url })
    } catch (error) {
      logger.error('Failed to get cookies:', error)
      throw new Error(`Cookie operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove a cookie
   * @param details - Cookie removal details
   */
  static async remove(details: { url: string; name: string }): Promise<chrome.cookies.Cookie | null> {
    try {
      return (await browserAPI.cookies.remove(details)) as unknown as chrome.cookies.Cookie | null
    } catch (error) {
      logger.error('Failed to remove cookie:', error)
      throw new Error(`Cookie operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Runtime API abstraction for messaging and lifecycle
 */
export class BrowserRuntime {
  /**
   * Send a message to the background script
   * @param message - Message to send
   * @returns Response from background script
   */
  static async sendMessage<T>(message: unknown): Promise<T> {
    try {
      return await browserAPI.runtime.sendMessage(message)
    } catch (error) {
      logger.error('Failed to send message:', error)
      throw new Error(`Message sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add a message listener
   * @param listener - Message listener function
   */

  static addMessageListener(
    listener: (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean | void,
  ): void {
    browserAPI.runtime.onMessage.addListener(listener as any)
  }

  /**
   * Remove a message listener
   * @param listener - Message listener function to remove
   */

  static removeMessageListener(
    listener: (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean | void,
  ): void {
    browserAPI.runtime.onMessage.removeListener(listener as any)
  }

  /**
   * Get extension manifest
   * @returns Extension manifest
   */
  static getManifest(): chrome.runtime.Manifest {
    return browserAPI.runtime.getManifest()
  }

  /**
   * Get extension URL for a resource
   * @param path - Resource path
   * @returns Full extension URL
   */
  static getURL(path: string): string {
    return browserAPI.runtime.getURL(path as any)
  }
}

/**
 * Browser detection utilities
 */
export class BrowserDetection {
  /**
   * Check if running in Chrome
   */
  static get isChrome(): boolean {
    return import.meta.env.CHROME
  }

  /**
   * Check if running in Firefox
   */
  static get isFirefox(): boolean {
    return import.meta.env.FIREFOX
  }

  /**
   * Check if running in Safari
   */
  static get isSafari(): boolean {
    return import.meta.env.SAFARI
  }

  /**
   * Check if running in Edge
   */
  static get isEdge(): boolean {
    return import.meta.env.EDGE
  }

  /**
   * Get current browser name
   */
  static get browserName(): string {
    return import.meta.env.BROWSER
  }

  /**
   * Get manifest version
   */
  static get manifestVersion(): 2 | 3 {
    return import.meta.env.MANIFEST_VERSION
  }

  /**
   * Check if browser supports specific features
   * @param feature - Feature to check
   */
  static supportsFeature(feature: 'scripting' | 'declarativeNetRequest' | 'offscreen'): boolean {
    switch (feature) {
      case 'scripting':
        return this.manifestVersion === 3 && (this.isChrome || this.isEdge)
      case 'declarativeNetRequest':
        return this.manifestVersion === 3
      case 'offscreen':
        return this.manifestVersion === 3 && this.isChrome
      default:
        return false
    }
  }
}

/**
 * Error handling utilities for browser API operations
 */
export class BrowserError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
  ) {
    super(message)
    this.name = 'BrowserError'
  }

  /**
   * Create a BrowserError from a caught error
   * @param error - Original error
   * @param operation - Operation that failed
   */
  static fromError(error: unknown, operation: string): BrowserError {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new BrowserError(`${operation} failed: ${message}`, operation, error instanceof Error ? error : undefined)
  }
}

import { BrowserStorage, BrowserTabs } from '../utils/browser-api'
import { logger } from '../utils/logger'

import type { StorageOverride } from './statsig-integration'

/**
 * Content script response interface
 */
interface ContentScriptResponse {
  success: boolean
  error?: string
  data?: unknown
}

/**
 * Storage key for active overrides
 */
const ACTIVE_OVERRIDES_KEY = 'statsig_active_overrides'

/**
 * Storage state interface
 */
export interface StorageState {
  cookies: Record<string, string>
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
}

/**
 * Storage injection service for communicating with content scripts
 */
export class StorageInjectionService {
  /**
   * Get the active tab
   */
  private async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const tabs = await BrowserTabs.query({ active: true, currentWindow: true })
      return tabs[0] || null
    } catch (error) {
      logger.error('Failed to get active tab:', error)
      return null
    }
  }

  /**
   * Send message to content script
   */
  private async sendMessageToContentScript(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tab = await this.getActiveTab()
    if (!tab || !tab.id) {
      throw new Error('No active tab found')
    }

    try {
      const response = await BrowserTabs.sendMessage(tab.id, message)
      const typedResponse = response as ContentScriptResponse
      if (!typedResponse || !typedResponse.success) {
        throw new Error(typedResponse?.error || 'Content script operation failed')
      }
      return typedResponse as unknown as Record<string, unknown>
    } catch (error) {
      logger.error('Failed to send message to content script:', error)
      throw new Error(
        `Content script communication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Apply a storage override to the current page
   */
  async applyStorageOverride(override: StorageOverride): Promise<void> {
    logger.info('Applying storage override:', override)

    try {
      await this.sendMessageToContentScript({
        type: 'SET_STORAGE_OVERRIDE',
        payload: override,
      })

      logger.info('Storage override applied successfully')
    } catch (error) {
      logger.error('Failed to apply storage override:', error)
      throw error
    }
  }

  /**
   * Get current storage state from the page
   */
  async getStorageState(): Promise<StorageState> {
    logger.info('Getting storage state from page...')

    try {
      const response = await this.sendMessageToContentScript({
        type: 'GET_STORAGE_STATE',
      })

      const state = response.data as StorageState
      logger.info('Storage state retrieved successfully:', state)
      return state
    } catch (error) {
      logger.error('Failed to get storage state:', error)
      throw error
    }
  }

  /**
   * Apply multiple storage overrides
   */
  async applyMultipleOverrides(overrides: StorageOverride[]): Promise<void> {
    logger.info(`Applying ${overrides.length} storage overrides...`)

    const results = await Promise.allSettled(overrides.map((override) => this.applyStorageOverride(override)))

    const failures = results.filter((result) => result.status === 'rejected')
    if (failures.length > 0) {
      logger.error(`${failures.length} overrides failed to apply`)
      throw new Error(`Failed to apply ${failures.length} out of ${overrides.length} overrides`)
    }

    logger.info('All storage overrides applied successfully')
  }

  /**
   * Clear a specific storage value
   */
  async clearStorageValue(type: 'cookie' | 'localStorage' | 'sessionStorage', key: string): Promise<void> {
    logger.info(`Clearing ${type} value:`, key)

    try {
      await this.sendMessageToContentScript({
        type: 'CLEAR_STORAGE',
        payload: `${type}:${key}`,
      })

      logger.info(`${type} value cleared successfully`)
    } catch (error) {
      logger.error(`Failed to clear ${type} value:`, error)
      throw error
    }
  }

  /**
   * Check if content script is available on the current tab
   */
  async isContentScriptAvailable(): Promise<boolean> {
    try {
      const tab = await this.getActiveTab()
      if (!tab || !tab.id) {
        logger.info('No active tab found for content script check')
        return false
      }

      logger.info(`Checking content script availability on tab ${tab.id} (${tab.url})`)

      // Check if URL is injectable
      if (!this.isUrlInjectable(tab.url || '')) {
        logger.info(`❌ URL not injectable: ${tab.url}`)
        return false
      }

      // Try to ping the content script with retry logic
      const maxRetries = 5 // Increased retries for better reliability
      const retryDelay = 200 // Increased delay for content script initialization

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          logger.info(`Content script ping attempt ${attempt}/${maxRetries}`)
          const response = await BrowserTabs.sendMessage(tab.id, { type: 'PING' })
          const typedResponse = response as ContentScriptResponse
          const isAvailable = typedResponse && typedResponse.success

          if (isAvailable) {
            logger.info(`Content script available on attempt ${attempt}`)
            return true
          }

          logger.info(`Content script not available on attempt ${attempt}`, { response })

          // Wait before retry (except on last attempt)
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        } catch (error) {
          logger.info(`Content script ping failed on attempt ${attempt}:`, error)

          // On first failure, try to inject the content script
          if (attempt === 1) {
            try {
              logger.info(`🔄 Requesting content script injection for tab ${tab.id}`)
              await this.requestContentScriptInjection(tab.id)

              // Wait longer for injection to complete
              await new Promise((resolve) => setTimeout(resolve, 1000))

              // Try ping again after injection
              const retryResponse = await BrowserTabs.sendMessage(tab.id, { type: 'PING' })
              const typedRetryResponse = retryResponse as ContentScriptResponse
              if (typedRetryResponse?.success === true) {
                logger.info(`✅ Content script available after injection`)
                return true
              }
            } catch (injectionError) {
              logger.warn(`Failed to inject content script: ${injectionError}`)
            }
          }

          // Wait before retry (except on last attempt)
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        }
      }

      logger.info('Content script not available after all attempts')
      return false
    } catch (error) {
      // Content script not available or tab doesn't support it
      logger.info('Content script availability check failed:', error)
      return false
    }
  }

  /**
   * Request background script to inject content script
   */
  private async requestContentScriptInjection(tabId: number): Promise<void> {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'INJECT_CONTENT_SCRIPT',
        tabId,
      })

      if (!response?.success) {
        throw new Error(response?.error || 'Injection request failed')
      }

      logger.info(`📝 Content script injection requested for tab ${tabId}`)
    } catch (error) {
      logger.error(`Failed to request content script injection: ${error}`)
      throw error
    }
  }

  /**
   * Check if a URL is injectable (not a browser internal page)
   */
  private isUrlInjectable(url: string): boolean {
    if (!url) {
      return false
    }

    try {
      const urlObj = new URL(url)

      // Block browser internal pages
      const blockedProtocols = [
        'chrome:',
        'chrome-extension:',
        'moz-extension:',
        'edge:',
        'about:',
        'data:',
        'blob:',
        'file:',
      ]

      if (blockedProtocols.some((protocol) => url.startsWith(protocol))) {
        logger.info(`🚫 Blocked protocol: ${urlObj.protocol}`)
        return false
      }

      // Block browser internal domains
      const blockedDomains = [
        'chrome.google.com',
        'chromewebstore.google.com',
        'addons.mozilla.org',
        'microsoftedge.microsoft.com',
        'chrome-extension',
        'moz-extension',
      ]

      if (blockedDomains.some((domain) => urlObj.hostname.includes(domain))) {
        logger.info(`🚫 Blocked domain: ${urlObj.hostname}`)
        return false
      }

      // Only allow http and https
      const isValidProtocol = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      if (!isValidProtocol) {
        logger.info(`🚫 Invalid protocol: ${urlObj.protocol}`)
        return false
      }

      logger.info(`✅ URL is injectable: ${url}`)
      return true
    } catch (error) {
      logger.warn(`❌ Invalid URL for injection check: ${url}`, error)
      return false
    }
  }

  /**
   * Get current tab URL for context
   */
  async getCurrentTabUrl(): Promise<string | null> {
    const tab = await this.getActiveTab()
    return tab?.url || null
  }

  /**
   * Check if the current tab supports storage injection
   */
  async canInjectStorage(): Promise<{ canInject: boolean; reason?: string }> {
    logger.info('Checking if storage injection is possible')

    const tab = await this.getActiveTab()

    if (!tab) {
      logger.info('❌ Cannot inject: No active tab found')
      return { canInject: false, reason: 'No active tab found. Please open a webpage first.' }
    }

    if (!tab.url) {
      logger.info('❌ Cannot inject: Tab URL not available')
      return { canInject: false, reason: 'Tab URL not available. Please refresh the page.' }
    }

    logger.info(`🔍 Checking injection for tab: ${tab.url}`)

    // Check if URL is injectable using the new method
    if (!this.isUrlInjectable(tab.url)) {
      const url = new URL(tab.url)
      logger.info(`❌ Cannot inject: URL not injectable - ${url.protocol}`)

      if (url.protocol.startsWith('chrome:') || url.protocol.startsWith('chrome-extension:')) {
        return {
          canInject: false,
          reason: 'Cannot inject into Chrome internal pages. Please navigate to a regular website.',
        }
      }
      if (url.protocol.startsWith('moz-extension:') || url.protocol.startsWith('about:')) {
        return {
          canInject: false,
          reason: 'Cannot inject into Firefox internal pages. Please navigate to a regular website.',
        }
      }
      if (url.protocol === 'file:') {
        return {
          canInject: false,
          reason: 'Cannot inject into local files. Please navigate to a website (http/https).',
        }
      }

      return {
        canInject: false,
        reason: `Cannot inject into ${url.protocol} pages. Please navigate to a regular website.`,
      }
    }

    // Check if content script is available
    const isAvailable = await this.isContentScriptAvailable()
    if (!isAvailable) {
      logger.info('❌ Cannot inject: Content script not available')
      return {
        canInject: false,
        reason: 'Content script not available. Please refresh the page and try again.',
      }
    }

    logger.info('✅ Storage injection is available')
    return { canInject: true }
  }

  /**
   * Get active overrides from storage
   */
  async getActiveOverrides(): Promise<StorageOverride[]> {
    try {
      const overrides = await BrowserStorage.get<StorageOverride[]>(ACTIVE_OVERRIDES_KEY)
      return overrides || []
    } catch (error) {
      logger.error('Failed to get active overrides:', error)
      return []
    }
  }

  /**
   * Save active overrides to storage
   */
  private async saveActiveOverrides(overrides: StorageOverride[]): Promise<void> {
    try {
      await BrowserStorage.set(ACTIVE_OVERRIDES_KEY, overrides)
    } catch (error) {
      logger.error('Failed to save active overrides:', error)
      throw error
    }
  }

  /**
   * Generate unique ID for override
   */
  private generateOverrideId(override: StorageOverride): string {
    return `${override.type}:${override.key}:${override.domain || 'default'}`
  }

  /**
   * Create a new override
   */
  async createOverride(override: StorageOverride): Promise<void> {
    logger.info('Creating override:', override)

    try {
      // Apply the override to the current page
      await this.applyStorageOverride(override)

      // Get current overrides
      const currentOverrides = await this.getActiveOverrides()

      // Generate unique ID for the override
      const overrideId = this.generateOverrideId(override)

      // Remove any existing override with the same ID
      const filteredOverrides = currentOverrides.filter((existing) => this.generateOverrideId(existing) !== overrideId)

      // Add the new override with ID
      const newOverride = { ...override, id: overrideId }
      filteredOverrides.push(newOverride)

      // Save updated overrides
      await this.saveActiveOverrides(filteredOverrides)

      logger.info('Override created and saved successfully')
    } catch (error) {
      logger.error('Failed to create override:', error)
      throw error
    }
  }

  /**
   * Remove an override by ID
   */
  async removeOverride(overrideId: string): Promise<void> {
    logger.info('Removing override:', overrideId)

    try {
      // Get current overrides
      const currentOverrides = await this.getActiveOverrides()

      // Find the override to remove
      const overrideToRemove = currentOverrides.find(
        (override) =>
          (override as StorageOverride & { id?: string }).id === overrideId ||
          this.generateOverrideId(override) === overrideId,
      )

      if (overrideToRemove) {
        // Remove the override from the page
        await this.sendMessageToContentScript({
          type: 'REMOVE_STORAGE_OVERRIDE',
          payload: overrideToRemove,
        })
      }

      // Remove from stored overrides
      const filteredOverrides = currentOverrides.filter(
        (override) =>
          (override as StorageOverride & { id?: string }).id !== overrideId &&
          this.generateOverrideId(override) !== overrideId,
      )

      // Save updated overrides
      await this.saveActiveOverrides(filteredOverrides)

      logger.info('Override removed successfully')
    } catch (error) {
      logger.error('Failed to remove override:', error)
      throw error
    }
  }

  /**
   * Clear all overrides
   */
  async clearAllOverrides(): Promise<void> {
    logger.info('Clearing all overrides')

    try {
      // Get current overrides
      const currentOverrides = await this.getActiveOverrides()

      // Remove each override from the page
      for (const override of currentOverrides) {
        try {
          await this.sendMessageToContentScript({
            type: 'REMOVE_STORAGE_OVERRIDE',
            payload: override,
          })
        } catch (error) {
          logger.error('Failed to remove override from page:', error)
          // Continue with other overrides
        }
      }

      // Clear stored overrides
      await this.saveActiveOverrides([])

      logger.info('All overrides cleared successfully')
    } catch (error) {
      logger.error('Failed to clear all overrides:', error)
      throw error
    }
  }

  /**
   * Get current tab domain for auto-filling cookie domain
   */
  async getCurrentTabDomain(): Promise<string | null> {
    try {
      const tab = await this.getActiveTab()
      if (!tab?.url) {
        return null
      }

      const url = new URL(tab.url)
      return url.hostname
    } catch (error) {
      logger.error('Failed to get current tab domain:', error)
      return null
    }
  }
}

/**
 * Singleton instance of the storage injection service
 */
export const storageInjectionService = new StorageInjectionService()

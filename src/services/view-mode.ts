import { logger } from '../utils/logger'

/**
 * View Mode Service
 * Manages switching between popup and sidebar modes
 */

export type ViewMode = 'popup' | 'sidebar' | 'tab'

interface ViewModePreferences {
  preferredMode: ViewMode
  lastUsed: number
}

class ViewModeService {
  private readonly STORAGE_KEY = 'statsig_view_mode_preferences'

  /**
   * Get current view mode preferences
   */
  async getPreferences(): Promise<ViewModePreferences> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY)
      return (
        result[this.STORAGE_KEY] || {
          preferredMode: 'popup' as ViewMode,
          lastUsed: Date.now(),
        }
      )
    } catch (error) {
      logger.error('Failed to get view mode preferences:', error)
      return {
        preferredMode: 'popup' as ViewMode,
        lastUsed: Date.now(),
      }
    }
  }

  /**
   * Save view mode preferences
   */
  async savePreferences(preferences: ViewModePreferences): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: {
          ...preferences,
          lastUsed: Date.now(),
        },
      })
    } catch (error) {
      logger.error('Failed to save view mode preferences:', error)
    }
  }

  /**
   * Switch to sidebar mode
   */
  async switchToSidebar(): Promise<void> {
    try {
      logger.info('Attempting to switch to sidebar mode...')

      // Check if sidePanel API is available
      if (!chrome.sidePanel) {
        throw new Error('Chrome sidePanel API is not available. Please update Chrome to version 114 or later.')
      }

      // Save preference
      await this.savePreferences({
        preferredMode: 'sidebar',
        lastUsed: Date.now(),
      })

      // Get current window
      const currentWindow = await chrome.windows.getCurrent()
      logger.info('Current window:', currentWindow)

      if (!currentWindow.id) {
        logger.warn('Could not get current window ID, skipping sidebar opening')
        return
      }

      // Try to open sidebar via background script first (more reliable)
      try {
        const response = await chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' })
        if (response?.success) {
          logger.info('Sidebar opened successfully via background script')
          return
        }
      } catch (backgroundError) {
        logger.warn('Background script sidepanel opening failed, trying direct approach:', backgroundError)
      }

      // Fallback: Direct API call
      logger.info(`Opening sidebar for window ${currentWindow.id}`)
      await chrome.sidePanel.open({ windowId: currentWindow.id })

      logger.info('Sidebar opened successfully via direct API')

      // Close popup if it's open (this will happen automatically when sidebar opens)
    } catch (error) {
      logger.error('Failed to switch to sidebar:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('sidePanel') || error.message.includes('Sidebar')) {
          throw new Error('Sidebar feature is not available. Please update Chrome to version 114 or later.')
        }
        if (error.message.includes('permission')) {
          throw new Error('Sidebar permission denied. Please check extension permissions.')
        }
        if (error.message.includes('Cannot access')) {
          throw new Error('Cannot access sidebar API. Please reload the extension.')
        }
      }

      throw new Error(`Could not open sidebar: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Switch to popup mode
   */
  async switchToPopup(): Promise<void> {
    try {
      // Save preference
      await this.savePreferences({
        preferredMode: 'popup',
        lastUsed: Date.now(),
      })

      // Close sidebar (if open) and the popup will be available on next click
      // Note: We can't directly open popup from sidebar, user needs to click the extension icon

      // Show notification to user
      this.showSwitchNotification('popup')
    } catch (error) {
      logger.error('Failed to switch to popup:', error)
      throw new Error('Could not switch to popup mode.')
    }
  }

  /**
   * Switch to tab mode
   */
  async switchToTab(): Promise<void> {
    try {
      // Save preference
      await this.savePreferences({
        preferredMode: 'tab',
        lastUsed: Date.now(),
      })

      // Get the correct URL for tab
      let tabUrl: string

      try {
        // Try to get the extension URL first (works in both dev and prod)
        tabUrl = chrome.runtime.getURL('tab.html')
      } catch (error) {
        // Fallback for development
        logger.warn('Could not get extension URL, using fallback:', error)
        tabUrl = `${window.location.origin}/tab.html`
      }

      // Open in new tab
      await chrome.tabs.create({
        url: tabUrl,
        active: true,
      })

      // Show notification
      this.showSwitchNotification('tab')
    } catch (error) {
      logger.error('Failed to switch to tab:', error)
      throw new Error('Could not open in new tab.')
    }
  }

  /**
   * Get the current view mode based on context
   */
  getCurrentMode(): ViewMode {
    // Check if we're in a tab context
    if (window.location.pathname.includes('tab')) {
      return 'tab'
    }

    // Check if we're in a sidebar context
    if (window.location.pathname.includes('sidepanel')) {
      return 'sidebar'
    }

    // Check if we're in a popup context
    if (window.location.pathname.includes('popup')) {
      return 'popup'
    }

    // Default to popup
    return 'popup'
  }

  /**
   * Check if sidebar is supported
   */
  isSidebarSupported(): boolean {
    try {
      // Check if Chrome API is available
      if (typeof chrome === 'undefined') {
        logger.info('Chrome API not available')
        return false
      }

      // Check if sidePanel API exists
      if (!chrome.sidePanel) {
        logger.info('Chrome sidePanel API not available - Chrome version may be too old')
        return false
      }

      // Check if open method exists
      if (typeof chrome.sidePanel.open !== 'function') {
        logger.info('Chrome sidePanel.open method not available')
        return false
      }

      // Additional check for permissions
      const manifest = chrome.runtime.getManifest()
      if (!manifest.permissions?.includes('sidePanel')) {
        logger.info('sidePanel permission not found in manifest')
        return false
      }

      logger.info('Sidebar is supported')
      return true
    } catch (error) {
      logger.error('Error checking sidebar support:', error)
      return false
    }
  }

  /**
   * Test sidebar functionality (for debugging)
   */
  async testSidebarAPI(): Promise<{ supported: boolean; error?: string; details?: any }> {
    try {
      const supported = this.isSidebarSupported()

      if (!supported) {
        return { supported: false, error: 'Sidebar API not supported' }
      }

      // Try to get current window
      const currentWindow = await chrome.windows.getCurrent()

      return {
        supported: true,
        details: {
          chromeVersion: navigator.userAgent,
          windowId: currentWindow.id,
          manifestVersion: chrome.runtime.getManifest().manifest_version,
          permissions: chrome.runtime.getManifest().permissions,
        },
      }
    } catch (error) {
      return {
        supported: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
      }
    }
  }

  /**
   * Show notification when switching modes
   */
  private showSwitchNotification(targetMode: ViewMode): void {
    const message =
      targetMode === 'popup'
        ? 'Switched to popup mode. Click the extension icon to open the popup.'
        : targetMode === 'sidebar'
          ? 'Opening sidebar...'
          : 'Opening in new tab...'

    // Create a temporary notification
    const notification = document.createElement('div')
    notification.className =
      'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  /**
   * Initialize view mode based on user preferences
   */
  async initializeViewMode(): Promise<void> {
    try {
      const preferences = await this.getPreferences()
      const currentMode = this.getCurrentMode()

      // If user prefers sidebar but we're in popup, suggest switching
      if (preferences.preferredMode === 'sidebar' && currentMode === 'popup' && this.isSidebarSupported()) {
        // Don't auto-switch, just make the toggle button more prominent
        logger.info('User prefers sidebar mode')
      }
    } catch (error) {
      logger.error('Failed to initialize view mode:', error)
    }
  }
}

export const viewModeService = new ViewModeService()

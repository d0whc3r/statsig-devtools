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
      // Save preference
      await this.savePreferences({
        preferredMode: 'sidebar',
        lastUsed: Date.now(),
      })

      // Open sidebar
      const currentWindow = await chrome.windows.getCurrent()
      if (currentWindow.id) {
        await chrome.sidePanel.open({ windowId: currentWindow.id })
      }

      // Close popup if it's open (this will happen automatically when sidebar opens)
    } catch (error) {
      logger.error('Failed to switch to sidebar:', error)
      throw new Error('Could not open sidebar. Make sure you have the latest Chrome version.')
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
    return (
      typeof chrome !== 'undefined' && chrome.sidePanel !== undefined && typeof chrome.sidePanel.open === 'function'
    )
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

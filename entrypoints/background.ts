import {
  type ActiveTabData,
  backgroundCommand,
  backgroundMessageAction,
  type ManifestInfoData,
  type SendResponse,
} from '@/src/types/background.types'
import { Logger } from '@/src/utils/logger'

const logger = new Logger('BACKGROUND')

export default defineBackground(() => {
  logger.info('Statsig DevTools background script loaded', {
    timestamp: new Date().toISOString(),
    version: browser.runtime.getManifest().version,
  })

  // Handle extension installation
  browser.runtime.onInstalled.addListener((details) => {
    logger.info('Extension installed', {
      reason: details.reason,
      previousVersion: details.previousVersion,
      timestamp: new Date().toISOString(),
    })
  })

  // Handle messages from popup/sidebar/tab interfaces
  browser.runtime.onMessage.addListener((message, _sender, sendResponse: SendResponse) => {
    logger.debug('Received message', { type: message.type, sender: _sender.tab?.url })

    switch (message.type) {
      case backgroundMessageAction.GET_ACTIVE_TAB:
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            const activeTab = tabs[0]
            if (activeTab) {
              const canInject = canInjectIntoTab(activeTab.url)
              const tabData: ActiveTabData = {
                ...activeTab,
                canInject,
              }
              logger.debug('Active tab retrieved', tabData)
              sendResponse({
                success: true,
                data: tabData,
              })
            } else {
              logger.warn('No active tab found')
              sendResponse({ success: false, data: null, error: 'No active tab found' })
            }
          })
          .catch((error) => {
            logger.error('Failed to get active tab', error)
            sendResponse({ success: false, data: null, error: error.message })
          })
        return true

      case backgroundMessageAction.GET_MANIFEST_INFO:
        try {
          const manifest = browser.runtime.getManifest()
          const manifestData: ManifestInfoData = {
            name: manifest.name,
            version: manifest.version,
            description: manifest.description ?? '',
          }
          logger.debug('Manifest info retrieved', manifestData)
          sendResponse({
            success: true,
            data: manifestData,
          })
        } catch (error) {
          logger.error('Failed to get manifest info', error)
          sendResponse({ success: false, data: null, error: 'Failed to get manifest info' })
        }
        return true

      case backgroundMessageAction.PING_BACKGROUND:
        logger.debug('PING_BACKGROUND received, responding with timestamp')
        sendResponse({ success: true, data: { timestamp: Date.now() } })
        return true

      case backgroundMessageAction.OPEN_SIDEPANEL:
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (browser.sidePanel?.open) {
          logger.debug('Opening sidepanel')
          browser.windows
            .getCurrent()
            .then((window) => {
              if (window.id) {
                logger.debug('Opening sidepanel for window', { windowId: window.id })
                return browser.sidePanel.open({ windowId: window.id })
              }
            })
            .then(() => {
              logger.info('Sidepanel opened successfully')
              sendResponse({ success: true, data: undefined })
            })
            .catch((error) => {
              logger.error('Failed to open sidepanel', error)
              sendResponse({ success: false, data: null, error: error.message })
            })
        } else {
          logger.warn('Sidepanel API not available')
          sendResponse({ success: false, data: null, error: 'Sidepanel not available' })
        }
        return true

      default:
        logger.warn('Unknown message type received', { type: message.type })
        sendResponse({ success: false, data: null, error: 'Unknown message type' })
        return true
    }
  })

  // Helper function to check if we can inject into a tab
  function canInjectIntoTab(url?: string): boolean {
    if (!url) {
      logger.debug('Cannot inject: no URL provided')
      return false
    }

    // Block internal browser pages
    if (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('file://')
    ) {
      logger.debug('Cannot inject: internal browser page', { url })
      return false
    }

    // Block browser store pages
    if (
      url.includes('chromewebstore.google.com') ||
      url.includes('addons.mozilla.org') ||
      url.includes('microsoftedge.microsoft.com/addons')
    ) {
      logger.debug('Cannot inject: browser store page', { url })
      return false
    }

    // Allow HTTP/HTTPS pages
    const canInject = url.startsWith('http://') || url.startsWith('https://')
    logger.debug('Injection check result', { url, canInject })
    return canInject
  }

  // Handle side panel functionality
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (browser.sidePanel?.setPanelBehavior) {
    logger.debug('Setting sidepanel behavior')
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: false })
      .then(() => {
        logger.debug('Sidepanel behavior set successfully')
      })
      .catch((error) => {
        logger.debug('Failed to set sidepanel behavior (likely older Chrome version)', error)
      })
  } else {
    logger.debug('Sidepanel API not available')
  }

  // Handle keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    logger.debug('Keyboard command received', { command })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (command === backgroundCommand.OPEN_SIDEPANEL && browser.sidePanel?.open) {
      logger.debug('Opening sidepanel via keyboard shortcut')
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0]?.windowId) {
            logger.debug('Opening sidepanel for active tab', { windowId: tabs[0].windowId })
            return browser.sidePanel.open({ windowId: tabs[0].windowId })
          }
        })
        .then(() => {
          logger.info('Sidepanel opened via keyboard shortcut')
        })
        .catch((error) => {
          logger.error('Failed to open sidepanel via keyboard shortcut', error)
        })
    }
  })
})

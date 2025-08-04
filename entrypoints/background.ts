import { BrowserDetection, BrowserRuntime, BrowserTabs } from '@/src/utils/browser-api'
import { logger } from '@/src/utils/logger'

// Message types for background script
interface BackgroundMessage {
  type: string
  tabId?: number
  [key: string]: unknown
}

/**
 * Content script response interface
 */
interface ContentScriptResponse {
  success: boolean
  error?: string
  data?: unknown
}

/**
 * Background service worker for Statsig Developer Tools
 * Handles extension lifecycle, tab monitoring, and message routing
 */

/**
 * Initialize background service worker
 */
function initializeBackgroundService(): void {
  logger.log('🚀 Statsig Developer Tools background service worker loaded')
  logger.log(`📱 Running on ${BrowserDetection.browserName} with Manifest v${BrowserDetection.manifestVersion}`)

  logBrowserCompatibility()
}

/**
 * Setup message handling for communication with content scripts and UI
 */
function setupMessageHandling(): void {
  BrowserRuntime.addMessageListener(
    (message: unknown, sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => {
      const handleMessage = async () => {
        logger.log('📨 Background received message:', JSON.stringify(message))

        try {
          // Type guard for message
          const typedMessage = message as BackgroundMessage

          // Handle content script injection requests
          if (typedMessage.type === 'INJECT_CONTENT_SCRIPT') {
            const tabId = typedMessage.tabId || sender.tab?.id
            if (tabId) {
              await injectContentScriptIfNeeded(tabId)
              sendResponse({ success: true })
            } else {
              sendResponse({ success: false, error: 'No tab ID provided' })
            }
            return true
          }

          // Handle ping requests to check if background is alive
          if (typedMessage.type === 'PING_BACKGROUND') {
            sendResponse({ success: true, timestamp: Date.now() })
            return true
          }

          // Handle debug storage test requests
          if (typedMessage.type === 'DEBUG_STORAGE_TEST') {
            // Handle async operation
            const handleDebugTest = async () => {
              try {
                // Get the active tab
                const tabs = await browser.tabs.query({ active: true, currentWindow: true })
                const activeTab = tabs[0]

                if (!activeTab?.id) {
                  logger.error('🧪 No active tab found')
                  const errorResult = { success: false, error: 'No active tab found' }
                  logger.log('🧪 Sending error response to popup:', JSON.stringify(errorResult))
                  sendResponse(errorResult)
                  return
                }

                const tabId = activeTab.id
                logger.log(`🧪 Testing storage on tab ${tabId} (${activeTab.url})`)

                // Test setting a simple localStorage value
                const testOverride = {
                  type: 'localStorage',
                  key: 'statsig_debug_test',
                  value: `test_value_${Date.now()}`,
                }

                const response = await BrowserTabs.sendMessage(tabId, {
                  type: 'SET_STORAGE_OVERRIDE',
                  payload: testOverride,
                })

                logger.log('🧪 Content script response:', JSON.stringify(response))

                const typedResponse = response as ContentScriptResponse
                const result = {
                  success: typedResponse?.success === true,
                  testOverride,
                  response,
                  tabId,
                  tabUrl: activeTab.url,
                }

                logger.log('🧪 Sending response to popup:', JSON.stringify(result))

                // Use setTimeout to ensure the response is sent after the current execution context
                setTimeout(() => {
                  sendResponse(result)
                }, 0)
              } catch (error) {
                logger.error('🧪 Debug storage test failed:', error)
                const errorResult = {
                  success: false,
                  error: String(error),
                }
                logger.log('🧪 Sending error response to popup:', JSON.stringify(errorResult))

                setTimeout(() => {
                  sendResponse(errorResult)
                }, 0)
              }
            }

            handleDebugTest()
            return true // Keep message channel open for async response
          }

          // Default response for unknown messages
          sendResponse({ success: false, error: 'Unknown message type' })
        } catch (error) {
          logger.error('Error handling message:', error)
          sendResponse({ success: false, error: String(error) })
        }

        return true // Keep message channel open for async responses
      }

      handleMessage()
      return true // Keep message channel open for async responses
    },
  )
}

/**
 * Setup extension lifecycle event handlers
 */
function setupLifecycleHandlers(): void {
  // Handle extension installation and updates
  browser.runtime.onInstalled.addListener((details) => {
    logger.log('📦 Extension installed:', details.reason)

    switch (details.reason) {
      case 'install':
        logger.log('✨ First time installation - performing initial setup')
        handleFirstInstall()
        break
      case 'update':
        logger.log('🔄 Extension updated - checking for migration needs')
        handleExtensionUpdate(details.previousVersion)
        break
      default:
        logger.log('🔧 Extension lifecycle event:', details.reason)
    }
  })

  // Handle extension startup
  browser.runtime.onStartup.addListener(() => {
    logger.log('🌅 Extension startup detected')
  })
}

/**
 * Setup tab monitoring for content script coordination
 */
function setupTabMonitoring(): void {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only process when tab loading is complete and has a URL
    if (changeInfo.status !== 'complete' || !tab.url) {
      return
    }

    logger.log('🔄 Tab updated:', `tabId: ${tabId}, url: ${tab.url}`)

    try {
      await validateTabAccess()
    } catch (error) {
      logger.error('❌ Tab access validation failed:', error)
    }
  })
}

/**
 * Handle first-time installation setup
 */
function handleFirstInstall(): void {
  // Perform any initial setup tasks
  logger.log('🎯 Performing first-time setup')
  // Future: Initialize default settings, show welcome page, etc.
}

/**
 * Handle extension updates
 */
function handleExtensionUpdate(previousVersion?: string): void {
  logger.log('📈 Handling extension update', `previousVersion: ${previousVersion || 'unknown'}`)
  // Future: Perform migration tasks, show update notes, etc.
}

/**
 * Validate tab access and browser API functionality
 */
async function validateTabAccess(): Promise<void> {
  try {
    const activeTab = await BrowserTabs.getActiveTab()
    if (activeTab?.url) {
      logger.log('✅ Active tab access validated:', activeTab.url)
    }
  } catch (error) {
    logger.error('❌ Failed to access active tab:', error)
  }
}

/**
 * Inject content script into a tab if it's not already present
 * Note: Content scripts are now automatically injected via manifest declaration,
 * but this function provides a fallback for edge cases where manual injection is needed
 */
async function injectContentScriptIfNeeded(tabId: number): Promise<void> {
  try {
    // First check if content script is already present
    try {
      const response = await BrowserTabs.sendMessage(tabId, { type: 'PING' })
      const typedResponse = response as ContentScriptResponse
      if (typedResponse?.success) {
        logger.log(`✅ Content script already present in tab ${tabId}`)
        return
      }
    } catch {
      // Content script not present, this might be expected for certain URLs
      logger.log(`📝 Content script not responding in tab ${tabId}, checking if injection is possible...`)
    }

    // Get tab info to check if injection is allowed
    const tab = await browser.tabs.get(tabId)
    if (!tab?.url) {
      throw new Error('Tab URL not available')
    }

    // Check if URL supports content script injection
    if (!isUrlInjectable(tab.url)) {
      throw new Error(`URL not injectable: ${tab.url}`)
    }

    // Since content scripts are declared in manifest, they should auto-inject
    // Wait a moment and try again before manual injection
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const retryResponse = await BrowserTabs.sendMessage(tabId, { type: 'PING' })
      const typedRetryResponse = retryResponse as ContentScriptResponse
      if (typedRetryResponse?.success) {
        logger.log(`✅ Content script became available after waiting in tab ${tabId}`)
        return
      }
    } catch {
      logger.log(`📝 Content script still not available, attempting manual injection...`)
    }

    // Manual injection as fallback
    if (BrowserDetection.supportsFeature('scripting')) {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['/content-scripts/content.js'],
      })
      logger.log(`✅ Content script manually injected into tab ${tabId}`)
    } else {
      // Fallback for older browsers
      await browser.tabs.executeScript(tabId, {
        file: '/content-scripts/content.js',
      })
      logger.log(`✅ Content script manually injected into tab ${tabId} (fallback method)`)
    }

    // Wait a moment for the script to initialize
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Verify injection was successful
    const response = await BrowserTabs.sendMessage(tabId, { type: 'PING' })
    const typedResponse = response as ContentScriptResponse
    if (!typedResponse?.success) {
      throw new Error('Content script injection verification failed')
    }

    logger.log(`🎉 Content script successfully injected and verified in tab ${tabId}`)
  } catch (error) {
    logger.error(`❌ Failed to inject content script into tab ${tabId}:`, error)
    throw error
  }
}

/**
 * Check if a URL supports content script injection
 */
function isUrlInjectable(url: string): boolean {
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
      return false
    }

    // Block browser internal domains
    const blockedDomains = [
      'chrome.google.com',
      'chromewebstore.google.com',
      'addons.mozilla.org',
      'microsoftedge.microsoft.com',
    ]
    if (blockedDomains.some((domain) => urlObj.hostname.includes(domain))) {
      return false
    }

    // Only allow http and https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Log browser compatibility information
 */
function logBrowserCompatibility(): void {
  logger.log('🔍 Browser compatibility check:')
  logger.log(`  • Chrome: ${String(BrowserDetection.isChrome)}`)
  logger.log(`  • Firefox: ${String(BrowserDetection.isFirefox)}`)
  logger.log(`  • Safari: ${String(BrowserDetection.isSafari)}`)
  logger.log(`  • Edge: ${String(BrowserDetection.isEdge)}`)
  logger.log(`  • Scripting API: ${String(BrowserDetection.supportsFeature('scripting'))}`)
  logger.log(`  • DeclarativeNetRequest: ${String(BrowserDetection.supportsFeature('declarativeNetRequest'))}`)
}

/**
 * Main background script entry point
 */
export default defineBackground(() => {
  initializeBackgroundService()
  setupMessageHandling()
  setupLifecycleHandlers()
  setupTabMonitoring()
})

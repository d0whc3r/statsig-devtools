import { BrowserDetection, BrowserRuntime, BrowserTabs } from '@/src/utils/browser-api'

// Logger condicional para desarrollo
const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  },
}

export default defineBackground(() => {
  logger.log('Statsig Developer Tools background service worker loaded')
  logger.log(`Running on ${BrowserDetection.browserName} with Manifest v${BrowserDetection.manifestVersion}`)

  // Service worker event listeners
  BrowserRuntime.addMessageListener((message, _sender, _sendResponse) => {
    logger.log('Background received message:', message)

    // Message handling will be expanded in later tasks
    return true // Keep message channel open for async responses
  })

  // Handle extension startup and installation
  browser.runtime.onInstalled.addListener((details) => {
    logger.log('Extension installed:', details.reason)

    // Initialize extension on install/update
    if (details.reason === 'install') {
      logger.log('First time installation')
      // Perform initial setup
    } else if (details.reason === 'update') {
      logger.log('Extension updated')
      // Handle extension updates
    }
  })

  // Handle extension startup
  browser.runtime.onStartup.addListener(() => {
    logger.log('Extension startup')
  })

  // Handle tab updates for content script injection
  browser.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      logger.log('Tab updated:', tab.url)

      // Test basic browser API functionality
      try {
        const activeTab = await BrowserTabs.getActiveTab()
        if (activeTab) {
          logger.log('Active tab detected:', activeTab.url)
        }
      } catch (error) {
        logger.error('Failed to get active tab:', error)
      }
    }
  })

  // Test browser compatibility on startup
  logger.log('Browser compatibility check:')
  logger.log('- Chrome:', BrowserDetection.isChrome)
  logger.log('- Firefox:', BrowserDetection.isFirefox)
  logger.log('- Safari:', BrowserDetection.isSafari)
  logger.log('- Edge:', BrowserDetection.isEdge)
  logger.log('- Supports scripting API:', BrowserDetection.supportsFeature('scripting'))
  logger.log('- Supports declarativeNetRequest:', BrowserDetection.supportsFeature('declarativeNetRequest'))
})

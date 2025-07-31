export default defineBackground(() => {
  console.log('Statsig Developer Tools background service worker loaded')

  // Service worker event listeners
  browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason)

    // Initialize extension on install/update
    if (details.reason === 'install') {
      console.log('First time installation')
    } else if (details.reason === 'update') {
      console.log('Extension updated')
    }
  })

  // Handle extension startup
  browser.runtime.onStartup.addListener(() => {
    console.log('Extension startup')
  })

  // Message handling between popup and background
  browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('Background received message:', message)

    // Message handling will be expanded in later tasks
    return true // Keep message channel open for async responses
  })

  // Handle tab updates for content script injection
  browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // Tab update handling will be expanded in later tasks
      console.log('Tab updated:', tab.url)
    }
  })
})

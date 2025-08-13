export default defineBackground(() => {
  console.log('Statsig DevTools background script loaded')

  // Handle extension installation
  browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason)
  })

  // Handle messages from popup/sidebar/tab interfaces
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'GET_ACTIVE_TAB':
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            const activeTab = tabs[0]
            if (activeTab) {
              sendResponse({
                success: true,
                data: {
                  id: activeTab.id,
                  url: activeTab.url,
                  title: activeTab.title,
                  canInject: canInjectIntoTab(activeTab.url),
                },
              })
            } else {
              sendResponse({ success: false, error: 'No active tab found' })
            }
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message })
          })
        return true

      case 'PING_BACKGROUND':
        sendResponse({ success: true, timestamp: Date.now() })
        return true

      case 'OPEN_SIDEPANEL':
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (browser.sidePanel?.open) {
          browser.windows
            .getCurrent()
            .then((window) => {
              if (window.id) {
                return browser.sidePanel.open({ windowId: window.id })
              }
            })
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }))
        } else {
          sendResponse({ success: false, error: 'Sidepanel not available' })
        }
        return true

      default:
        sendResponse({ success: false, error: 'Unknown message type' })
        return true
    }
  })

  // Helper function to check if we can inject into a tab
  function canInjectIntoTab(url?: string): boolean {
    if (!url) return false

    // Block internal browser pages
    if (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('file://')
    ) {
      return false
    }

    // Block browser store pages
    if (url.includes('chromewebstore.google.com') || url.includes('addons.mozilla.org')) {
      return false
    }

    // Allow HTTP/HTTPS pages
    return url.startsWith('http://') || url.startsWith('https://')
  }

  // Handle side panel functionality
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (browser.sidePanel?.setPanelBehavior) {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {}) // Ignore errors for older Chrome versions
  }

  // Handle keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (command === 'open-sidepanel' && browser.sidePanel?.open) {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0]?.windowId) {
            return browser.sidePanel.open({ windowId: tabs[0].windowId })
          }
        })
        .catch(console.error)
    }
  })
})

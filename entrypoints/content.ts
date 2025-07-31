export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  allFrames: false,

  main() {
    console.log('Statsig Developer Tools content script loaded on:', window.location.href)

    // Message listener for storage manipulation requests
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      console.log('Content script received message:', message)

      // Storage manipulation handling will be expanded in later tasks
      switch (message.type) {
        case 'ping':
          sendResponse({ status: 'pong' })
          break
        default:
          console.log('Unknown message type:', message.type)
      }

      return true // Keep message channel open for async responses
    })

    // Initialize content script functionality
    // This will be expanded in later tasks for:
    // - localStorage manipulation
    // - sessionStorage manipulation
    // - Cookie reading/setting
    // - DOM injection if needed
  },
})

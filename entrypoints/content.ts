import { BrowserCookies, BrowserDetection, BrowserRuntime, BrowserStorage } from '@/src/utils/browser-api'

// Logger condicional para desarrollo
const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  },
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    logger.log('Statsig Developer Tools content script loaded')
    logger.log(`Running on ${BrowserDetection.browserName} with Manifest v${BrowserDetection.manifestVersion}`)

    // Message listener for storage manipulation
    BrowserRuntime.addMessageListener((message, _sender, sendResponse) => {
      logger.log('Content script received message:', message)

      // Handle async operations
      const handleMessage = async () => {
        try {
          switch (message.type) {
            case 'GET_LOCAL_STORAGE': {
              // Get localStorage data using extension storage
              const localData = await BrowserStorage.get(message.key, 'local')
              sendResponse({ success: true, data: localData })
              break
            }

            case 'SET_LOCAL_STORAGE': {
              // Set localStorage data using extension storage
              await BrowserStorage.set(message.key, message.value, 'local')
              sendResponse({ success: true })
              break
            }

            case 'GET_SESSION_STORAGE': {
              // Get sessionStorage data using extension storage
              const sessionData = await BrowserStorage.get(message.key, 'session')
              sendResponse({ success: true, data: sessionData })
              break
            }

            case 'SET_SESSION_STORAGE': {
              // Set sessionStorage data using extension storage
              await BrowserStorage.set(message.key, message.value, 'session')
              sendResponse({ success: true })
              break
            }

            case 'GET_COOKIES': {
              // Get cookies for current domain
              const cookies = await BrowserCookies.get(window.location.href)
              sendResponse({ success: true, data: cookies })
              break
            }

            case 'SET_COOKIE': {
              // Set cookie for current domain
              await BrowserCookies.set({
                url: window.location.href,
                ...message.cookie,
              })
              sendResponse({ success: true })
              break
            }

            case 'REMOVE_COOKIE': {
              // Remove cookie for current domain
              await BrowserCookies.remove({
                url: window.location.href,
                name: message.name,
              })
              sendResponse({ success: true })
              break
            }

            default:
              logger.warn('Unknown message type:', message.type)
              sendResponse({ success: false, error: 'Unknown message type' })
          }
        } catch (error) {
          logger.error('Content script error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          sendResponse({ success: false, error: errorMessage })
        }
      }

      // Execute async handler
      handleMessage()
      return true // Keep message channel open for async responses
    })

    // Test browser compatibility
    logger.log('Content script browser compatibility check:')
    logger.log('- Chrome:', BrowserDetection.isChrome)
    logger.log('- Firefox:', BrowserDetection.isFirefox)
    logger.log('- Supports scripting API:', BrowserDetection.supportsFeature('scripting'))
    logger.log('- Supports declarativeNetRequest:', BrowserDetection.supportsFeature('declarativeNetRequest'))

    // Inject page detection script if needed
    if (BrowserDetection.supportsFeature('scripting')) {
      logger.log('Scripting API available for advanced page manipulation')
    }
  },
})

interface StorageOverridePayload {
  type: 'localStorage' | 'sessionStorage' | 'cookie'
  key: string
  value?: string
  domain?: string
}

interface GetStoragePayload {
  type: 'localStorage' | 'sessionStorage' | 'cookie'
  key: string
}

interface ContentScriptMessage {
  type: 'SET_STORAGE_OVERRIDE' | 'REMOVE_STORAGE_OVERRIDE' | 'GET_STORAGE_VALUE' | 'PING'
  payload?: StorageOverridePayload | GetStoragePayload
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    console.log('Statsig DevTools content script loaded')

    // Message listener for storage operations
    browser.runtime.onMessage.addListener((message: ContentScriptMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'SET_STORAGE_OVERRIDE':
          if (!message.payload) {
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          handleSetStorageOverride(message.payload as StorageOverridePayload)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((error) => sendResponse({ success: false, error: error.message }))
          return true

        case 'REMOVE_STORAGE_OVERRIDE':
          if (!message.payload) {
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          handleRemoveStorageOverride(message.payload as StorageOverridePayload)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((error) => sendResponse({ success: false, error: error.message }))
          return true

        case 'GET_STORAGE_VALUE':
          if (!message.payload) {
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          getStorageValue(message.payload as GetStoragePayload)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((error) => sendResponse({ success: false, error: error.message }))
          return true

        case 'PING':
          sendResponse({ success: true, data: 'pong' })
          return true

        default:
          sendResponse({ success: false, error: `Unknown message type: ${message.type}` })
          return true
      }
    })

    // Storage override handlers
    async function handleSetStorageOverride(payload: StorageOverridePayload) {
      const { type, key, value, domain } = payload

      if (!value) {
        throw new Error('Value is required for setting storage override')
      }

      switch (type) {
        case 'localStorage':
          window.localStorage.setItem(key, value)
          break
        case 'sessionStorage':
          window.sessionStorage.setItem(key, value)
          break
        case 'cookie':
          document.cookie = `${key}=${value}; domain=${domain ?? window.location.hostname}; path=/`
          break
        default:
          throw new Error(`Unsupported storage type: ${type}`)
      }
      return { type, key, value, applied: true }
    }

    async function handleRemoveStorageOverride(payload: StorageOverridePayload) {
      const { type, key, domain } = payload

      switch (type) {
        case 'localStorage':
          window.localStorage.removeItem(key)
          break
        case 'sessionStorage':
          window.sessionStorage.removeItem(key)
          break
        case 'cookie':
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain ?? window.location.hostname}; path=/`
          break
        default:
          throw new Error(`Unsupported storage type: ${type}`)
      }
      return { type, key, removed: true }
    }

    async function getStorageValue(payload: GetStoragePayload) {
      const { type, key } = payload

      switch (type) {
        case 'localStorage':
          return window.localStorage.getItem(key)
        case 'sessionStorage':
          return window.sessionStorage.getItem(key)
        case 'cookie': {
          const cookies = document.cookie.split(';')
          const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`))
          return cookie ? cookie.split('=')[1] : null
        }
        default:
          throw new Error(`Unsupported storage type: ${type}`)
      }
    }
  },
})

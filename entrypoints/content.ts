import { Logger } from '@/src/utils/logger'

const logger = new Logger('CONTENT')

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
    logger.info('Statsig DevTools content script loaded', {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })

    // Message listener for storage operations
    browser.runtime.onMessage.addListener((message: ContentScriptMessage, _sender, sendResponse) => {
      logger.debug('Received message', { type: message.type, hasPayload: !!message.payload })
      switch (message.type) {
        case 'SET_STORAGE_OVERRIDE':
          if (!message.payload) {
            logger.warn('SET_STORAGE_OVERRIDE called without payload')
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          handleSetStorageOverride(message.payload as StorageOverridePayload)
            .then((result) => {
              logger.info('Storage override set successfully', result)
              sendResponse({ success: true, data: result })
            })
            .catch((error) => {
              logger.error('Failed to set storage override', error)
              sendResponse({ success: false, error: error.message })
            })
          return true

        case 'REMOVE_STORAGE_OVERRIDE':
          if (!message.payload) {
            logger.warn('REMOVE_STORAGE_OVERRIDE called without payload')
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          handleRemoveStorageOverride(message.payload as StorageOverridePayload)
            .then((result) => {
              logger.info('Storage override removed successfully', result)
              sendResponse({ success: true, data: result })
            })
            .catch((error) => {
              logger.error('Failed to remove storage override', error)
              sendResponse({ success: false, error: error.message })
            })
          return true

        case 'GET_STORAGE_VALUE':
          if (!message.payload) {
            logger.warn('GET_STORAGE_VALUE called without payload')
            sendResponse({ success: false, error: 'Payload is required' })
            return true
          }
          getStorageValue(message.payload as GetStoragePayload)
            .then((result) => {
              logger.debug('Storage value retrieved', {
                key: (message.payload as GetStoragePayload).key,
                hasValue: !!result,
              })
              sendResponse({ success: true, data: result })
            })
            .catch((error) => {
              logger.error('Failed to get storage value', error)
              sendResponse({ success: false, error: error.message })
            })
          return true

        case 'PING':
          logger.debug('PING received, responding with pong')
          sendResponse({ success: true, data: 'pong' })
          return true

        default:
          logger.warn('Unknown message type received', { type: message.type })
          sendResponse({ success: false, error: `Unknown message type: ${message.type}` })
          return true
      }
    })

    // Storage override handlers
    async function handleSetStorageOverride(payload: StorageOverridePayload) {
      const { type, key, value, domain } = payload

      if (!value) {
        logger.error('Value is required for setting storage override', { type, key })
        throw new Error('Value is required for setting storage override')
      }

      logger.debug('Setting storage override', { type, key, domain, valueLength: value.length })

      switch (type) {
        case 'localStorage': {
          window.localStorage.setItem(key, value)
          logger.debug('localStorage override applied', { key, value })
          break
        }
        case 'sessionStorage': {
          window.sessionStorage.setItem(key, value)
          logger.debug('sessionStorage override applied', { key, value })
          break
        }
        case 'cookie': {
          const cookieDomain = domain ?? window.location.hostname
          document.cookie = `${key}=${value}; domain=${cookieDomain}; path=/`
          logger.debug('Cookie override applied', { key, domain: cookieDomain })
          break
        }
        default:
          logger.error('Unsupported storage type', { type })
          throw new Error(`Unsupported storage type: ${type}`)
      }
      return { type, key, value, applied: true }
    }

    async function handleRemoveStorageOverride(payload: StorageOverridePayload) {
      const { type, key, domain } = payload

      logger.debug('Removing storage override', { type, key, domain })

      switch (type) {
        case 'localStorage': {
          window.localStorage.removeItem(key)
          logger.debug('localStorage override removed', { key })
          break
        }
        case 'sessionStorage': {
          window.sessionStorage.removeItem(key)
          logger.debug('sessionStorage override removed', { key })
          break
        }
        case 'cookie': {
          const cookieDomain = domain ?? window.location.hostname
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${cookieDomain}; path=/`
          logger.debug('Cookie override removed', { key, domain: cookieDomain })
          break
        }
        default:
          logger.error('Unsupported storage type for removal', { type })
          throw new Error(`Unsupported storage type: ${type}`)
      }
      return { type, key, removed: true }
    }

    async function getStorageValue(payload: GetStoragePayload) {
      const { type, key } = payload

      logger.debug('Getting storage value', { type, key })

      switch (type) {
        case 'localStorage': {
          const localValue = window.localStorage.getItem(key)
          logger.debug('localStorage value retrieved', { key, hasValue: !!localValue })
          return localValue
        }
        case 'sessionStorage': {
          const sessionValue = window.sessionStorage.getItem(key)
          logger.debug('sessionStorage value retrieved', { key, hasValue: !!sessionValue })
          return sessionValue
        }
        case 'cookie': {
          const cookies = document.cookie.split(';')
          const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`))
          const cookieValue = cookie ? cookie.split('=')[1] : null
          logger.debug('Cookie value retrieved', { key, hasValue: !!cookieValue })
          return cookieValue
        }
        default:
          logger.error('Unsupported storage type for retrieval', { type })
          throw new Error(`Unsupported storage type: ${type}`)
      }
    }
  },
})

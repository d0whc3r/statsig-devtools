import { BrowserRuntime } from '@/src/utils/browser-api'

import { logger } from '../src/utils/logger'
import {
  clearAllOverrides,
  getCookies,
  getStorageValue,
  handleRemoveStorageOverride,
  handleSetStorageOverride,
} from './modules/storage-operations'

// Import modular functionality
import type { ContentScriptMessage, ContentScriptResponse } from './types/content-types'

// Global declarations for browser APIs used in injected scripts
declare const _localStorage: Storage
declare const _sessionStorage: Storage
declare const _document: Document

// Extend global window interface
declare global {
  interface Window {
    statsigOverrides?: Record<string, { value: unknown; type: string; timestamp: number }>
    statsigCookieResult?: Record<string, string>
    Statsig?: {
      checkGate: (gateName: string, user?: Record<string, unknown>) => boolean
      getConfig: (configName: string, user?: Record<string, unknown>) => { value: unknown }
      getExperiment: (experimentName: string, user?: Record<string, unknown>) => unknown
    }
  }
}

/**
 * Main message handler for content script
 */

async function handleMessage(
  message: ContentScriptMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ContentScriptResponse) => void,
): Promise<void> {
  try {
    logger.log('📨 Content script received message:', message.type)

    switch (message.type) {
      case 'SET_STORAGE_OVERRIDE': {
        const result = await handleSetStorageOverride(message.override)
        sendResponse(result)
        break
      }
      case 'REMOVE_STORAGE_OVERRIDE': {
        const result = await handleRemoveStorageOverride(message.override)
        sendResponse(result)
        break
      }
      case 'GET_STORAGE_VALUE': {
        const result = await getStorageValue(message.key, message.storageType)
        sendResponse(result)
        break
      }
      case 'CLEAR_ALL_OVERRIDES': {
        const result = await clearAllOverrides()
        sendResponse(result)
        break
      }
      case 'GET_COOKIES': {
        const result = await getCookies()
        sendResponse(result)
        break
      }
      case 'PING': {
        sendResponse({ success: true, data: 'pong' })
        break
      }
      default: {
        sendResponse({
          success: false,
          error: `Unknown message type: ${(message as { type: string }).type}`,
        })
      }
    }
  } catch (error) {
    logger.error('❌ Error handling message:', error)
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Initialize content script
 */
function initializeContentScript(): void {
  logger.log('🚀 Content script initialized')

  // Set up message listener
  BrowserRuntime.addMessageListener((message, sender, sendResponse) => {
    handleMessage(message as ContentScriptMessage, sender, sendResponse)
    return true // Keep message channel open for async responses
  })

  logger.log('✅ Content script ready to receive messages')
}

/**
 * WXT Content Script Entry Point
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Initialize the content script
    initializeContentScript()
  },
})

import { vi } from 'vitest'

import '@testing-library/jest-dom/vitest'

// Mock browser APIs for testing
const mockBrowser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
  cookies: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  windows: {
    getCurrent: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
    setPanelBehavior: vi.fn(),
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
    },
  },
}

// @ts-expect-error - Mocking global browser API
global.browser = mockBrowser
// @ts-expect-error - Mocking global chrome API
global.chrome = mockBrowser

// Mock WXT globals
// @ts-expect-error - Mocking WXT global
global.defineBackground = vi.fn()
// @ts-expect-error - Mocking WXT global
global.defineContentScript = vi.fn()

// Mock crypto API for encryption tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      exportKey: vi.fn(),
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

// Mock window object for browser environment
Object.defineProperty(window, 'statsigStores', {
  value: undefined,
  writable: true,
})

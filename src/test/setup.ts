import { vi } from 'vitest'

// Mock browser APIs
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
  },
}

// @ts-expect-error - Mocking global browser API
global.browser = mockBrowser
// @ts-expect-error - Mocking global chrome API
global.chrome = mockBrowser

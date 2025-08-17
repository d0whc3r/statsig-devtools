import { beforeEach, describe, expect, it, vi } from 'vitest'

import { client } from '../../client/client.gen'
import { resetCacheInitialization, setupClientCache } from './client-cache'

// Mock the client
vi.mock('../../client/client.gen', () => ({
  client: {
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
      error: {
        use: vi.fn(),
      },
    },
  },
}))

describe('ClientCache', () => {
  beforeEach(() => {
    // Reset the cache initialization state before each test
    resetCacheInitialization()
    // Clear all mocks
    vi.clearAllMocks()
  })

  it('should setup cache interceptors on first initialization', () => {
    // Act
    setupClientCache()

    // Assert
    expect(client.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(client.interceptors.response.use).toHaveBeenCalledTimes(1)
    expect(client.interceptors.error.use).toHaveBeenCalledTimes(1)
  })

  it('should not setup cache interceptors on subsequent initializations', () => {
    // Arrange - First initialization
    setupClientCache()

    // Clear mocks to track second initialization
    vi.clearAllMocks()

    // Act - Second initialization
    setupClientCache()

    // Assert - No interceptors should be added again
    expect(client.interceptors.request.use).not.toHaveBeenCalled()
    expect(client.interceptors.response.use).not.toHaveBeenCalled()
    expect(client.interceptors.error.use).not.toHaveBeenCalled()
  })

  it('should allow re-initialization after reset', () => {
    // Arrange - First initialization
    setupClientCache()
    vi.clearAllMocks()

    // Act - Reset and initialize again
    resetCacheInitialization()
    setupClientCache()

    // Assert - Interceptors should be added again
    expect(client.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(client.interceptors.response.use).toHaveBeenCalledTimes(1)
    expect(client.interceptors.error.use).toHaveBeenCalledTimes(1)
  })
})

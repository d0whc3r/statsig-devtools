import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '../utils/logger'
import { ErrorCategory, errorHandler, ErrorSeverity } from './error-handler'
import { getAllConfigurations } from './statsig-api'
import { UnifiedStatsigService, unifiedStatsigService } from './unified-statsig-api'

import type { StatsigConfigurationItem } from '../types'
import type { StatsigUser } from '@statsig/js-client'

// Mock dependencies
vi.mock('../utils/logger')
vi.mock('./error-handler')
vi.mock('./statsig-api')

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UnifiedStatsigService', () => {
  let service: UnifiedStatsigService

  beforeEach(() => {
    service = new UnifiedStatsigService()
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  describe('API Key Validation', () => {
    it('should reject empty API key', async () => {
      const result = await service.validateApiKey('')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('API key is required')
    })

    it('should reject non-string API key', async () => {
      const result = await service.validateApiKey(null as any)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('API key is required')
    })

    it('should reject API key that does not start with console-', async () => {
      const result = await service.validateApiKey('client-invalid-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Console API key required. Please use a key that starts with "console-"')
    })

    it('should validate valid console API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const result = await service.validateApiKey('console-valid-key')

      expect(result.isValid).toBe(true)
      expect(result.projectName).toBe('Statsig Project')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://statsigapi.net/console/v1/gates',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'STATSIG-API-KEY': 'console-valid-key',
            'STATSIG-API-VERSION': '20240601',
            'Content-Type': 'application/json',
          },
        }),
      )
    })

    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      const result = await service.validateApiKey('console-invalid-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid API key. Please verify your Console API key is correct and has not expired.')
    })

    it('should handle 403 forbidden error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      })

      const result = await service.validateApiKey('console-forbidden-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe(
        'API key does not have sufficient permissions. Please check your project access rights.',
      )
    })

    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await service.validateApiKey('console-notfound-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('API endpoint not found. Please check your API key format.')
    })

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      })

      const result = await service.validateApiKey('console-ratelimited-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Rate limit exceeded. Please wait a moment and try again.')
    })

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const result = await service.validateApiKey('console-server-error-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Statsig server error. Please try again in a few moments.')
    })

    it('should handle network timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('AbortError')
              error.name = 'AbortError'
              reject(error)
            }, 100)
          }),
      )

      const validationPromise = service.validateApiKey('console-timeout-key')

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(10000)

      const result = await validationPromise

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Request timeout. Please check your internet connection.')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed'))

      const result = await service.validateApiKey('console-network-error-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Network error. Please check your internet connection.')
    })

    it('should handle unexpected error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unexpected error'))

      const result = await service.validateApiKey('console-unexpected-error-key')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('An unexpected error occurred during validation.')
    })
  })

  describe('Service Initialization', () => {
    it('should initialize with console API key', async () => {
      const user: StatsigUser = {
        userID: 'test-user',
        email: 'test@example.com',
      }

      await service.initialize('console-test-key', user)

      expect(service.isReady()).toBe(true)
      expect(logger.info).toHaveBeenCalledWith('Initializing Statsig service with Console API key...')
      expect(logger.info).toHaveBeenCalledWith('Statsig Client SDK initialized successfully')
    })

    it('should initialize with default user when no user provided', async () => {
      await service.initialize('console-test-key')

      expect(service.isReady()).toBe(true)
    })

    it('should handle initialization error', async () => {
      // Mock an error during initialization
      vi.spyOn(service as any, 'buildDefaultUser').mockImplementationOnce(() => {
        throw new Error('User creation failed')
      })

      await expect(service.initialize('console-test-key')).rejects.toThrow(
        'SDK initialization failed: User creation failed',
      )
      expect(service.isReady()).toBe(false)
    })
  })

  describe('Configuration Management', () => {
    beforeEach(async () => {
      await service.initialize('console-test-key')
    })

    it('should get all configurations', async () => {
      const mockConfigurations: StatsigConfigurationItem[] = [
        {
          name: 'Test Gate',
          type: 'feature_gate',
          enabled: true,
          rules: [],
          defaultValue: false,
        },
      ]

      vi.mocked(getAllConfigurations).mockResolvedValueOnce(mockConfigurations)

      const result = await service.getAllConfigurations()

      expect(result).toEqual(mockConfigurations)
      expect(getAllConfigurations).toHaveBeenCalledWith('console-test-key')
    })

    it('should handle error when getting configurations', async () => {
      const error = new Error('API error')
      const statsigError = {
        id: 'test-error-id',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        message: 'API error',
        userMessage: 'API error occurred',
        timestamp: new Date().toISOString(),
        recoverable: true,
        originalError: error,
      }
      vi.mocked(getAllConfigurations).mockRejectedValueOnce(error)
      vi.mocked(errorHandler.handleError).mockReturnValueOnce(statsigError)

      await expect(service.getAllConfigurations()).rejects.toThrow('API error')
      expect(errorHandler.handleError).toHaveBeenCalledWith(error, 'Getting configurations')
    })

    it('should throw error when getting configurations without API key', async () => {
      const uninitializedService = new UnifiedStatsigService()

      await expect(uninitializedService.getAllConfigurations()).rejects.toThrow('Console API key not set')
    })
  })

  describe('Feature Gate Evaluation', () => {
    beforeEach(async () => {
      await service.initialize('console-test-key')
    })

    it('should return mock evaluation for feature gate', async () => {
      const result = await service.evaluateFeatureGate('test-gate')

      expect(result.configurationName).toBe('test-gate')
      expect(result.type).toBe('feature_gate')
      expect(result.passed).toBe(false)
      expect(result.value).toBe(false)
      expect(result.reason).toBe('Console API key does not support client evaluation')
      expect(result.debugInfo).toBeDefined()
      expect(result.debugInfo?.evaluatedRules).toEqual([])
      expect(result.debugInfo?.timestamp).toBeDefined()
    })
  })

  describe('User Management', () => {
    beforeEach(async () => {
      await service.initialize('console-test-key')
    })

    it('should update user context', async () => {
      const newUser: StatsigUser = {
        userID: 'new-user',
        email: 'new@example.com',
        custom: { role: 'admin' },
      }

      await service.updateUser(newUser)

      expect(logger.info).toHaveBeenCalledWith('User context updated successfully (local only)')
    })

    it('should build default user with correct properties', async () => {
      const defaultUser = (service as any).buildDefaultUser()

      expect(defaultUser.userID).toMatch(/^extension-user-\d+$/)
      expect(defaultUser.email).toBe('developer@extension.local')
      expect(defaultUser.custom.source).toBe('statsig-dev-tools')
      expect(defaultUser.custom.timestamp).toBeDefined()
    })
  })

  describe('Service State Management', () => {
    it('should return false for isReady when not initialized', () => {
      expect(service.isReady()).toBe(false)
    })

    it('should return true for isReady when initialized', async () => {
      await service.initialize('console-test-key')
      expect(service.isReady()).toBe(true)
    })

    it('should cleanup service state', async () => {
      await service.initialize('console-test-key')
      expect(service.isReady()).toBe(true)

      service.cleanup()

      expect(service.isReady()).toBe(false)
      expect(logger.info).toHaveBeenCalledWith('Statsig service cleaned up')
    })

    it('should cleanup with client when present', async () => {
      // Mock a client being present
      const mockClient = { shutdown: vi.fn() }
      ;(service as any).client = mockClient

      service.cleanup()

      expect(mockClient.shutdown).toHaveBeenCalled()
      expect(service.isReady()).toBe(false)
    })
  })

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(unifiedStatsigService).toBeInstanceOf(UnifiedStatsigService)
    })

    it('should maintain state across imports', async () => {
      await unifiedStatsigService.initialize('console-singleton-test')
      expect(unifiedStatsigService.isReady()).toBe(true)

      unifiedStatsigService.cleanup()
      expect(unifiedStatsigService.isReady()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace in API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const result = await service.validateApiKey('  console-whitespace-key  ')

      expect(result.isValid).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://statsigapi.net/console/v1/gates',
        expect.objectContaining({
          headers: expect.objectContaining({
            'STATSIG-API-KEY': 'console-whitespace-key',
          }),
        }),
      )
    })

    it('should handle initialization with whitespace in API key', async () => {
      await service.initialize('  console-whitespace-key  ')
      expect(service.isReady()).toBe(true)
    })

    it('should handle multiple cleanup calls', () => {
      service.cleanup()
      service.cleanup()

      expect(service.isReady()).toBe(false)
    })

    it('should handle evaluation before initialization gracefully', async () => {
      const result = await service.evaluateFeatureGate('test-gate')

      expect(result.configurationName).toBe('test-gate')
      expect(result.passed).toBe(false)
    })
  })
})

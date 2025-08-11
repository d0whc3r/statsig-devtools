import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { StatsigIntegrationService, type StorageOverride } from './statsig-integration'

import type { StatsigConfigurationItem } from '../types'
import type { StatsigUser } from '@statsig/js-client'

import { LogLevel, StatsigClient } from '@statsig/js-client'

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the Statsig Client SDK
vi.mock('@statsig/js-client', () => ({
  StatsigClient: vi.fn(),
  LogLevel: {
    Error: 'error',
  },
}))

describe('StatsigIntegrationService', () => {
  let service: StatsigIntegrationService
  let mockClient: {
    initializeAsync: Mock
    updateUserAsync: Mock
    checkGate: Mock
    getExperiment: Mock
    getDynamicConfig: Mock
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock client
    mockClient = {
      initializeAsync: vi.fn(),
      updateUserAsync: vi.fn(),
      checkGate: vi.fn(),
      getExperiment: vi.fn(),
      getDynamicConfig: vi.fn(),
    }

    // Mock StatsigClient constructor
    ;(StatsigClient as unknown as Mock).mockImplementation(() => mockClient)

    service = new StatsigIntegrationService()
  })

  describe('initialize', () => {
    it('should initialize successfully with valid client SDK key', async () => {
      const clientSdkKey = 'client-test-key'
      const user: StatsigUser = { userID: 'test-user' }

      mockClient.initializeAsync.mockResolvedValue(undefined)

      await service.initialize(clientSdkKey, user)

      expect(StatsigClient).toHaveBeenCalledWith(
        clientSdkKey,
        user,
        expect.objectContaining({
          logLevel: LogLevel.Error,
          disableStorage: false,
          disableLogging: true,
        }),
      )
      expect(mockClient.initializeAsync).toHaveBeenCalled()
      expect(service.isReady()).toBe(true)
    })

    it('should initialize with default user when no user provided', async () => {
      const clientSdkKey = 'client-test-key'
      mockClient.initializeAsync.mockResolvedValue(undefined)

      await service.initialize(clientSdkKey)

      expect(StatsigClient).toHaveBeenCalledWith(
        clientSdkKey,
        expect.objectContaining({
          userID: 'statsig-dev-tools-user',
          userAgent: expect.any(String),
          locale: expect.any(String),
          appVersion: expect.any(String),
        }),
        expect.any(Object),
      )
    })

    it('should skip initialization for console API keys', async () => {
      const consoleApiKey = 'console-test-key'

      await service.initialize(consoleApiKey)

      expect(StatsigClient).not.toHaveBeenCalled()
      expect(service.isReady()).toBe(false)
    })

    it('should handle initialization errors', async () => {
      const clientSdkKey = 'client-test-key'
      const error = new Error('Initialization failed')
      mockClient.initializeAsync.mockRejectedValue(error)

      await expect(service.initialize(clientSdkKey)).rejects.toThrow('SDK initialization failed: Initialization failed')
      expect(service.isReady()).toBe(false)
    })

    it('should trim whitespace from SDK key', async () => {
      const clientSdkKey = '  client-test-key  '
      mockClient.initializeAsync.mockResolvedValue(undefined)

      await service.initialize(clientSdkKey)

      expect(StatsigClient).toHaveBeenCalledWith('client-test-key', expect.any(Object), expect.any(Object))
    })
  })

  describe('updateUser', () => {
    beforeEach(async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')
    })

    it('should update user successfully', async () => {
      const newUser: StatsigUser = { userID: 'new-user', email: 'test@example.com' }
      mockClient.updateUserAsync.mockResolvedValue(undefined)

      await service.updateUser(newUser)

      expect(mockClient.updateUserAsync).toHaveBeenCalledWith(newUser)
      expect(service.getCurrentUser()).toEqual(newUser)
    })

    it('should throw error when client not initialized', async () => {
      const uninitializedService = new StatsigIntegrationService()
      const user: StatsigUser = { userID: 'test-user' }

      await expect(uninitializedService.updateUser(user)).rejects.toThrow('Statsig client not initialized')
    })

    it('should handle update errors', async () => {
      const user: StatsigUser = { userID: 'test-user' }
      const error = new Error('Update failed')
      mockClient.updateUserAsync.mockRejectedValue(error)

      await expect(service.updateUser(user)).rejects.toThrow('User update failed: Update failed')
    })
  })

  describe('buildUserFromOverrides', () => {
    it('should build user with storage overrides', () => {
      const overrides: StorageOverride[] = [
        {
          type: 'cookie',
          key: 'test-cookie',
          value: 'cookie-value',
        },
        {
          type: 'localStorage',
          key: 'test-local',
          value: 'local-value',
        },
        {
          type: 'sessionStorage',
          key: 'test-session',
          value: 'session-value',
        },
      ]

      const user = service.buildUserFromOverrides(overrides)

      expect(user.custom).toEqual({
        'cookie_test-cookie': 'cookie-value',
        'localStorage_test-local': 'local-value',
        'sessionStorage_test-session': 'session-value',
      })
    })

    it('should build user with feature-specific overrides', () => {
      const overrides: StorageOverride[] = [
        {
          type: 'cookie',
          key: 'test-key',
          value: 'test-value',
          featureName: 'test_feature',
          featureType: 'feature_gate',
        },
      ]

      const user = service.buildUserFromOverrides(overrides)

      expect(user.custom).toEqual({
        override_test_feature: 'test-value',
      })
    })

    it('should return default user when no overrides', () => {
      const user = service.buildUserFromOverrides([])

      expect(user).toEqual(
        expect.objectContaining({
          userID: 'statsig-dev-tools-user',
          userAgent: expect.any(String),
          locale: expect.any(String),
          appVersion: expect.any(String),
          custom: {},
        }),
      )
    })
  })

  describe('getOverridesForFeature', () => {
    it('should filter overrides by feature name', () => {
      const overrides: StorageOverride[] = [
        {
          type: 'cookie',
          key: 'key1',
          value: 'value1',
          featureName: 'feature1',
        },
        {
          type: 'cookie',
          key: 'key2',
          value: 'value2',
          featureName: 'feature2',
        },
        {
          type: 'cookie',
          key: 'key3',
          value: 'value3',
          featureName: 'feature1',
        },
      ]

      const result = service.getOverridesForFeature(overrides, 'feature1')

      expect(result).toHaveLength(2)
      expect(result.every((override) => override.featureName === 'feature1')).toBe(true)
    })

    it('should return empty array when no matching overrides', () => {
      const overrides: StorageOverride[] = [
        {
          type: 'cookie',
          key: 'key1',
          value: 'value1',
          featureName: 'feature1',
        },
      ]

      const result = service.getOverridesForFeature(overrides, 'nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('evaluateFeatureGate', () => {
    beforeEach(async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')
    })

    it('should evaluate feature gate successfully', async () => {
      const gateName = 'test_gate'
      mockClient.checkGate.mockReturnValue(true)

      const result = await service.evaluateFeatureGate(gateName)

      expect(mockClient.checkGate).toHaveBeenCalledWith(gateName)
      expect(result).toEqual(
        expect.objectContaining({
          configurationName: gateName,
          type: 'feature_gate',
          passed: true,
          value: true,
          reason: 'Gate evaluation',
          debugInfo: expect.objectContaining({
            evaluatedRules: [],
            userContext: expect.any(Object),
            timestamp: expect.any(String),
          }),
        }),
      )
    })

    it('should throw error when client not initialized', async () => {
      const uninitializedService = new StatsigIntegrationService()

      await expect(uninitializedService.evaluateFeatureGate('test_gate')).rejects.toThrow(
        'Statsig client not initialized',
      )
    })

    it('should handle evaluation errors', async () => {
      const gateName = 'test_gate'
      const error = new Error('Evaluation failed')
      mockClient.checkGate.mockImplementation(() => {
        throw error
      })

      await expect(service.evaluateFeatureGate(gateName)).rejects.toThrow('Gate evaluation failed: Evaluation failed')
    })
  })

  describe('evaluateExperiment', () => {
    beforeEach(async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')
    })

    it('should evaluate experiment successfully', async () => {
      const experimentName = 'test_experiment'
      const mockResult = {
        groupName: 'control',
        ruleID: 'rule123',
        details: { reason: 'User in control group' },
      }
      mockClient.getExperiment.mockReturnValue(mockResult)

      const result = await service.evaluateExperiment(experimentName)

      expect(mockClient.getExperiment).toHaveBeenCalledWith(experimentName)
      expect(result).toEqual(
        expect.objectContaining({
          configurationName: experimentName,
          type: 'experiment',
          passed: true,
          value: 'control',
          ruleId: 'rule123',
          groupName: 'control',
          reason: 'User in control group',
        }),
      )
    })

    it('should handle missing details', async () => {
      const experimentName = 'test_experiment'
      const mockResult = {
        groupName: 'treatment',
        ruleID: 'rule456',
      }
      mockClient.getExperiment.mockReturnValue(mockResult)

      const result = await service.evaluateExperiment(experimentName)

      expect(result.reason).toBe('Unknown')
    })
  })

  describe('evaluateDynamicConfig', () => {
    beforeEach(async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')
    })

    it('should evaluate dynamic config successfully', async () => {
      const configName = 'test_config'
      const mockResult = {
        value: { key: 'value' },
        ruleID: 'rule789',
        details: { reason: 'Default config' },
      }
      mockClient.getDynamicConfig.mockReturnValue(mockResult)

      const result = await service.evaluateDynamicConfig(configName)

      expect(mockClient.getDynamicConfig).toHaveBeenCalledWith(configName)
      expect(result).toEqual(
        expect.objectContaining({
          configurationName: configName,
          type: 'dynamic_config',
          passed: true,
          value: { key: 'value' },
          ruleId: 'rule789',
          reason: 'Default config',
        }),
      )
    })
  })

  describe('evaluateAllConfigurations', () => {
    beforeEach(async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')
    })

    it('should evaluate all configurations successfully', async () => {
      const configurations: StatsigConfigurationItem[] = [
        { name: 'gate1', type: 'feature_gate', enabled: true },
        { name: 'exp1', type: 'experiment', enabled: true },
        { name: 'config1', type: 'dynamic_config', enabled: true },
      ]

      mockClient.checkGate.mockReturnValue(true)
      mockClient.getExperiment.mockReturnValue({ groupName: 'control', ruleID: 'rule1' })
      mockClient.getDynamicConfig.mockReturnValue({ value: {}, ruleID: 'rule2' })

      const results = await service.evaluateAllConfigurations(configurations)

      expect(results).toHaveLength(3)
      expect(results[0].type).toBe('feature_gate')
      expect(results[1].type).toBe('experiment')
      expect(results[2].type).toBe('dynamic_config')
    })

    it('should handle individual configuration failures', async () => {
      const configurations: StatsigConfigurationItem[] = [
        { name: 'gate1', type: 'feature_gate', enabled: true },
        { name: 'gate2', type: 'feature_gate', enabled: true },
      ]

      mockClient.checkGate.mockReturnValueOnce(true).mockImplementationOnce(() => {
        throw new Error('Gate error')
      })

      const results = await service.evaluateAllConfigurations(configurations)

      expect(results).toHaveLength(2)
      expect(results[0].passed).toBe(true)
      expect(results[1].passed).toBe(false)
      expect(results[1].reason).toContain('Gate evaluation failed: Gate error')
    })

    it('should skip unknown configuration types', async () => {
      const configurations: StatsigConfigurationItem[] = [
        { name: 'gate1', type: 'feature_gate', enabled: true },
        { name: 'unknown1', type: 'unknown_type' as any, enabled: true },
      ]

      mockClient.checkGate.mockReturnValue(true)

      const results = await service.evaluateAllConfigurations(configurations)

      expect(results).toHaveLength(1)
      expect(results[0].configurationName).toBe('gate1')
    })
  })

  describe('utility methods', () => {
    it('should return correct ready state', () => {
      expect(service.isReady()).toBe(false)
    })

    it('should return current user', async () => {
      const user: StatsigUser = { userID: 'test-user' }
      mockClient.initializeAsync.mockResolvedValue(undefined)

      await service.initialize('client-test-key', user)

      expect(service.getCurrentUser()).toEqual(user)
    })

    it('should cleanup resources', async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')

      expect(service.isReady()).toBe(true)

      service.cleanup()

      expect(service.isReady()).toBe(false)
      expect(service.getCurrentUser()).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty SDK key', async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)

      await service.initialize('')

      expect(StatsigClient).toHaveBeenCalledWith('', expect.any(Object), expect.any(Object))
    })

    it('should handle null/undefined values in overrides', () => {
      const overrides: StorageOverride[] = [
        {
          type: 'cookie',
          key: 'test-key',
          value: '',
        },
      ]

      const user = service.buildUserFromOverrides(overrides)

      expect(user.custom).toEqual({
        'cookie_test-key': '',
      })
    })

    it('should handle evaluation with null current user', async () => {
      mockClient.initializeAsync.mockResolvedValue(undefined)
      await service.initialize('client-test-key')

      // Manually set current user to null to test edge case
      ;(service as any).currentUser = null
      mockClient.checkGate.mockReturnValue(false)

      const result = await service.evaluateFeatureGate('test_gate')

      expect(result.debugInfo?.userContext).toEqual({})
    })
  })
})

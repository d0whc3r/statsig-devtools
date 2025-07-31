import { beforeEach, describe, expect, it, vi } from 'vitest'
import browser from 'webextension-polyfill'

import { StorageManager } from '../services/storage-manager'

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      local: {
        set: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      },
    },
  },
}))

// Mock crypto API
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
}

// Setup global crypto mock
Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true,
})

describe('StorageManager', () => {
  let storageManager: StorageManager

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create new instance for each test
    storageManager = StorageManager.getInstance()

    // Reset the singleton instance
    ;(StorageManager as any).instance = undefined
    storageManager = StorageManager.getInstance()

    // Setup default mock implementations
    mockCrypto.subtle.generateKey.mockResolvedValue({} as CryptoKey)
    mockCrypto.subtle.exportKey.mockResolvedValue(new ArrayBuffer(32))
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey)
    mockCrypto.getRandomValues.mockImplementation((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    })
    mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16))
    mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode('decrypted-data'))

    vi.mocked(browser.storage.local.set).mockResolvedValue(undefined)
    vi.mocked(browser.storage.local.get).mockResolvedValue({})
    vi.mocked(browser.storage.local.remove).mockResolvedValue(undefined)
    vi.mocked(browser.storage.local.clear).mockResolvedValue(undefined)
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StorageManager.getInstance()
      const instance2 = StorageManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Initialization', () => {
    it('should initialize successfully with new encryption key', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({})

      await expect(storageManager.initialize()).resolves.not.toThrow()

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
      ])
      expect(browser.storage.local.set).toHaveBeenCalled()
    })

    it('should initialize successfully with existing encryption key', async () => {
      const existingKeyData = Array.from(new Uint8Array(32))
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_encryption_key: existingKeyData,
      })

      await expect(storageManager.initialize()).resolves.not.toThrow()

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
      )
    })

    it('should throw error if initialization fails', async () => {
      mockCrypto.subtle.generateKey.mockRejectedValue(new Error('Crypto error'))

      await expect(storageManager.initialize()).rejects.toThrow('Storage manager initialization failed')
    })
  })

  describe('Console API Key Management', () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it('should store Console API key with encryption', async () => {
      const apiKey = 'console-api-key-123'

      await expect(storageManager.storeConsoleApiKey(apiKey)).resolves.not.toThrow()

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled()
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        statsig_console_api_key: expect.objectContaining({
          encryptedValue: expect.any(String),
          iv: expect.any(String),
          salt: expect.any(String),
        }),
      })
    })

    it('should reject invalid API key', async () => {
      await expect(storageManager.storeConsoleApiKey('')).rejects.toThrow('Invalid API key provided')
      await expect(storageManager.storeConsoleApiKey(null as any)).rejects.toThrow('Invalid API key provided')
    })

    it('should retrieve Console API key with decryption', async () => {
      const encryptedData = {
        encryptedValue: '1,2,3,4',
        iv: '5,6,7,8',
        salt: '9,10,11,12',
      }
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_console_api_key: encryptedData,
      })

      const result = await storageManager.getConsoleApiKey()

      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled()
      expect(result).toBe('decrypted-data')
    })

    it('should return null if no Console API key exists', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({})

      const result = await storageManager.getConsoleApiKey()

      expect(result).toBeNull()
    })

    it('should return null if decryption fails', async () => {
      const encryptedData = {
        encryptedValue: '1,2,3,4',
        iv: '5,6,7,8',
        salt: '9,10,11,12',
      }
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_console_api_key: encryptedData,
      })
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'))

      const result = await storageManager.getConsoleApiKey()

      expect(result).toBeNull()
    })

    it('should clear Console API key', async () => {
      await expect(storageManager.clearConsoleApiKey()).resolves.not.toThrow()

      expect(browser.storage.local.remove).toHaveBeenCalledWith('statsig_console_api_key')
    })

    it('should check if Console API key exists', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_console_api_key: { encryptedValue: 'test' },
      })

      const exists = await storageManager.hasConsoleApiKey()

      expect(exists).toBe(true)
    })
  })

  describe('Client SDK Key Management', () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it('should store Client SDK key with encryption', async () => {
      const sdkKey = 'client-sdk-key-456'

      await expect(storageManager.storeClientSdkKey(sdkKey)).resolves.not.toThrow()

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled()
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        statsig_client_sdk_key: expect.objectContaining({
          encryptedValue: expect.any(String),
          iv: expect.any(String),
          salt: expect.any(String),
        }),
      })
    })

    it('should reject invalid SDK key', async () => {
      await expect(storageManager.storeClientSdkKey('')).rejects.toThrow('Invalid SDK key provided')

      await expect(storageManager.storeClientSdkKey(null as any)).rejects.toThrow('Invalid SDK key provided')
    })

    it('should retrieve Client SDK key with decryption', async () => {
      const encryptedData = {
        encryptedValue: '1,2,3,4',
        iv: '5,6,7,8',
        salt: '9,10,11,12',
      }
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_client_sdk_key: encryptedData,
      })

      const result = await storageManager.getClientSdkKey()

      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled()
      expect(result).toBe('decrypted-data')
    })

    it('should clear Client SDK key', async () => {
      await expect(storageManager.clearClientSdkKey()).resolves.not.toThrow()

      expect(browser.storage.local.remove).toHaveBeenCalledWith('statsig_client_sdk_key')
    })

    it('should check if Client SDK key exists', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_client_sdk_key: { encryptedValue: 'test' },
      })

      const exists = await storageManager.hasClientSdkKey()

      expect(exists).toBe(true)
    })
  })

  describe('Configuration Caching', () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it('should cache configurations with TTL', async () => {
      const configurations = [
        {
          id: '1',
          name: 'feature_gate_1',
          type: 'feature_gate' as const,
          enabled: true,
          rules: [],
        },
        {
          id: '2',
          name: 'experiment_1',
          type: 'experiment' as const,
          enabled: true,
          rules: [],
        },
      ]

      await expect(storageManager.cacheConfigurations(configurations)).resolves.not.toThrow()

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        statsig_cached_configurations: expect.objectContaining({
          configurations,
          timestamp: expect.any(Number),
          ttl: 300000, // 5 minutes
        }),
      })
    })

    it('should reject invalid configurations data', async () => {
      await expect(storageManager.cacheConfigurations(null as any)).rejects.toThrow(
        'Invalid configurations data provided',
      )

      await expect(storageManager.cacheConfigurations('invalid' as any)).rejects.toThrow(
        'Invalid configurations data provided',
      )
    })

    it('should retrieve cached configurations if not expired', async () => {
      const configurations = [
        {
          id: '1',
          name: 'test',
          type: 'feature_gate' as const,
          enabled: true,
          rules: [],
        },
      ]
      const cachedData = {
        configurations,
        timestamp: Date.now() - 60000, // 1 minute ago
        ttl: 300000, // 5 minutes
      }
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_cached_configurations: cachedData,
      })

      const result = await storageManager.getCachedConfigurations()

      expect(result).toEqual(configurations)
    })

    it('should return null and clear cache if expired', async () => {
      const configurations = [
        {
          id: '1',
          name: 'test',
          type: 'feature_gate' as const,
          enabled: true,
          rules: [],
        },
      ]
      const cachedData = {
        configurations,
        timestamp: Date.now() - 400000, // 6+ minutes ago (expired)
        ttl: 300000, // 5 minutes
      }
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        statsig_cached_configurations: cachedData,
      })

      const result = await storageManager.getCachedConfigurations()

      expect(result).toBeNull()
      expect(browser.storage.local.remove).toHaveBeenCalledWith('statsig_cached_configurations')
    })

    it('should return null if no cached data exists', async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({})

      const result = await storageManager.getCachedConfigurations()

      expect(result).toBeNull()
    })

    it('should clear cache', async () => {
      await expect(storageManager.clearCache()).resolves.not.toThrow()

      expect(browser.storage.local.remove).toHaveBeenCalledWith('statsig_cached_configurations')
    })
  })

  describe('Security and Cleanup', () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it('should clear all data', async () => {
      await expect(storageManager.clearAllData()).resolves.not.toThrow()

      expect(browser.storage.local.clear).toHaveBeenCalled()
    })

    it('should handle storage errors gracefully', async () => {
      vi.mocked(browser.storage.local.set).mockRejectedValue(new Error('Storage error'))

      await expect(storageManager.storeConsoleApiKey('test-key')).rejects.toThrow(
        'Failed to store Console API key securely',
      )
    })

    it('should handle encryption errors gracefully', async () => {
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption error'))

      await expect(storageManager.storeConsoleApiKey('test-key')).rejects.toThrow(
        'Failed to store Console API key securely',
      )
    })
  })
})

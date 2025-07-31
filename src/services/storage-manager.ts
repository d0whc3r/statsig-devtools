import browser from 'webextension-polyfill'

import type { StatsigConfigurations } from '../types'

/**
 * Interface for encrypted storage data
 */
interface EncryptedData {
  encryptedValue: string
  iv: string
  salt: string
}

/**
 * Interface for cached configuration data
 */
interface CachedConfigurationData {
  configurations: StatsigConfigurations
  timestamp: number
  ttl: number // Time to live in milliseconds
}

/**
 * Storage keys used by the extension
 */
const STORAGE_KEYS = {
  CONSOLE_API_KEY: 'statsig_console_api_key',
  CLIENT_SDK_KEY: 'statsig_client_sdk_key',
  CACHED_CONFIGURATIONS: 'statsig_cached_configurations',
  ENCRYPTION_KEY: 'statsig_encryption_key',
} as const

/**
 * Default cache TTL (5 minutes as specified in requirements)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Logger utility for development and debugging
 */
const logger = {
  error: (message: string, error?: unknown): void => {
    // In development, log to console. In production, this could be sent to a logging service
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(message, error)
    }
  },
}

/**
 * StorageManager handles secure storage and retrieval of sensitive data
 * including API keys and configuration caching with encryption
 */
export class StorageManager {
  private static instance: StorageManager
  private encryptionKey: CryptoKey | null = null

  /**
   * Get singleton instance of StorageManager
   */
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * Initialize the storage manager and encryption key
   */
  public async initialize(): Promise<void> {
    try {
      await this.initializeEncryptionKey()
    } catch (error) {
      logger.error('Failed to initialize StorageManager:', error)
      throw new Error('Storage manager initialization failed')
    }
  }

  /**
   * Store Console API key with encryption
   */
  public async storeConsoleApiKey(apiKey: string): Promise<void> {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided')
    }

    try {
      const encryptedData = await this.encryptData(apiKey)
      await browser.storage.local.set({
        [STORAGE_KEYS.CONSOLE_API_KEY]: encryptedData,
      })
    } catch (error) {
      logger.error('Failed to store Console API key:', error)
      throw new Error('Failed to store Console API key securely')
    }
  }

  /**
   * Retrieve Console API key with decryption
   */
  public async getConsoleApiKey(): Promise<string | null> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.CONSOLE_API_KEY)
      const encryptedData = result[STORAGE_KEYS.CONSOLE_API_KEY] as EncryptedData

      if (!encryptedData) {
        return null
      }

      return await this.decryptData(encryptedData)
    } catch (error) {
      logger.error('Failed to retrieve Console API key:', error)
      return null
    }
  }

  /**
   * Store Client SDK key with encryption
   */
  public async storeClientSdkKey(apiKey: string): Promise<void> {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid SDK key provided')
    }

    try {
      const encryptedData = await this.encryptData(apiKey)
      await browser.storage.local.set({
        [STORAGE_KEYS.CLIENT_SDK_KEY]: encryptedData,
      })
    } catch (error) {
      logger.error('Failed to store Client SDK key:', error)
      throw new Error('Failed to store Client SDK key securely')
    }
  }

  /**
   * Retrieve Client SDK key with decryption
   */
  public async getClientSdkKey(): Promise<string | null> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.CLIENT_SDK_KEY)
      const encryptedData = result[STORAGE_KEYS.CLIENT_SDK_KEY] as EncryptedData

      if (!encryptedData) {
        return null
      }

      return await this.decryptData(encryptedData)
    } catch (error) {
      logger.error('Failed to retrieve Client SDK key:', error)
      return null
    }
  }

  /**
   * Clear Console API key from storage
   */
  public async clearConsoleApiKey(): Promise<void> {
    try {
      await browser.storage.local.remove(STORAGE_KEYS.CONSOLE_API_KEY)
    } catch (error) {
      logger.error('Failed to clear Console API key:', error)
      throw new Error('Failed to clear Console API key')
    }
  }

  /**
   * Clear Client SDK key from storage
   */
  public async clearClientSdkKey(): Promise<void> {
    try {
      await browser.storage.local.remove(STORAGE_KEYS.CLIENT_SDK_KEY)
    } catch (error) {
      logger.error('Failed to clear Client SDK key:', error)
      throw new Error('Failed to clear Client SDK key')
    }
  }

  /**
   * Cache configuration data with TTL
   */
  public async cacheConfigurations(configurations: StatsigConfigurations): Promise<void> {
    if (!Array.isArray(configurations)) {
      throw new Error('Invalid configurations data provided')
    }

    try {
      const cachedData: CachedConfigurationData = {
        configurations,
        timestamp: Date.now(),
        ttl: DEFAULT_CACHE_TTL,
      }

      await browser.storage.local.set({
        [STORAGE_KEYS.CACHED_CONFIGURATIONS]: cachedData,
      })
    } catch (error) {
      logger.error('Failed to cache configurations:', error)
      throw new Error('Failed to cache configurations')
    }
  }

  /**
   * Retrieve cached configuration data if not expired
   */
  public async getCachedConfigurations(): Promise<StatsigConfigurations | null> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.CACHED_CONFIGURATIONS)
      const cachedData = result[STORAGE_KEYS.CACHED_CONFIGURATIONS] as CachedConfigurationData

      if (!cachedData) {
        return null
      }

      // Check if cache has expired
      const now = Date.now()
      const isExpired = now - cachedData.timestamp > cachedData.ttl

      if (isExpired) {
        // Clean up expired cache
        await this.clearCache()
        return null
      }

      return cachedData.configurations
    } catch (error) {
      logger.error('Failed to retrieve cached configurations:', error)
      return null
    }
  }

  /**
   * Clear cached configuration data
   */
  public async clearCache(): Promise<void> {
    try {
      await browser.storage.local.remove(STORAGE_KEYS.CACHED_CONFIGURATIONS)
    } catch (error) {
      logger.error('Failed to clear cache:', error)
      throw new Error('Failed to clear cache')
    }
  }

  /**
   * Clear all stored data (for security cleanup)
   */
  public async clearAllData(): Promise<void> {
    try {
      await browser.storage.local.clear()
      this.encryptionKey = null
    } catch (error) {
      logger.error('Failed to clear all data:', error)
      throw new Error('Failed to clear all data')
    }
  }

  /**
   * Check if Console API key exists
   */
  public async hasConsoleApiKey(): Promise<boolean> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.CONSOLE_API_KEY)
      return !!result[STORAGE_KEYS.CONSOLE_API_KEY]
    } catch (error) {
      logger.error('Failed to check Console API key existence:', error)
      return false
    }
  }

  /**
   * Check if Client SDK key exists
   */
  public async hasClientSdkKey(): Promise<boolean> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.CLIENT_SDK_KEY)
      return !!result[STORAGE_KEYS.CLIENT_SDK_KEY]
    } catch (error) {
      logger.error('Failed to check Client SDK key existence:', error)
      return false
    }
  }

  /**
   * Initialize or retrieve encryption key
   */
  private async initializeEncryptionKey(): Promise<void> {
    try {
      // Try to get existing key
      const result = await browser.storage.local.get(STORAGE_KEYS.ENCRYPTION_KEY)
      let keyData = result[STORAGE_KEYS.ENCRYPTION_KEY] as number[] | undefined

      if (!keyData || !Array.isArray(keyData)) {
        // Generate new encryption key
        this.encryptionKey = await globalThis.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt'],
        )

        // Export and store the key
        const exportedKey = await globalThis.crypto.subtle.exportKey('raw', this.encryptionKey)
        keyData = Array.from(new Uint8Array(exportedKey))

        await browser.storage.local.set({
          [STORAGE_KEYS.ENCRYPTION_KEY]: keyData,
        })
      } else {
        // Import existing key
        const keyBuffer = new Uint8Array(keyData)
        this.encryptionKey = await globalThis.crypto.subtle.importKey(
          'raw',
          keyBuffer,
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt'],
        )
      }
    } catch (error) {
      logger.error('Failed to initialize encryption key:', error)
      throw new Error('Encryption key initialization failed')
    }
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encryptData(data: string): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    try {
      // Generate random IV and salt
      const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
      const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))

      // Encode the data
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      // Encrypt the data
      const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        dataBuffer,
      )

      return {
        encryptedValue: Array.from(new Uint8Array(encryptedBuffer)).join(','),
        iv: Array.from(iv).join(','),
        salt: Array.from(salt).join(','),
      }
    } catch (error) {
      logger.error('Failed to encrypt data:', error)
      throw new Error('Data encryption failed')
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decryptData(encryptedData: EncryptedData): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    try {
      // Parse the encrypted data
      const encryptedBuffer = new Uint8Array(encryptedData.encryptedValue.split(',').map(Number))
      const iv = new Uint8Array(encryptedData.iv.split(',').map(Number))

      // Decrypt the data
      const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        encryptedBuffer,
      )

      // Decode the decrypted data
      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      logger.error('Failed to decrypt data:', error)
      throw new Error('Data decryption failed')
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance()

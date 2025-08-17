/**
 * Retry manager with exponential backoff and offline support
 */

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors?: string[]
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: ['timeout', 'network', '429', '500', '502', '503', '504'],
}

/**
 * Network status interface
 */
export interface NetworkStatus {
  isOnline: boolean
  lastOnlineTime?: string
  connectionType?: string
}

/**
 * Logger for retry operations
 */
const logger = {
  error: (message: string, error?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[RetryManager] ${message}`, error)
    }
  },
  warn: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[RetryManager] ${message}`, data)
    }
  },
  info: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[RetryManager] ${message}`, data)
    }
  },
}

/**
 * Retry manager class
 */
export class RetryManager {
  private static instance: RetryManager
  private networkStatus: NetworkStatus = { isOnline: navigator.onLine }
  private retryQueues: Map<string, (() => Promise<void>)[]> = new Map()

  private constructor() {
    this.setupNetworkListeners()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  /**
   * Execute operation with retry logic
   */
  async withRetry<T>(operation: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
      try {
        // Check if we're online before attempting
        if (!this.networkStatus.isOnline && attempt > 1) {
          throw new Error('Network is offline')
        }

        const result = await operation()

        // Success - log if this was a retry
        if (attempt > 1) {
          logger.info(`Operation succeeded on attempt ${attempt}`)
        }

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry if this is the last attempt
        if (attempt > finalConfig.maxRetries) {
          break
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError, finalConfig.retryableErrors)) {
          logger.warn(`Non-retryable error encountered: ${lastError.message}`)
          break
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt - 1, finalConfig)

        logger.info(`Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`)

        // Call retry callback if provided
        finalConfig.onRetry?.(attempt, lastError)

        // Wait before retrying
        await this.delay(delay)
      }
    }

    // All retries exhausted
    logger.error(`All ${finalConfig.maxRetries} retries exhausted`, lastError)
    throw lastError
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, retryableErrors?: string[]): boolean {
    const errors = retryableErrors || DEFAULT_RETRY_CONFIG.retryableErrors || []
    const errorMessage = error.message.toLowerCase()

    return errors.some((retryableError) => errorMessage.includes(retryableError.toLowerCase()))
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay

    return Math.min(delay + jitter, config.maxDelayMs)
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      logger.info('Network came back online')
      this.networkStatus.isOnline = true
      this.processRetryQueues()
    })

    window.addEventListener('offline', () => {
      logger.warn('Network went offline')
      this.networkStatus.isOnline = false
      this.networkStatus.lastOnlineTime = new Date().toISOString()
    })

    // Update initial status
    this.networkStatus.isOnline = navigator.onLine
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus }
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.networkStatus.isOnline
  }

  /**
   * Queue operation for retry when network comes back
   */
  queueForRetry(queueName: string, operation: () => Promise<void>): void {
    if (!this.retryQueues.has(queueName)) {
      this.retryQueues.set(queueName, [])
    }

    const queue = this.retryQueues.get(queueName)
    if (queue) {
      queue.push(operation)
    }
    logger.info(`Operation queued for retry in queue: ${queueName}`)
  }

  /**
   * Process retry queues when network comes back online
   */
  private async processRetryQueues(): Promise<void> {
    logger.info('Processing retry queues...')

    for (const [queueName, operations] of this.retryQueues.entries()) {
      if (operations.length === 0) continue

      logger.info(`Processing ${operations.length} operations in queue: ${queueName}`)

      // Process operations in parallel with some delay between them
      const promises = operations.map(async (operation, index) => {
        // Add small delay to prevent overwhelming the server
        await this.delay(index * 100)

        try {
          await operation()
          logger.info(`Queued operation ${index + 1} completed successfully`)
        } catch (error) {
          logger.error(`Queued operation ${index + 1} failed:`, error)
        }
      })

      await Promise.allSettled(promises)

      // Clear the queue
      this.retryQueues.set(queueName, [])
    }

    logger.info('Retry queue processing completed')
  }

  /**
   * Clear retry queue
   */
  clearRetryQueue(queueName: string): void {
    this.retryQueues.delete(queueName)
    logger.info(`Retry queue cleared: ${queueName}`)
  }

  /**
   * Get retry queue status
   */
  getRetryQueueStatus(): Record<string, number> {
    const status: Record<string, number> = {}

    for (const [queueName, operations] of this.retryQueues.entries()) {
      status[queueName] = operations.length
    }

    return status
  }

  /**
   * Execute with offline fallback
   */
  async withOfflineFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T> | T,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    try {
      return await this.withRetry(operation, config)
    } catch (error) {
      if (!this.networkStatus.isOnline) {
        logger.info('Using offline fallback due to network unavailability')
        return await fallback()
      }
      throw error
    }
  }

  /**
   * Create a retryable version of a function
   */
  createRetryable<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    config: Partial<RetryConfig> = {},
  ): (...args: T) => Promise<R> {
    return (...args: T) => this.withRetry(() => fn(...args), config)
  }

  /**
   * Batch retry operations
   */
  async batchRetry<T>(operations: (() => Promise<T>)[], config: Partial<RetryConfig> = {}): Promise<(T | Error)[]> {
    const results = await Promise.allSettled(operations.map((operation) => this.withRetry(operation, config)))

    return results.map((result) => (result.status === 'fulfilled' ? result.value : result.reason))
  }
}

/**
 * Singleton instance
 */
export const retryManager = RetryManager.getInstance()

/**
 * Utility function for simple retry operations
 */
export async function withRetry<T>(operation: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
  return retryManager.withRetry(operation, config)
}

/**
 * Utility function for operations with offline fallback
 */
export async function withOfflineFallback<T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T> | T,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  return retryManager.withOfflineFallback(operation, fallback, config)
}

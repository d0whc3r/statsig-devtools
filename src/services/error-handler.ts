/**
 * Comprehensive error handling system for the Statsig Developer Tools extension
 */

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  API = 'api',
  STORAGE = 'storage',
  INJECTION = 'injection',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Structured error interface
 */
export interface StatsigError {
  id: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  userMessage: string
  details?: unknown
  timestamp: string
  recoverable: boolean
  recoveryActions?: string[]
  originalError?: Error
}

/**
 * Error recovery action interface
 */
export interface ErrorRecoveryAction {
  label: string
  action: () => Promise<void> | void
  primary?: boolean
}

/**
 * Logger for error handling
 */
const logger = {
  error: (message: string, error?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[ErrorHandler] ${message}`, error)
    }
  },
  warn: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[ErrorHandler] ${message}`, data)
    }
  },
  info: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[ErrorHandler] ${message}`, data)
    }
  },
}

/**
 * Error handler class for comprehensive error management
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorHistory: StatsigError[] = []
  private maxHistorySize = 100

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle and classify errors
   */
  handleError(error: unknown, context?: string): StatsigError {
    const statsigError = this.classifyError(error, context)
    this.logError(statsigError)
    this.addToHistory(statsigError)
    return statsigError
  }

  /**
   * Classify error based on type and context
   */
  private classifyError(error: unknown, context?: string): StatsigError {
    const id = this.generateErrorId()
    const timestamp = new Date().toISOString()

    // Handle known error types
    if (error instanceof Error) {
      // Authentication errors
      if (this.isAuthenticationError(error)) {
        return {
          id,
          category: ErrorCategory.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: error.message,
          userMessage: this.getUserFriendlyMessage(ErrorCategory.AUTHENTICATION, error.message),
          timestamp,
          recoverable: true,
          recoveryActions: ['Re-enter your API keys', 'Check API key permissions'],
          originalError: error,
        }
      }

      // API errors (check after authentication to avoid conflicts)
      if (this.isApiError(error) && !this.isAuthenticationError(error)) {
        return {
          id,
          category: ErrorCategory.API,
          severity: this.getApiErrorSeverity(error.message),
          message: error.message,
          userMessage: this.getUserFriendlyMessage(ErrorCategory.API, error.message),
          timestamp,
          recoverable: true,
          recoveryActions: this.getApiErrorRecoveryActions(error.message),
          originalError: error,
        }
      }

      // Storage errors
      if (this.isStorageError(error)) {
        return {
          id,
          category: ErrorCategory.STORAGE,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          userMessage: this.getUserFriendlyMessage(ErrorCategory.STORAGE, error.message),
          timestamp,
          recoverable: true,
          recoveryActions: ['Clear extension data', 'Restart browser'],
          originalError: error,
        }
      }

      // Injection errors
      if (this.isInjectionError(error)) {
        return {
          id,
          category: ErrorCategory.INJECTION,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          userMessage: this.getUserFriendlyMessage(ErrorCategory.INJECTION, error.message),
          timestamp,
          recoverable: true,
          recoveryActions: ['Refresh the page', 'Check page permissions'],
          originalError: error,
        }
      }

      // Network errors
      if (this.isNetworkError(error)) {
        return {
          id,
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: error.message,
          userMessage: this.getUserFriendlyMessage(ErrorCategory.NETWORK, error.message),
          timestamp,
          recoverable: true,
          recoveryActions: ['Check internet connection', 'Try again later'],
          originalError: error,
        }
      }
    }

    // Unknown error
    return {
      id,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error instanceof Error ? error.message : String(error),
      userMessage: 'An unexpected error occurred. Please try again.',
      details: { context, error },
      timestamp,
      recoverable: true,
      recoveryActions: ['Try again', 'Refresh the extension'],
      originalError: error instanceof Error ? error : undefined,
    }
  }

  /**
   * Check if error is authentication related
   */
  private isAuthenticationError(error: Error): boolean {
    const message = error.message.toLowerCase()
    const authKeywords = ['invalid api key', 'unauthorized', '401', 'authentication', 'invalid key', 'forbidden', '403']
    return authKeywords.some((keyword) => message.includes(keyword))
  }

  /**
   * Check if error is API related
   */
  private isApiError(error: Error): boolean {
    const message = error.message.toLowerCase()
    const apiKeywords = [
      'api',
      'request failed',
      'response',
      'status',
      'rate limit',
      '429',
      '500',
      '503',
      '400',
      'bad request',
    ]
    return apiKeywords.some((keyword) => message.includes(keyword))
  }

  /**
   * Check if error is storage related
   */
  private isStorageError(error: Error): boolean {
    const storageKeywords = ['storage', 'quota', 'encryption', 'decrypt', 'cache']
    return storageKeywords.some((keyword) => error.message.toLowerCase().includes(keyword))
  }

  /**
   * Check if error is injection related
   */
  private isInjectionError(error: Error): boolean {
    const injectionKeywords = ['content script', 'injection', 'tab', 'cannot inject']
    return injectionKeywords.some((keyword) => error.message.toLowerCase().includes(keyword))
  }

  /**
   * Check if error is network related
   */
  private isNetworkError(error: Error): boolean {
    const networkKeywords = ['network', 'fetch', 'timeout', 'connection', 'offline']
    return networkKeywords.some((keyword) => error.message.toLowerCase().includes(keyword))
  }

  /**
   * Get API error severity based on message
   */
  private getApiErrorSeverity(message: string): ErrorSeverity {
    if (message.includes('429') || message.includes('500')) {
      return ErrorSeverity.MEDIUM
    }
    return ErrorSeverity.LOW
  }

  /**
   * Get recovery actions for API errors
   */
  private getApiErrorRecoveryActions(message: string): string[] {
    if (message.includes('401') || message.includes('403')) {
      return ['Check API key permissions', 'Re-enter API keys']
    }
    if (message.includes('429')) {
      return ['Wait before trying again', 'Check rate limits']
    }
    if (message.includes('500') || message.includes('503')) {
      return ['Try again later', 'Check Statsig service status']
    }
    return ['Try again', 'Check network connection']
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(category: ErrorCategory, originalMessage: string): string {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        if (originalMessage.includes('401')) {
          return 'Invalid API key. Please check your credentials and try again.'
        }
        if (originalMessage.includes('403')) {
          return 'API key does not have sufficient permissions.'
        }
        return 'Authentication failed. Please check your API keys.'

      case ErrorCategory.API:
        if (originalMessage.includes('429')) {
          return 'Rate limit exceeded. Please wait before trying again.'
        }
        if (originalMessage.includes('500')) {
          return 'Statsig service is temporarily unavailable. Please try again later.'
        }
        if (originalMessage.includes('timeout')) {
          return 'Request timed out. Please check your connection and try again.'
        }
        return 'API request failed. Please try again.'

      case ErrorCategory.STORAGE:
        if (originalMessage.includes('quota')) {
          return 'Storage quota exceeded. Please clear extension data.'
        }
        if (originalMessage.includes('encryption')) {
          return 'Failed to encrypt/decrypt data. Please clear extension data.'
        }
        return 'Storage operation failed. Please try again.'

      case ErrorCategory.INJECTION:
        if (originalMessage.includes('content script')) {
          return 'Cannot access this page. Try refreshing or navigate to a different page.'
        }
        return 'Failed to inject storage values. Please refresh the page.'

      case ErrorCategory.NETWORK:
        return 'Network error. Please check your internet connection.'

      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Log error for debugging
   */
  private logError(error: StatsigError): void {
    logger.error(`[${error.category}] ${error.message}`, {
      id: error.id,
      severity: error.severity,
      timestamp: error.timestamp,
      originalError: error.originalError,
    })
  }

  /**
   * Add error to history
   */
  private addToHistory(error: StatsigError): void {
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get error history
   */
  getErrorHistory(): StatsigError[] {
    return [...this.errorHistory]
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = []
    logger.info('Error history cleared')
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): StatsigError[] {
    return this.errorHistory.filter((error) => error.category === category)
  }

  /**
   * Get recent errors (last 10)
   */
  getRecentErrors(): StatsigError[] {
    return this.errorHistory.slice(0, 10)
  }
}

/**
 * Singleton instance
 */
export const errorHandler = ErrorHandler.getInstance()

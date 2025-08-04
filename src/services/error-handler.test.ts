import { beforeEach, describe, expect, it } from 'vitest'

import { ErrorCategory, ErrorHandler, ErrorSeverity } from './error-handler'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance()
    errorHandler.clearErrorHistory()
  })

  describe('error classification', () => {
    it('should classify authentication errors correctly', () => {
      const authError = new Error('Invalid API key')
      const result = errorHandler.handleError(authError)

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(result.severity).toBe(ErrorSeverity.HIGH)
      expect(result.recoverable).toBe(true)
      expect(result.recoveryActions).toContain('Re-enter your API keys')
    })

    it('should classify API errors correctly', () => {
      const apiError = new Error('API request failed with status 429')
      const result = errorHandler.handleError(apiError)

      expect(result.category).toBe(ErrorCategory.API)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.recoverable).toBe(true)
      expect(result.recoveryActions).toContain('Wait before trying again')
    })

    it('should classify storage errors correctly', () => {
      const storageError = new Error('Storage quota exceeded')
      const result = errorHandler.handleError(storageError)

      expect(result.category).toBe(ErrorCategory.STORAGE)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.recoverable).toBe(true)
      expect(result.recoveryActions).toContain('Clear extension data')
    })

    it('should classify injection errors correctly', () => {
      const injectionError = new Error('Content script not available')
      const result = errorHandler.handleError(injectionError)

      expect(result.category).toBe(ErrorCategory.INJECTION)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.recoverable).toBe(true)
      expect(result.recoveryActions).toContain('Refresh the page')
    })

    it('should classify network errors correctly', () => {
      const networkError = new Error('Network timeout')
      const result = errorHandler.handleError(networkError)

      expect(result.category).toBe(ErrorCategory.NETWORK)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.recoverable).toBe(true)
      expect(result.recoveryActions).toContain('Check internet connection')
    })

    it('should classify unknown errors correctly', () => {
      const unknownError = new Error('Something unexpected happened')
      const result = errorHandler.handleError(unknownError)

      expect(result.category).toBe(ErrorCategory.UNKNOWN)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.recoverable).toBe(true)
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('user-friendly messages', () => {
    it('should provide user-friendly messages for authentication errors', () => {
      const authError = new Error('401 Unauthorized')
      const result = errorHandler.handleError(authError)

      expect(result.userMessage).toBe('Invalid API key. Please check your credentials and try again.')
    })

    it('should provide user-friendly messages for rate limit errors', () => {
      const rateLimitError = new Error('429 Rate limit exceeded')
      const result = errorHandler.handleError(rateLimitError)

      expect(result.userMessage).toBe('Rate limit exceeded. Please wait before trying again.')
    })

    it('should provide user-friendly messages for server errors', () => {
      const serverError = new Error('500 Internal Server Error')
      const result = errorHandler.handleError(serverError)

      expect(result.userMessage).toBe('Statsig service is temporarily unavailable. Please try again later.')
    })
  })

  describe('error history', () => {
    it('should add errors to history', () => {
      const error1 = new Error('First error')
      const error2 = new Error('Second error')

      errorHandler.handleError(error1)
      errorHandler.handleError(error2)

      const history = errorHandler.getErrorHistory()
      expect(history).toHaveLength(2)
      expect(history[0].message).toBe('Second error') // Most recent first
      expect(history[1].message).toBe('First error')
    })

    it('should limit history size', () => {
      // Add more than max history size
      for (let i = 0; i < 150; i++) {
        errorHandler.handleError(new Error(`Error ${i}`))
      }

      const history = errorHandler.getErrorHistory()
      expect(history.length).toBeLessThanOrEqual(100) // Max history size
    })

    it('should filter errors by category', () => {
      const authError = new Error('Invalid API key')
      const apiError = new Error('API request failed')

      errorHandler.handleError(authError)
      errorHandler.handleError(apiError)

      const authErrors = errorHandler.getErrorsByCategory(ErrorCategory.AUTHENTICATION)
      const apiErrors = errorHandler.getErrorsByCategory(ErrorCategory.API)

      expect(authErrors).toHaveLength(1)
      expect(apiErrors).toHaveLength(1)
      expect(authErrors[0].message).toBe('Invalid API key')
      expect(apiErrors[0].message).toBe('API request failed')
    })

    it('should get recent errors', () => {
      // Add 15 errors
      for (let i = 0; i < 15; i++) {
        errorHandler.handleError(new Error(`Error ${i}`))
      }

      const recentErrors = errorHandler.getRecentErrors()
      expect(recentErrors).toHaveLength(10) // Should return only 10 most recent
      expect(recentErrors[0].message).toBe('Error 14') // Most recent first
    })

    it('should clear error history', () => {
      errorHandler.handleError(new Error('Test error'))
      expect(errorHandler.getErrorHistory()).toHaveLength(1)

      errorHandler.clearErrorHistory()
      expect(errorHandler.getErrorHistory()).toHaveLength(0)
    })
  })

  describe('error properties', () => {
    it('should generate unique error IDs', () => {
      const error1 = errorHandler.handleError(new Error('Error 1'))
      const error2 = errorHandler.handleError(new Error('Error 2'))

      expect(error1.id).toBeDefined()
      expect(error2.id).toBeDefined()
      expect(error1.id).not.toBe(error2.id)
    })

    it('should include timestamp', () => {
      const before = new Date().toISOString()
      const result = errorHandler.handleError(new Error('Test error'))
      const after = new Date().toISOString()

      expect(result.timestamp).toBeDefined()
      expect(result.timestamp >= before).toBe(true)
      expect(result.timestamp <= after).toBe(true)
    })

    it('should preserve original error', () => {
      const originalError = new Error('Original error')
      const result = errorHandler.handleError(originalError)

      expect(result.originalError).toBe(originalError)
    })

    it('should handle context information', () => {
      const error = new Error('Test error')
      const result = errorHandler.handleError(error, 'Test context')

      // Context should be included in details for unknown errors
      if (result.category === ErrorCategory.UNKNOWN) {
        expect((result.details as { context?: string })?.context).toBe('Test context')
      }
    })
  })

  describe('error severity', () => {
    it('should assign high severity to authentication errors', () => {
      const error401 = new Error('401 Unauthorized')
      const error403 = new Error('403 Forbidden')

      const result401 = errorHandler.handleError(error401)
      const result403 = errorHandler.handleError(error403)

      // These should be classified as authentication errors, not API errors
      expect(result401.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(result403.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(result401.severity).toBe(ErrorSeverity.HIGH)
      expect(result403.severity).toBe(ErrorSeverity.HIGH)
    })

    it('should assign medium severity to rate limit and server errors', () => {
      const error429 = new Error('429 Too Many Requests')
      const error500 = new Error('500 Internal Server Error')

      const result429 = errorHandler.handleError(error429)
      const result500 = errorHandler.handleError(error500)

      expect(result429.category).toBe(ErrorCategory.API)
      expect(result500.category).toBe(ErrorCategory.API)
      expect(result429.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result500.severity).toBe(ErrorSeverity.MEDIUM)
    })

    it('should assign low severity to other API errors', () => {
      const error400 = new Error('400 Bad Request')
      const result = errorHandler.handleError(error400)

      expect(result.category).toBe(ErrorCategory.API)
      expect(result.severity).toBe(ErrorSeverity.LOW)
    })
  })

  describe('recovery actions', () => {
    it('should provide appropriate recovery actions for different error types', () => {
      const authError = new Error('401 Unauthorized')
      const rateLimitError = new Error('429 Too Many Requests')
      const serverError = new Error('500 Internal Server Error')

      const authResult = errorHandler.handleError(authError)
      const rateLimitResult = errorHandler.handleError(rateLimitError)
      const serverResult = errorHandler.handleError(serverError)

      expect(authResult.recoveryActions).toContain('Check API key permissions')
      expect(rateLimitResult.recoveryActions).toContain('Wait before trying again')
      expect(serverResult.recoveryActions).toContain('Try again later')
    })
  })
})

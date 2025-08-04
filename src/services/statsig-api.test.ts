import { describe, expect, it } from 'vitest'

import { validateClientSdkKey, validateConsoleApiKey } from './statsig-api'

describe('Statsig API - Input Validation', () => {
  describe('validateConsoleApiKey', () => {
    it('should return invalid for empty API key', async () => {
      const result = await validateConsoleApiKey('')
      expect(result).toEqual({
        isValid: false,
        error: 'Console API key is required',
      })
    })

    it('should return invalid for null API key', async () => {
      const result = await validateConsoleApiKey(null as any)
      expect(result).toEqual({
        isValid: false,
        error: 'Console API key is required',
      })
    })

    it('should return invalid for whitespace-only API key', async () => {
      const result = await validateConsoleApiKey('   ')
      expect(result).toEqual({
        isValid: false,
        error: 'Console API key is required',
      })
    })
  })

  describe('validateClientSdkKey', () => {
    it('should return invalid for empty API key', async () => {
      const result = await validateClientSdkKey('')
      expect(result).toEqual({
        isValid: false,
        error: 'Client SDK key is required',
      })
    })

    it('should return invalid for null API key', async () => {
      const result = await validateClientSdkKey(null as any)
      expect(result).toEqual({
        isValid: false,
        error: 'Client SDK key is required',
      })
    })

    it('should return invalid for whitespace-only API key', async () => {
      const result = await validateClientSdkKey('   ')
      expect(result).toEqual({
        isValid: false,
        error: 'Client SDK key is required',
      })
    })
  })
})

// Note: We don't test the actual HTTP calls because:
// 1. They depend on external APIs which we don't control
// 2. The main logic is in data transformation, which happens after successful HTTP calls
// 3. HTTP integration should be tested in integration tests, not unit tests
// 4. The retry logic and error handling are already tested in retry-manager.test.ts
// 5. The data transformation logic is straightforward mapping that doesn't need complex testing

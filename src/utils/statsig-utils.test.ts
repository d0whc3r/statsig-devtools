import { describe, expect, it } from 'vitest'

/**
 * Utility functions for Statsig operations - Business Logic Tests
 * These tests focus on pure functions and business logic, not UI or external dependencies
 */

describe('Statsig Utils - Business Logic', () => {
  // Helper functions that would be used in the actual application

  const validateApiKeyFormat = (
    apiKey: string,
  ): { isValid: boolean; type: 'console' | 'client' | null; error?: string } => {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, type: null, error: 'API key is required' }
    }

    const trimmedKey = apiKey.trim()
    if (!trimmedKey) {
      return { isValid: false, type: null, error: 'API key cannot be empty' }
    }

    if (trimmedKey.startsWith('console-')) {
      return { isValid: true, type: 'console' }
    }

    if (trimmedKey.startsWith('client-')) {
      return { isValid: true, type: 'client' }
    }

    return { isValid: false, type: null, error: 'Invalid API key format' }
  }

  const formatConfigurationName = (name: string): string => {
    if (!name) return 'Unnamed Configuration'

    // Convert snake_case to Title Case
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const calculateOverrideStatistics = (overrides: Array<{ type: string; timestamp: number }>) => {
    const stats = {
      total: overrides.length,
      byType: {} as Record<string, number>,
      oldestTimestamp: 0,
      newestTimestamp: 0,
    }

    if (overrides.length === 0) {
      return stats
    }

    // Count by type
    overrides.forEach((override) => {
      stats.byType[override.type] = (stats.byType[override.type] || 0) + 1
    })

    // Find oldest and newest
    const timestamps = overrides.map((o) => o.timestamp).sort((a, b) => a - b)
    stats.oldestTimestamp = timestamps[0]
    stats.newestTimestamp = timestamps[timestamps.length - 1]

    return stats
  }

  const sanitizeConfigurationValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null'
    }

    if (typeof value === 'string') {
      // Truncate very long strings
      return value.length > 100 ? `${value.substring(0, 100)}...` : value
    }

    if (typeof value === 'boolean' || typeof value === 'number') {
      return String(value)
    }

    if (Array.isArray(value)) {
      return `Array(${value.length})`
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      return `Object(${keys.length} keys)`
    }

    return String(value)
  }

  describe('API Key Validation', () => {
    it('should validate console API keys', () => {
      const result = validateApiKeyFormat('console-abc123def456')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('console')
      expect(result.error).toBeUndefined()
    })

    it('should validate client SDK keys', () => {
      const result = validateApiKeyFormat('client-xyz789uvw012')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('client')
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid key formats', () => {
      const result = validateApiKeyFormat('invalid-key-format')
      expect(result.isValid).toBe(false)
      expect(result.type).toBeNull()
      expect(result.error).toBe('Invalid API key format')
    })

    it('should handle empty keys', () => {
      const result = validateApiKeyFormat('')
      expect(result.isValid).toBe(false)
      expect(result.type).toBeNull()
      expect(result.error).toBe('API key is required')
    })

    it('should handle null/undefined keys', () => {
      const result = validateApiKeyFormat(null as any)
      expect(result.isValid).toBe(false)
      expect(result.type).toBeNull()
      expect(result.error).toBe('API key is required')
    })

    it('should trim whitespace', () => {
      const result = validateApiKeyFormat('  console-abc123def456  ')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('console')
    })
  })

  describe('Configuration Name Formatting', () => {
    it('should format snake_case to Title Case', () => {
      expect(formatConfigurationName('test_feature_gate')).toBe('Test Feature Gate')
    })

    it('should handle single words', () => {
      expect(formatConfigurationName('experiment')).toBe('Experiment')
    })

    it('should handle empty names', () => {
      expect(formatConfigurationName('')).toBe('Unnamed Configuration')
    })

    it('should handle names with numbers', () => {
      expect(formatConfigurationName('test_v2_feature')).toBe('Test V2 Feature')
    })

    it('should handle mixed case input', () => {
      expect(formatConfigurationName('TEST_Feature_GATE')).toBe('Test Feature Gate')
    })
  })

  describe('Override Statistics', () => {
    it('should calculate basic statistics', () => {
      const overrides = [
        { type: 'localStorage', timestamp: 1000 },
        { type: 'sessionStorage', timestamp: 2000 },
        { type: 'cookie', timestamp: 3000 },
        { type: 'localStorage', timestamp: 4000 },
      ]

      const stats = calculateOverrideStatistics(overrides)

      expect(stats.total).toBe(4)
      expect(stats.byType.localStorage).toBe(2)
      expect(stats.byType.sessionStorage).toBe(1)
      expect(stats.byType.cookie).toBe(1)
      expect(stats.oldestTimestamp).toBe(1000)
      expect(stats.newestTimestamp).toBe(4000)
    })

    it('should handle empty overrides', () => {
      const stats = calculateOverrideStatistics([])

      expect(stats.total).toBe(0)
      expect(stats.byType).toEqual({})
      expect(stats.oldestTimestamp).toBe(0)
      expect(stats.newestTimestamp).toBe(0)
    })

    it('should handle single override', () => {
      const overrides = [{ type: 'localStorage', timestamp: 1500 }]
      const stats = calculateOverrideStatistics(overrides)

      expect(stats.total).toBe(1)
      expect(stats.byType.localStorage).toBe(1)
      expect(stats.oldestTimestamp).toBe(1500)
      expect(stats.newestTimestamp).toBe(1500)
    })
  })

  describe('Configuration Value Sanitization', () => {
    it('should handle null and undefined', () => {
      expect(sanitizeConfigurationValue(null)).toBe('null')
      expect(sanitizeConfigurationValue(undefined)).toBe('null')
    })

    it('should handle strings', () => {
      expect(sanitizeConfigurationValue('test')).toBe('test')
    })

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(150)
      const result = sanitizeConfigurationValue(longString)
      expect(result).toBe(`${'a'.repeat(100)}...`)
    })

    it('should handle primitives', () => {
      expect(sanitizeConfigurationValue(true)).toBe('true')
      expect(sanitizeConfigurationValue(42)).toBe('42')
    })

    it('should handle arrays', () => {
      expect(sanitizeConfigurationValue([1, 2, 3])).toBe('Array(3)')
    })

    it('should handle objects', () => {
      expect(sanitizeConfigurationValue({ a: 1, b: 2 })).toBe('Object(2 keys)')
    })
  })

  describe('Integration Tests', () => {
    it('should validate and format configuration workflow', () => {
      // Simulate a complete workflow
      const apiKey = 'console-abc123def456'
      const configName = 'test_feature_gate'
      const configValue = { enabled: true, threshold: 0.5 }

      // Step 1: Validate API key
      const keyValidation = validateApiKeyFormat(apiKey)
      expect(keyValidation.isValid).toBe(true)
      expect(keyValidation.type).toBe('console')

      // Step 2: Format configuration name
      const formattedName = formatConfigurationName(configName)
      expect(formattedName).toBe('Test Feature Gate')

      // Step 3: Sanitize configuration value
      const sanitizedValue = sanitizeConfigurationValue(configValue)
      expect(sanitizedValue).toBe('Object(2 keys)')
    })

    it('should handle error cases gracefully', () => {
      const invalidKey = 'invalid-key'
      const emptyName = ''
      const nullValue = null

      const keyResult = validateApiKeyFormat(invalidKey)
      expect(keyResult.isValid).toBe(false)

      const nameResult = formatConfigurationName(emptyName)
      expect(nameResult).toBe('Unnamed Configuration')

      const valueResult = sanitizeConfigurationValue(nullValue)
      expect(valueResult).toBe('null')
    })
  })
})

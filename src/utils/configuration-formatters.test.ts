import { describe, expect, it } from 'vitest'

import {
  formatConditionType,
  formatOperator,
  formatPercentage,
  formatTimestamp,
  formatTypeName,
  formatValue,
  getStatusIconPath,
  getStatusIndicatorClass,
  getStatusText,
  getTypeBadgeClass,
  truncateText,
} from './configuration-formatters'

describe('configuration-formatters', () => {
  describe('formatOperator', () => {
    it('formats known operators correctly', () => {
      expect(formatOperator('eq')).toBe('equals')
      expect(formatOperator('neq')).toBe('not equals')
      expect(formatOperator('gt')).toBe('greater than')
      expect(formatOperator('contains')).toBe('contains')
    })

    it('returns original operator for unknown operators', () => {
      expect(formatOperator('unknown_op')).toBe('unknown_op')
    })
  })

  describe('formatConditionType', () => {
    it('formats known condition types correctly', () => {
      expect(formatConditionType('user_id')).toBe('User ID')
      expect(formatConditionType('email')).toBe('Email')
      expect(formatConditionType('app_version')).toBe('App Version')
    })

    it('formats unknown types with proper capitalization', () => {
      expect(formatConditionType('custom_field')).toBe('Custom Field')
      expect(formatConditionType('some_other_type')).toBe('Some Other Type')
    })
  })

  describe('formatTypeName', () => {
    it('formats configuration types correctly', () => {
      expect(formatTypeName('feature_gate')).toBe('Feature Gate')
      expect(formatTypeName('dynamic_config')).toBe('Dynamic Config')
      expect(formatTypeName('experiment')).toBe('Experiment')
    })

    it('handles unknown types gracefully', () => {
      expect(formatTypeName('unknown_type')).toBe('Unknown Type')
    })
  })

  describe('formatValue', () => {
    it('formats boolean values correctly', () => {
      expect(formatValue(true)).toBe('true')
      expect(formatValue(false)).toBe('false')
    })

    it('formats string values correctly', () => {
      expect(formatValue('test')).toBe('test')
      expect(formatValue('')).toBe('')
    })

    it('formats number values correctly', () => {
      expect(formatValue(42)).toBe('42')
      expect(formatValue(0)).toBe('0')
      expect(formatValue(-1)).toBe('-1')
      expect(formatValue(3.14)).toBe('3.14')
    })

    it('formats null and undefined values', () => {
      expect(formatValue(null)).toBe('null')
      expect(formatValue(undefined)).toBe('null')
    })

    it('formats arrays correctly', () => {
      expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]')
      expect(formatValue(['a', 'b'])).toBe('[a, b]')
    })

    it('formats objects as JSON', () => {
      const obj = { key: 'value', number: 42 }
      expect(formatValue(obj)).toContain('"key": "value"')
      expect(formatValue(obj)).toContain('"number": 42')
    })
  })

  describe('getTypeBadgeClass', () => {
    it('returns correct classes for known types', () => {
      expect(getTypeBadgeClass('feature_gate')).toBe('type-badge type-badge-feature-gate')
      expect(getTypeBadgeClass('experiment')).toBe('type-badge type-badge-experiment')
      expect(getTypeBadgeClass('dynamic_config')).toBe('type-badge type-badge-dynamic-config')
    })

    it('returns default class for unknown types', () => {
      expect(getTypeBadgeClass('unknown')).toBe('type-badge bg-gray-100 text-gray-800')
    })
  })

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...')
    })

    it('returns original text if shorter than max length', () => {
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('returns original text if exactly max length', () => {
      expect(truncateText('Exactly10!', 10)).toBe('Exactly10!')
    })
  })

  describe('formatPercentage', () => {
    it('formats decimal values as percentages', () => {
      expect(formatPercentage(0.5)).toBe('50.0%')
      expect(formatPercentage(0.123)).toBe('12.3%')
      expect(formatPercentage(1)).toBe('100.0%')
      expect(formatPercentage(0)).toBe('0.0%')
    })
  })

  describe('formatTimestamp', () => {
    it('formats timestamp numbers correctly', () => {
      const timestamp = 1640995200000 // 2022-01-01 00:00:00 UTC
      const result = formatTimestamp(timestamp)
      expect(result).toContain('2022') // Should contain the year
    })

    it('formats timestamp strings correctly', () => {
      const timestamp = '2022-01-01T00:00:00Z'
      const result = formatTimestamp(timestamp)
      expect(result).toContain('2022')
    })
  })

  describe('getStatusIndicatorClass', () => {
    it('returns correct classes for different states', () => {
      expect(getStatusIndicatorClass(true)).toBe('status-badge status-badge-success')
      expect(getStatusIndicatorClass(false)).toBe('status-badge status-badge-error')
      expect(getStatusIndicatorClass(undefined)).toBe('status-badge status-badge-pending')
    })
  })

  describe('getStatusText', () => {
    it('returns correct text for different states', () => {
      expect(getStatusText(true)).toBe('Pass')
      expect(getStatusText(false)).toBe('Fail')
      expect(getStatusText(undefined)).toBe('Pending')
    })
  })

  describe('getStatusIconPath', () => {
    it('returns different icon paths for different states', () => {
      const passIcon = getStatusIconPath(true)
      const failIcon = getStatusIconPath(false)
      const pendingIcon = getStatusIconPath(undefined)

      expect(passIcon).toBe('M5 13l4 4L19 7') // Checkmark
      expect(failIcon).toBe('M6 18L18 6M6 6l12 12') // X mark
      expect(pendingIcon).toBe('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z') // Clock
    })
  })
})

import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { RuleConditions } from './RuleConditions'

import type { ConfigurationRule } from '../types'

import { cleanup, render, screen } from '@testing-library/react'

describe('RuleConditions', () => {
  beforeEach(() => {
    cleanup()
  })

  const mockRuleWithMetadata: ConfigurationRule = {
    name: 'Test Rule',
    passPercentage: 50,
    conditions: [
      {
        type: 'user_id',
        operator: 'any',
        targetValue: 'test-user',
        field: 'userId',
      },
    ],
    returnValue: true,
    id: 'rule-123',
    groupName: 'test-group',
  }

  const mockRuleBasic: ConfigurationRule = {
    name: 'Basic Rule',
    conditions: [
      {
        type: 'country',
        operator: 'any',
        targetValue: ['US', 'CA', 'UK'],
      },
    ],
  }

  describe('Rule Display', () => {
    it('should display rule name and metadata', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      expect(screen.getByText('Test Rule')).toBeInTheDocument()
      expect(screen.getByText('50% pass')).toBeInTheDocument()
      expect(screen.getByText('test-group')).toBeInTheDocument()
    })

    it('should show conditions count', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      expect(screen.getByText('Conditions (1)')).toBeInTheDocument()
    })
  })

  describe('Condition Display', () => {
    it('should display condition type, operator, and target value', () => {
      render(<RuleConditions rules={[mockRuleBasic]} />)

      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('any of')).toBeInTheDocument()
      expect(screen.getByText('[US, CA, UK]')).toBeInTheDocument()
    })

    it('should display field information when available', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      expect(screen.getByText('Field:')).toBeInTheDocument()
      expect(screen.getByText('userId')).toBeInTheDocument()
    })

    it('should display "Everyone in [environment]" for public conditions with single environment', () => {
      const mockRuleWithPublicCondition: ConfigurationRule = {
        id: 'rule-public',
        name: 'Public Rule',
        passPercentage: 100,
        conditions: [
          {
            type: 'public',
            operator: 'any',
            targetValue: ['production'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithPublicCondition]} />)

      expect(screen.getByText('Everyone in production')).toBeInTheDocument()
      // Should not show operator and target value separately for public conditions
      expect(screen.queryByText('any of')).not.toBeInTheDocument()
      expect(screen.queryByText('[production]')).not.toBeInTheDocument()
    })

    it('should display "Everyone in [environments]" for public conditions with multiple environments', () => {
      const mockRuleWithMultipleEnvs: ConfigurationRule = {
        id: 'rule-multi-env',
        name: 'Multi Environment Rule',
        passPercentage: 100,
        conditions: [
          {
            type: 'public',
            operator: 'any',
            targetValue: ['production', 'staging'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithMultipleEnvs]} />)

      expect(screen.getByText('Everyone in production, staging')).toBeInTheDocument()
    })

    it('should display "Environment: [env]" for environment_tier conditions', () => {
      const mockRuleWithEnvTier: ConfigurationRule = {
        id: 'rule-env-tier',
        name: 'Environment Tier Rule',
        passPercentage: 100,
        conditions: [
          {
            type: 'environment_tier',
            operator: 'any',
            targetValue: ['development'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithEnvTier]} />)

      expect(screen.getByText('Environment: development')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no rules provided', () => {
      render(<RuleConditions rules={[]} />)

      expect(screen.getByText('No rules configured')).toBeInTheDocument()
    })

    it('should show no conditions message when rule has no conditions', () => {
      const ruleWithoutConditions: ConfigurationRule = {
        name: 'Empty Rule',
        returnValue: false,
      }

      render(<RuleConditions rules={[ruleWithoutConditions]} />)

      expect(screen.getByText('No conditions configured')).toBeInTheDocument()
    })
  })

  describe('Return Value Display', () => {
    it('should display return value when provided', () => {
      const { container } = render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      expect(container.textContent).toContain('Return Value:')
      expect(container.textContent).toContain('true')
    })
  })

  describe('Compact Mode', () => {
    it('should apply compact styling when compact prop is true', () => {
      const { container } = render(<RuleConditions rules={[mockRuleBasic]} compact />)

      // Should still show the rule name and conditions
      expect(container.textContent).toContain('Basic Rule')
      expect(container.textContent).toContain('Country')
      expect(container.textContent).toContain('any of')
    })
  })

  describe('Multiple Rules', () => {
    it('should display multiple rules with correct count', () => {
      const multipleRules = [mockRuleBasic, mockRuleWithMetadata]
      const { container } = render(<RuleConditions rules={multipleRules} />)

      expect(container.textContent).toContain('Rules (2)')
      expect(container.textContent).toContain('Basic Rule')
      expect(container.textContent).toContain('Test Rule')
    })

    it('should show evaluation order hint', () => {
      const multipleRules = [mockRuleBasic, mockRuleWithMetadata]
      const { container } = render(<RuleConditions rules={multipleRules} />)

      expect(container.textContent).toContain('Evaluated top to bottom')
    })
  })
})

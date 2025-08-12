import React from 'react'
import { describe, expect, it } from 'vitest'

import { RuleConditions } from './RuleConditions'

import type { ConfigurationRule } from '../types'

import { fireEvent, render, screen } from '@testing-library/react'

describe('RuleConditions', () => {
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

      // Expand the rules to see the content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Test Rule')).toBeInTheDocument()
      expect(screen.getByText('50% pass')).toBeInTheDocument()
      expect(screen.getByText('test-group')).toBeInTheDocument()
    })

    it('should show conditions count', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      // Expand the rules to see the conditions count
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Conditions (1)')).toBeInTheDocument()
    })
  })

  describe('Condition Display', () => {
    it('should display condition type, operator, and target value when expanded', () => {
      render(<RuleConditions rules={[mockRuleBasic]} />)

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('any of')).toBeInTheDocument()
      expect(screen.getByText('[US, CA, UK]')).toBeInTheDocument()
    })

    it('should display field information when available and expanded', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Field:')).toBeInTheDocument()
      expect(screen.getByText('userId')).toBeInTheDocument()
    })

    it('should display "Everyone in [environment]" for public conditions with single environment when expanded', () => {
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

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Everyone in production')).toBeInTheDocument()
      // Should not show operator and target value separately for public conditions
      expect(screen.queryByText('any of')).not.toBeInTheDocument()
      expect(screen.queryByText('[production]')).not.toBeInTheDocument()
    })

    it('should display "Everyone" for public conditions without environment when expanded', () => {
      const mockRuleWithPublicCondition: ConfigurationRule = {
        id: 'rule-public-simple',
        name: 'Simple Public Rule',
        passPercentage: 100,
        conditions: [
          {
            type: 'public',
            targetValue: null,
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithPublicCondition]} />)

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Everyone')).toBeInTheDocument()
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

      // Expand the rules to see the content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Everyone in production, staging')).toBeInTheDocument()
    })

    it('should display "Environment: [env]" for environment_tier conditions when expanded', () => {
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

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Environment: development')).toBeInTheDocument()
    })

    it('should display environment badge when rule has environment field', () => {
      const mockRuleWithEnvironment: ConfigurationRule = {
        id: 'rule-with-env',
        name: 'Rule with Environment',
        passPercentage: 100,
        environments: ['production'],
        conditions: [
          {
            type: 'user_id',
            operator: 'any',
            targetValue: ['test-user'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithEnvironment]} />)

      // Expand the rules to see the content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Env: production')).toBeInTheDocument()
    })

    it('should not display environment restriction when environments is null', () => {
      const mockRuleWithNullEnvironments: ConfigurationRule = {
        id: 'rule-null-env',
        name: 'Rule with Null Environments',
        environments: null,
        conditions: [],
      }

      render(<RuleConditions rules={[mockRuleWithNullEnvironments]} />)

      // Check that no environment badge is displayed
      expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
    })

    it('should not display environment restriction when environments is empty array', () => {
      const mockRuleWithEmptyEnvironments: ConfigurationRule = {
        id: 'rule-empty-env',
        name: 'Rule with Empty Environments',
        environments: [],
        conditions: [],
      }

      render(<RuleConditions rules={[mockRuleWithEmptyEnvironments]} />)

      // Check that no environment badge is displayed
      expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
    })

    it('should not display anything when rule has no environments (applies to all)', () => {
      const mockRuleWithoutEnvironments: ConfigurationRule = {
        id: 'rule-no-env',
        name: 'Rule Without Environments',
        // No environments field - means it applies to ALL environments
        conditions: [
          {
            type: 'user_id',
            operator: 'any',
            targetValue: ['user1'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithoutEnvironments]} />)

      // Check that no environment badge is displayed (rule applies to all environments)
      expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
    })

    it('should display multiple environments badge when rule has multiple environments', () => {
      const mockRuleWithMultipleEnvironments: ConfigurationRule = {
        id: 'rule-with-multi-env',
        name: 'Rule with Multiple Environments',
        passPercentage: 100,
        environments: ['production', 'staging', 'development'],
        conditions: [
          {
            type: 'user_id',
            operator: 'any',
            targetValue: ['test-user'],
          },
        ],
      }

      render(<RuleConditions rules={[mockRuleWithMultipleEnvironments]} />)

      // Expand the rules to see the content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Envs: production, staging, development')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no rules provided', () => {
      render(<RuleConditions rules={[]} />)

      expect(screen.getByText('No rules configured')).toBeInTheDocument()
    })

    it('should show no conditions message when rule has no conditions and is expanded', () => {
      const ruleWithoutConditions: ConfigurationRule = {
        name: 'Empty Rule',
        returnValue: false,
      }

      render(<RuleConditions rules={[ruleWithoutConditions]} />)

      // Click the expand button to show content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('No conditions configured')).toBeInTheDocument()
    })
  })

  describe('Return Value Display', () => {
    it('should display return value when provided and expanded', () => {
      render(<RuleConditions rules={[mockRuleWithMetadata]} />)

      // Click the expand button to show return value
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Return Value:')).toBeInTheDocument()
      expect(screen.getByText('true')).toBeInTheDocument()
    })
  })

  describe('Compact Mode', () => {
    it('should apply compact styling when compact prop is true', () => {
      render(<RuleConditions rules={[mockRuleBasic]} compact />)

      // Rules should be collapsed by default
      expect(screen.queryByText('Basic Rule')).not.toBeInTheDocument()

      // Click the expand button to show conditions
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Basic Rule')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('any of')).toBeInTheDocument()
    })
  })

  describe('Multiple Rules', () => {
    it('should display multiple rules with correct count', () => {
      const multipleRules = [mockRuleBasic, mockRuleWithMetadata]
      render(<RuleConditions rules={multipleRules} />)

      expect(screen.getByText('Rules (2)')).toBeInTheDocument()

      // Expand the rules to see the content
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      expect(screen.getByText('Basic Rule')).toBeInTheDocument()
      expect(screen.getByText('Test Rule')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should start with rules collapsed by default', () => {
      render(<RuleConditions rules={[mockRuleBasic]} />)

      // Rules title should be visible
      expect(screen.getByText('Rules (1)')).toBeInTheDocument()

      // Rules content should not be visible initially
      expect(screen.queryByText('Basic Rule')).not.toBeInTheDocument()
      expect(screen.queryByText('Country')).not.toBeInTheDocument()
    })

    it('should expand rules when expand button is clicked', () => {
      render(<RuleConditions rules={[mockRuleBasic]} />)

      // Initially rules should not be visible
      expect(screen.queryByText('Basic Rule')).not.toBeInTheDocument()

      // Click expand button
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)

      // Now rules should be visible
      expect(screen.getByText('Basic Rule')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('any of')).toBeInTheDocument()
    })

    it('should collapse rules when collapse button is clicked', () => {
      render(<RuleConditions rules={[mockRuleBasic]} />)

      // Expand first
      const expandButton = screen.getByLabelText('Expand rules')
      fireEvent.click(expandButton)
      expect(screen.getByText('Basic Rule')).toBeInTheDocument()

      // Then collapse
      const collapseButton = screen.getByLabelText('Collapse rules')
      fireEvent.click(collapseButton)

      // Rules should be hidden again
      expect(screen.queryByText('Country')).not.toBeInTheDocument()
    })
  })
})

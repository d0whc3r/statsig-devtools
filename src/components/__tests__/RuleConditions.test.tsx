import { describe, expect, it } from 'vitest'

import { RuleConditions } from '../RuleConditions'

import type { ConfigurationRule } from '../../types'

import { render, screen } from '@testing-library/react'

describe('RuleConditions', () => {
  it('should display environment restriction when environments is specified at rule level', () => {
    const rules: ConfigurationRule[] = [
      {
        id: 'rule1',
        name: 'Test Rule',
        environments: ['production', 'staging'],
        conditions: [
          {
            type: 'user_id',
            operator: 'any',
            targetValue: ['user1', 'user2'],
          },
        ],
      },
    ]

    render(<RuleConditions rules={rules} />)

    // Check that environment badge is displayed in header
    expect(screen.getByText('Envs: production, staging')).toBeInTheDocument()
  })

  it('should display single environment correctly', () => {
    const rules: ConfigurationRule[] = [
      {
        id: 'rule1',
        name: 'Test Rule',
        environments: ['production'],
        conditions: [],
      },
    ]

    render(<RuleConditions rules={rules} />)

    // Check single environment display
    expect(screen.getByText('Env: production')).toBeInTheDocument()
  })

  it('should not display environment restriction when environments is null', () => {
    const rules: ConfigurationRule[] = [
      {
        id: 'rule1',
        name: 'Test Rule',
        environments: null,
        conditions: [],
      },
    ]

    render(<RuleConditions rules={rules} />)

    // Check that no environment badge is displayed
    expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
  })

  it('should not display environment restriction when environments is empty array', () => {
    const rules: ConfigurationRule[] = [
      {
        id: 'rule1',
        name: 'Test Rule',
        environments: [],
        conditions: [],
      },
    ]

    render(<RuleConditions rules={rules} />)

    // Check that no environment badge is displayed
    expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
  })

  it('should not display anything when rule has no environments (applies to all)', () => {
    const rules: ConfigurationRule[] = [
      {
        id: 'rule1',
        name: 'Test Rule',
        // No environments field - means it applies to ALL environments
        conditions: [
          {
            type: 'user_id',
            operator: 'any',
            targetValue: ['user1'],
          },
        ],
      },
    ]

    render(<RuleConditions rules={rules} />)

    // Check that no environment badge is displayed (rule applies to all environments)
    expect(screen.queryByText(/Env:/)).not.toBeInTheDocument()
  })
})

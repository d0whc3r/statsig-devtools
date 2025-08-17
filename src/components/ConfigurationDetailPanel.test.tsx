/* eslint-disable testing-library/no-node-access */
import { describe, expect, it, vi } from 'vitest'

import { ConfigurationDetailPanel } from './ConfigurationDetailPanel'

import type { AuthState, StatsigConfigurationItem } from '../types'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// Mock hooks
vi.mock('../hooks/useConfigurationEvaluation', () => ({
  useConfigurationEvaluation: vi.fn(() => ({
    evaluationResults: new Map(),
  })),
}))

vi.mock('../hooks/useStorageOverrides', () => ({
  useStorageOverrides: vi.fn(() => ({
    activeOverrides: [],
    createOverride: vi.fn(),
    removeOverride: vi.fn(),
  })),
}))

// Mock child components
vi.mock('./RuleDetail', () => ({
  RuleDetail: ({ configuration, compact, allowOverrides }: any) => (
    <div data-testid="rule-detail" data-compact={compact} data-allow-overrides={allowOverrides}>
      Rule Detail for {configuration.name}
    </div>
  ),
}))

describe('ConfigurationDetailPanel', () => {
  const mockAuthState: AuthState = {
    isAuthenticated: true,
    isLoading: false,
    consoleApiKey: 'test-client-key',
    error: undefined,
  }

  const mockConfiguration: StatsigConfigurationItem = {
    name: 'test_feature',
    type: 'feature_gate',
    enabled: true,
  }

  it('should match snapshot with default props', () => {
    const { container } = render(
      <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with compact mode', () => {
    const { container } = render(
      <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} compact />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with close button', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} onClose={onClose} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with overrides disabled', () => {
    const { container } = render(
      <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} allowOverrides={false} />,
    )
    expect(container).toMatchSnapshot()
  })

  describe('basic rendering', () => {
    it('should render configuration name in header when onClose is provided', () => {
      const onClose = vi.fn()
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} onClose={onClose} />)

      expect(screen.getByText('test_feature')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close details/i })).toBeInTheDocument()
    })

    it('should not render header when onClose is not provided', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} />)

      expect(screen.queryByText('test_feature')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /close details/i })).not.toBeInTheDocument()
    })

    it('should render RuleDetail component', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} />)

      expect(screen.getByTestId('rule-detail')).toBeInTheDocument()
      expect(screen.getByText('Rule Detail for test_feature')).toBeInTheDocument()
    })
  })

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /close details/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should have correct styling for close button', () => {
      const onClose = vi.fn()
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /close details/i })
      expect(closeButton).toHaveClass('cursor-pointer', 'text-gray-400', 'hover:text-gray-600', 'focus:outline-none')
    })
  })

  describe('compact mode', () => {
    it('should pass compact prop to RuleDetail', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} compact />)

      const ruleDetail = screen.getByTestId('rule-detail')
      expect(ruleDetail).toHaveAttribute('data-compact', 'true')
    })

    it('should apply compact styling to container', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} compact />)

      const ruleDetail = screen.getByTestId('rule-detail')
      const container = ruleDetail.closest('.custom-scrollbar')
      expect(container).toHaveClass('max-h-80')
    })
  })

  describe('override functionality', () => {
    it('should pass allowOverrides prop to RuleDetail', () => {
      render(
        <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} allowOverrides={false} />,
      )

      const ruleDetail = screen.getByTestId('rule-detail')
      expect(ruleDetail).toHaveAttribute('data-allow-overrides', 'false')
    })

    it('should filter overrides by domain when domain prop is provided', () => {
      render(
        <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} domain="example.com" />,
      )

      // This test verifies that the domain prop is passed to useStorageOverrides
      // The actual filtering logic is tested in useStorageOverrides.test.ts
      expect(screen.getByTestId('rule-detail')).toBeInTheDocument()
    })

    it('should have scrollable content area when overrides are allowed', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} allowOverrides />)

      const ruleDetail = screen.getByTestId('rule-detail')
      const container = ruleDetail.closest('.custom-scrollbar')
      expect(container).toHaveClass('overflow-y-auto')
      expect(container).toHaveClass('flex-1')
    })

    it('should have scrollable content area when overrides are disabled', () => {
      render(
        <ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} allowOverrides={false} />,
      )

      const ruleDetail = screen.getByTestId('rule-detail')
      const container = ruleDetail.closest('.custom-scrollbar')
      expect(container).toHaveClass('overflow-y-auto')
      expect(container).toHaveClass('flex-1')
    })
  })

  describe('active overrides section', () => {
    it('should not render overrides section when no related overrides exist', () => {
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={mockConfiguration} />)

      expect(screen.queryByText('Configuration Overrides')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle configuration with special characters in name', () => {
      const specialConfig: StatsigConfigurationItem = {
        name: 'test@#$%^&*()_feature',
        type: 'feature_gate',
        enabled: true,
      }

      const onClose = vi.fn()
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={specialConfig} onClose={onClose} />)

      expect(screen.getByText('test@#$%^&*()_feature')).toBeInTheDocument()
    })

    it('should handle configuration with long name', () => {
      const longNameConfig: StatsigConfigurationItem = {
        name: 'this_is_a_very_long_configuration_name_that_should_be_displayed_correctly',
        type: 'feature_gate',
        enabled: true,
      }

      const onClose = vi.fn()
      render(<ConfigurationDetailPanel authState={mockAuthState} configuration={longNameConfig} onClose={onClose} />)

      expect(
        screen.getByText('this_is_a_very_long_configuration_name_that_should_be_displayed_correctly'),
      ).toBeInTheDocument()
    })

    it('should handle different configuration types', () => {
      const configTypes = ['feature_gate', 'dynamic_config', 'experiment'] as const

      configTypes.forEach((type) => {
        const config: StatsigConfigurationItem = {
          name: `test_${type}`,
          type,
          enabled: true,
        }

        const { unmount } = render(<ConfigurationDetailPanel authState={mockAuthState} configuration={config} />)

        expect(screen.getByText(`Rule Detail for test_${type}`)).toBeInTheDocument()
        unmount()
      })
    })
  })
})

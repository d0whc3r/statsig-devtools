import { describe, expect, it, vi } from 'vitest'

import { RuleDetail } from './RuleDetail'

import type { StatsigConfigurationItem } from '../types'

import { render, screen } from '@testing-library/react'

// Mock child components
vi.mock('./RuleConditions', () => ({
  RuleConditions: () => <div data-testid="rule-conditions">Rule Conditions</div>,
}))

vi.mock('./RuleDetailOverrideForm', () => ({
  RuleDetailOverrideForm: () => <div data-testid="override-form">Override Form</div>,
}))

describe('RuleDetail', () => {
  const mockConfiguration: StatsigConfigurationItem = {
    name: 'test-feature-gate',
    type: 'feature_gate',
    enabled: true,
    rules: [],
    defaultValue: false,
  }

  const mockEvaluationResult = {
    configurationName: 'test-feature-gate',
    type: 'feature_gate' as const,
    passed: true,
    value: true,
    ruleId: 'rule-123',
    reason: 'Network',
  }

  const mockOnOverrideCreate = vi.fn()

  describe('Override Controls Visibility', () => {
    it('should show override button when allowOverrides is true', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides
        />,
      )

      expect(screen.getByText('Override')).toBeInTheDocument()
    })

    it('should hide override button when allowOverrides is false', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.queryByText('Override')).not.toBeInTheDocument()
    })

    it('should show override button in compact mode when allowOverrides is true', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          compact
          allowOverrides
        />,
      )

      expect(screen.getByText('Override')).toBeInTheDocument()
    })

    it('should hide override button in compact mode when allowOverrides is false', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          compact
          allowOverrides={false}
        />,
      )

      expect(screen.queryByText('Override')).not.toBeInTheDocument()
    })

    it('should default to allowOverrides=true when prop is not provided', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
        />,
      )

      expect(screen.getByText('Override')).toBeInTheDocument()
    })
  })

  describe('Configuration Display', () => {
    it('should always show configuration name and type', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      // Check for the main heading (should show name when no ID is available)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('test-feature-gate')
      expect(screen.getByText('Feature Gate')).toBeInTheDocument()
    })

    it('should show evaluation result when provided', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByTestId('rule-conditions')).toBeInTheDocument()
      expect(screen.getByText('Value:')).toBeInTheDocument()
      expect(screen.getByText('Rule ID:')).toBeInTheDocument()
    })

    it('should show disabled badge when configuration is disabled', () => {
      const disabledConfig = { ...mockConfiguration, enabled: false }

      render(
        <RuleDetail
          configuration={disabledConfig}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should always show rule conditions', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByTestId('rule-conditions')).toBeInTheDocument()
    })

    it('should show default value when provided', () => {
      const configWithDefault = { ...mockConfiguration, defaultValue: 'test-default' }

      render(
        <RuleDetail
          configuration={configWithDefault}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Default Value')
      expect(screen.getByText('"test-default"')).toBeInTheDocument()
    })

    it('should show configuration ID as title when available', () => {
      const configWithId = { ...mockConfiguration, id: 'gate_12345' }

      render(
        <RuleDetail
          configuration={configWithId}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      // Check that the ID is now the main title
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('gate_12345')

      // Check that the name appears as subtitle
      expect(screen.getByText('test-feature-gate')).toBeInTheDocument()

      // Verify that "Configuration ID:" label is no longer present
      expect(screen.queryByText('Configuration ID:')).not.toBeInTheDocument()
    })

    it('should show name as title when ID is not available', () => {
      render(
        <RuleDetail
          configuration={mockConfiguration}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      // Check that the name is the main title when no ID is available
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('test-feature-gate')

      // Verify that "Configuration ID:" label is no longer present
      expect(screen.queryByText('Configuration ID:')).not.toBeInTheDocument()
    })

    it('should not show subtitle when ID and name are the same', () => {
      const configWithSameIdAndName = { ...mockConfiguration, id: 'test-feature-gate' }

      render(
        <RuleDetail
          configuration={configWithSameIdAndName}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      // Check that the ID/name is the main title
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('test-feature-gate')

      // Check that there's no subtitle paragraph (since ID and name are the same)
      // We can verify this by checking that the name doesn't appear as a subtitle
      const nameElements = screen.getAllByText('test-feature-gate')
      expect(nameElements).toHaveLength(1) // Only the heading, no subtitle
    })
  })

  describe('Different Configuration Types', () => {
    it('should show correct badge for experiment type', () => {
      const experimentConfig = { ...mockConfiguration, type: 'experiment' as const }

      render(
        <RuleDetail
          configuration={experimentConfig}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByText('Experiment')).toBeInTheDocument()
    })

    it('should show correct badge for dynamic config type', () => {
      const dynamicConfig = { ...mockConfiguration, type: 'dynamic_config' as const }

      render(
        <RuleDetail
          configuration={dynamicConfig}
          evaluationResult={mockEvaluationResult}
          onOverrideCreate={mockOnOverrideCreate}
          allowOverrides={false}
        />,
      )

      expect(screen.getByText('Dynamic Config')).toBeInTheDocument()
    })
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as configListModule from './configuration-list'
import { ConfigurationList } from './ConfigurationList'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem, StorageOverride } from '../types'

import { render, screen } from '@testing-library/react'

// Mock the configuration-list components
vi.mock('./configuration-list', () => ({
  ConfigurationEmptyState: ({ hasActiveFilters }: { hasActiveFilters: boolean }) => (
    <div data-testid="empty-state">{hasActiveFilters ? 'No configurations match filters' : 'No configurations'}</div>
  ),
  ConfigurationErrorState: ({ error }: { error: string }) => <div data-testid="error-state">{error}</div>,
  ConfigurationItem: ({ config, isSelected, onSelect }: any) => (
    <button
      data-testid={`config-item-${config.name}`}
      onClick={() => onSelect(config)}
      className={isSelected ? 'selected' : ''}
    >
      {config.name}
    </button>
  ),
  ConfigurationLoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ConfigurationSearchAndFilters: ({ searchQuery, totalConfigurations, filteredCount }: any) => (
    <div data-testid="search-filters">
      Search: {searchQuery}, Total: {totalConfigurations}, Filtered: {filteredCount}
    </div>
  ),
  useConfigurationFilters: vi.fn(),
  useConfigurationOverrides: vi.fn(),
}))

const mockUseConfigurationFilters = vi.mocked(configListModule.useConfigurationFilters)
const mockUseConfigurationOverrides = vi.mocked(configListModule.useConfigurationOverrides)

describe('ConfigurationList', () => {
  const mockConfigurations: StatsigConfigurationItem[] = [
    {
      name: 'test_gate',
      type: 'feature_gate',
      enabled: true,
    },
    {
      name: 'test_config',
      type: 'dynamic_config',
      enabled: true,
    },
  ]

  const mockEvaluationResults = new Map<string, EvaluationResult>([
    [
      'test_gate',
      {
        configurationName: 'test_gate',
        type: 'feature_gate',
        passed: true,
        value: true,
        ruleId: 'rule1',
        groupName: 'group1',
        reason: 'Test reason',
      },
    ],
    [
      'test_config',
      {
        configurationName: 'test_config',
        type: 'dynamic_config',
        passed: true,
        value: { key: 'value' },
        ruleId: 'rule2',
        groupName: 'group2',
        reason: 'Test reason',
      },
    ],
  ])

  const mockActiveOverrides: StorageOverride[] = [
    {
      type: 'localStorage',
      key: 'test_gate',
      value: 'false',
      featureName: 'test_gate',
      featureType: 'feature_gate',
    },
  ]

  const mockOnConfigurationSelect = vi.fn()

  beforeEach(() => {
    // Default mock implementations
    mockUseConfigurationFilters.mockReturnValue({
      searchQuery: '',
      filterType: 'all',
      filterStatus: 'all',
      filteredConfigurations: mockConfigurations,
      handleSearchChange: vi.fn(),
      setFilterType: vi.fn(),
      setFilterStatus: vi.fn(),
      clearFilters: vi.fn(),
      hasActiveFilters: false,
    })

    mockUseConfigurationOverrides.mockReturnValue({
      hasOverrides: vi.fn().mockReturnValue(false),
      getOverrideCount: vi.fn().mockReturnValue(0),
    })
  })

  it('should match snapshot with default state', () => {
    const { container } = render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with loading state', () => {
    const { container } = render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
        isLoading
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with error state', () => {
    const { container } = render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
        error="Failed to load configurations"
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('renders loading state when isLoading is true', () => {
    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
        isLoading
      />,
    )

    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders error state when error is provided', () => {
    const errorMessage = 'Failed to load configurations'

    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
        error={errorMessage}
      />,
    )

    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('renders empty state when no configurations match filters', () => {
    mockUseConfigurationFilters.mockReturnValue({
      searchQuery: 'nonexistent',
      filterType: 'all',
      filterStatus: 'all',
      filteredConfigurations: [],
      handleSearchChange: vi.fn(),
      setFilterType: vi.fn(),
      setFilterStatus: vi.fn(),
      clearFilters: vi.fn(),
      hasActiveFilters: true,
    })

    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No configurations match filters')).toBeInTheDocument()
  })

  it('renders configuration items when configurations are available', () => {
    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )

    expect(screen.getByTestId('config-item-test_gate')).toBeInTheDocument()
    expect(screen.getByTestId('config-item-test_config')).toBeInTheDocument()
    expect(screen.getByText('test_gate')).toBeInTheDocument()
    expect(screen.getByText('test_config')).toBeInTheDocument()
  })

  it('renders search and filters component', () => {
    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )

    expect(screen.getByTestId('search-filters')).toBeInTheDocument()
    expect(screen.getByText(/Total: 2, Filtered: 2/)).toBeInTheDocument()
  })

  it('handles configuration selection', () => {
    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )

    const configItem = screen.getByTestId('config-item-test_gate')
    configItem.click()

    expect(mockOnConfigurationSelect).toHaveBeenCalledWith(mockConfigurations[0])
  })

  it('shows selected configuration with correct styling', () => {
    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        onConfigurationSelect={mockOnConfigurationSelect}
        selectedConfiguration={mockConfigurations[0]}
      />,
    )

    const selectedItem = screen.getByTestId('config-item-test_gate')
    expect(selectedItem).toHaveClass('selected')
  })

  it('handles active overrides correctly', () => {
    mockUseConfigurationOverrides.mockReturnValue({
      hasOverrides: vi.fn().mockImplementation((name) => name === 'test_gate'),
      getOverrideCount: vi.fn().mockImplementation((name) => (name === 'test_gate' ? 1 : 0)),
    })

    render(
      <ConfigurationList
        configurations={mockConfigurations}
        evaluationResults={mockEvaluationResults}
        activeOverrides={mockActiveOverrides}
        onConfigurationSelect={mockOnConfigurationSelect}
      />,
    )

    // The component should render configuration items
    expect(screen.getAllByTestId('config-item-test_gate')).toHaveLength(1)
    expect(screen.getAllByTestId('config-item-test_config')).toHaveLength(1)
  })
})

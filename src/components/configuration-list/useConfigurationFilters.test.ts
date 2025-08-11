import { describe, expect, it, vi } from 'vitest'

import { useConfigurationFilters } from './useConfigurationFilters'

import type { EvaluationResult } from '../../services/statsig-integration'
import type { StatsigConfigurationItem } from '../../types'
import type React from 'react'

import { act, renderHook } from '@testing-library/react'

// Mock the useDebouncedSearch hook
vi.mock('../VirtualizedList', () => ({
  useDebouncedSearch: (initialValue: string, _delay: number) => {
    const [value, setValue] = vi.fn().mockReturnValue([initialValue, vi.fn()])()
    return [value, setValue]
  },
}))

describe('useConfigurationFilters', () => {
  const mockConfigurations: StatsigConfigurationItem[] = [
    {
      name: 'feature_gate_1',
      type: 'feature_gate',
      enabled: true,
    },
    {
      name: 'experiment_1',
      type: 'experiment',
      enabled: true,
    },
    {
      name: 'dynamic_config_1',
      type: 'dynamic_config',
      enabled: true,
    },
    {
      name: 'feature_gate_2',
      type: 'feature_gate',
      enabled: false,
    },
  ]

  const mockEvaluationResults = new Map<string, EvaluationResult>([
    [
      'feature_gate_1',
      {
        configurationName: 'feature_gate_1',
        type: 'feature_gate',
        passed: true,
        value: true,
        ruleId: 'rule1',
        groupName: 'group1',
        reason: 'Test reason',
      },
    ],
    [
      'experiment_1',
      {
        configurationName: 'experiment_1',
        type: 'experiment',
        passed: false,
        value: false,
        ruleId: 'rule2',
        groupName: 'group2',
        reason: 'Test reason',
      },
    ],
    [
      'dynamic_config_1',
      {
        configurationName: 'dynamic_config_1',
        type: 'dynamic_config',
        passed: true,
        value: { key: 'value' },
        ruleId: 'rule3',
        groupName: 'group3',
        reason: 'Test reason',
      },
    ],
  ])

  it('should return all configurations when no filters are applied', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    expect(result.current.filteredConfigurations).toEqual(mockConfigurations)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should filter configurations by type', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterType('feature_gate')
    })

    expect(result.current.filteredConfigurations).toEqual([
      mockConfigurations[0], // feature_gate_1
      mockConfigurations[3], // feature_gate_2
    ])
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter configurations by status - passed', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterStatus('passed')
    })

    expect(result.current.filteredConfigurations).toEqual([
      mockConfigurations[0], // feature_gate_1 (passed)
      mockConfigurations[2], // dynamic_config_1 (passed)
    ])
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter configurations by status - failed', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterStatus('failed')
    })

    expect(result.current.filteredConfigurations).toEqual([
      mockConfigurations[1], // experiment_1 (failed)
      mockConfigurations[3], // feature_gate_2 (no evaluation result = failed)
    ])
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should combine type and status filters', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterType('feature_gate')
      result.current.setFilterStatus('passed')
    })

    expect(result.current.filteredConfigurations).toEqual([
      mockConfigurations[0], // feature_gate_1 (feature_gate + passed)
    ])
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    // Apply some filters
    act(() => {
      result.current.setFilterType('feature_gate')
      result.current.setFilterStatus('passed')
    })

    expect(result.current.hasActiveFilters).toBe(true)

    // Clear filters
    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.filterType).toBe('all')
    expect(result.current.filterStatus).toBe('all')
    expect(result.current.filteredConfigurations).toEqual(mockConfigurations)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should handle search input change', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    const mockEvent = {
      target: { value: 'test search' },
    } as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.handleSearchChange(mockEvent)
    })

    // Note: The actual search functionality depends on the mocked useDebouncedSearch
    // This test verifies that the handler is called without errors
    expect(result.current.handleSearchChange).toBeDefined()
  })

  it('should detect active filters correctly', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    // No filters initially
    expect(result.current.hasActiveFilters).toBe(false)

    // Type filter
    act(() => {
      result.current.setFilterType('feature_gate')
    })
    expect(result.current.hasActiveFilters).toBe(true)

    // Reset and try status filter
    act(() => {
      result.current.setFilterType('all')
      result.current.setFilterStatus('passed')
    })
    expect(result.current.hasActiveFilters).toBe(true)

    // Reset all
    act(() => {
      result.current.setFilterStatus('all')
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should handle empty configurations array', () => {
    const { result } = renderHook(() => useConfigurationFilters([], mockEvaluationResults))

    expect(result.current.filteredConfigurations).toEqual([])
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should handle empty evaluation results', () => {
    const emptyResults = new Map<string, EvaluationResult>()
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, emptyResults))

    // All configurations should be considered as "failed" when no evaluation results
    act(() => {
      result.current.setFilterStatus('failed')
    })

    expect(result.current.filteredConfigurations).toEqual(mockConfigurations)
  })
})

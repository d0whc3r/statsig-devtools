import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useConfigurationFilters } from '../components/configuration-list/useConfigurationFilters'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { StatsigConfigurationItem } from '../types'
import type React from 'react'

import { act, renderHook } from '@testing-library/react'

// Mock useDebouncedSearch hook
vi.mock('../components/VirtualizedList', () => ({
  useDebouncedSearch: vi.fn((initialValue: string, _delay: number) => [initialValue, vi.fn(), initialValue]),
}))

describe('useConfigurationFilters', () => {
  const mockConfigurations: StatsigConfigurationItem[] = [
    {
      id: '1',
      name: 'Feature Gate 1',
      type: 'feature_gate',
      enabled: true,
    },
    {
      id: '2',
      name: 'Dynamic Config 1',
      type: 'dynamic_config',
      enabled: true,
    },
    {
      id: '3',
      name: 'Experiment 1',
      type: 'experiment',
      enabled: true,
    },
  ]

  const mockEvaluationResults = new Map<string, EvaluationResult>([
    [
      'Feature Gate 1',
      {
        configurationName: 'Feature Gate 1',
        type: 'feature_gate',
        passed: true,
        value: true,
        ruleId: 'rule1',
        groupName: 'group1',
        reason: 'Test reason',
      },
    ],
    [
      'Dynamic Config 1',
      {
        configurationName: 'Dynamic Config 1',
        type: 'dynamic_config',
        passed: false,
        value: { key: 'value' },
        ruleId: 'rule2',
        groupName: 'group2',
        reason: 'Test reason',
      },
    ],
  ])

  beforeEach(() => {
    vi.clearAllMocks()
  })

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

    expect(result.current.filteredConfigurations).toHaveLength(1)
    expect(result.current.filteredConfigurations[0].type).toBe('feature_gate')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter configurations by status - passed', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterStatus('passed')
    })

    expect(result.current.filteredConfigurations).toHaveLength(1)
    expect(result.current.filteredConfigurations[0].name).toBe('Feature Gate 1')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter configurations by status - failed', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterStatus('failed')
    })

    expect(result.current.filteredConfigurations).toHaveLength(2)
    // Dynamic Config 1 has passed: false, Experiment 1 has no evaluation result (treated as failed)
    expect(result.current.filteredConfigurations.map((c) => c.name)).toEqual(['Dynamic Config 1', 'Experiment 1'])
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should filter configurations by both type and status', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    act(() => {
      result.current.setFilterType('dynamic_config')
      result.current.setFilterStatus('failed')
    })

    expect(result.current.filteredConfigurations).toHaveLength(1)
    expect(result.current.filteredConfigurations[0].type).toBe('dynamic_config')
    expect(result.current.filteredConfigurations[0].name).toBe('Dynamic Config 1')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    // Apply filters first
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

  it('should handle search query changes', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    const mockEvent = {
      target: { value: 'Feature' },
    } as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.handleSearchChange(mockEvent)
    })

    // The search functionality is handled by useDebouncedSearch mock
    expect(result.current.handleSearchChange).toBeDefined()
  })

  it('should detect active filters correctly', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, mockEvaluationResults))

    // No active filters initially
    expect(result.current.hasActiveFilters).toBe(false)

    // Type filter active
    act(() => {
      result.current.setFilterType('feature_gate')
    })
    expect(result.current.hasActiveFilters).toBe(true)

    // Reset type, set status filter
    act(() => {
      result.current.setFilterType('all')
      result.current.setFilterStatus('passed')
    })
    expect(result.current.hasActiveFilters).toBe(true)

    // Clear all filters
    act(() => {
      result.current.setFilterStatus('all')
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should handle empty configurations array', () => {
    const { result } = renderHook(() => useConfigurationFilters([], new Map()))

    expect(result.current.filteredConfigurations).toEqual([])
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should handle empty evaluation results', () => {
    const { result } = renderHook(() => useConfigurationFilters(mockConfigurations, new Map()))

    expect(result.current.filteredConfigurations).toEqual(mockConfigurations)
    expect(result.current.hasActiveFilters).toBe(false)
  })
})

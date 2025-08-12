import { describe, expect, it, vi } from 'vitest'

import { ConfigurationSearchAndFilters } from './configuration-list/ConfigurationSearchAndFilters'

import { fireEvent, render, screen } from '@testing-library/react'

describe('ConfigurationSearchAndFilters', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    filterType: 'all' as const,
    onFilterTypeChange: vi.fn(),
    filterStatus: 'all' as const,
    onFilterStatusChange: vi.fn(),
    hasActiveFilters: false,
    onClearFilters: vi.fn(),
    totalConfigurations: 10,
    filteredCount: 10,
  }

  it('should match snapshot with default props', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)
    expect(container).toMatchSnapshot()
  })

  it('should render search input with correct placeholder', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render filter dropdowns', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
  })

  it('should call onSearchChange when typing in search input', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(defaultProps.onSearchChange).toHaveBeenCalled()
  })

  it('should display search value in input', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} searchQuery="test value" />)

    const searchInput = screen.getByDisplayValue('test value')
    expect(searchInput).toBeInTheDocument()
  })

  it('should display configuration count', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} totalConfigurations={25} filteredCount={15} />)

    // Text may appear in multiple nested elements; allow multiple matches
    const matches = screen.getAllByText((_, node) => (node?.textContent || '').trim() === '15 of 25')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('should handle filter type changes', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = screen.getAllByRole('combobox')
    const typeSelect = selects[0] // First select should be type filter

    fireEvent.change(typeSelect, { target: { value: 'feature_gate' } })

    expect(defaultProps.onFilterTypeChange).toHaveBeenCalledWith('feature_gate')
  })

  it('should handle filter status changes', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = screen.getAllByRole('combobox')
    const statusSelect = selects[1] // Second select should be status filter

    fireEvent.change(statusSelect, { target: { value: 'passed' } })

    expect(defaultProps.onFilterStatusChange).toHaveBeenCalledWith('passed')
  })

  it('should render clear button when hasActiveFilters is true', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} hasActiveFilters />)

    const clearButton = screen.getByRole('button', { name: /clear/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('should not render clear button when hasActiveFilters is false', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const clearButton = screen.queryByRole('button', { name: /clear/i })
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should call onClearFilters when clicking clear button', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} hasActiveFilters />)

    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)

    expect(defaultProps.onClearFilters).toHaveBeenCalled()
  })

  it('should display correct filter type value', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} filterType="feature_gate" />)

    const typeSelect = screen.getByDisplayValue(/Gates$/)
    expect(typeSelect).toBeInTheDocument()
  })

  it('should display correct filter status value', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} filterStatus="passed" />)

    const statusSelect = screen.getByDisplayValue(/Passed$/)
    expect(statusSelect).toBeInTheDocument()
  })

  // Additional tests for better branch coverage
  it('should handle all filter type options', () => {
    const filterTypes = ['all', 'feature_gate', 'dynamic_config', 'experiment'] as const

    filterTypes.forEach((filterType) => {
      const { unmount } = render(<ConfigurationSearchAndFilters {...defaultProps} filterType={filterType} />)

      // Use a more specific selector to avoid conflicts
      const selects = screen.getAllByRole('combobox')
      const typeSelect = selects[0] // First select is always the type filter

      if (filterType === 'all') {
        expect(typeSelect).toHaveDisplayValue('All Types')
      } else if (filterType === 'feature_gate') {
        expect(typeSelect).toHaveDisplayValue('🚪 Gates')
      } else if (filterType === 'dynamic_config') {
        expect(typeSelect).toHaveDisplayValue('⚙️ Configs')
      } else if (filterType === 'experiment') {
        expect(typeSelect).toHaveDisplayValue('🧪 Experiments')
      }

      unmount()
    })
  })

  it('should handle all filter status options', () => {
    const filterStatuses = ['all', 'passed', 'failed'] as const

    filterStatuses.forEach((filterStatus) => {
      const { unmount } = render(<ConfigurationSearchAndFilters {...defaultProps} filterStatus={filterStatus} />)

      // Use a more specific selector to avoid conflicts
      const selects = screen.getAllByRole('combobox')
      const statusSelect = selects[1] // Second select is always the status filter

      if (filterStatus === 'all') {
        expect(statusSelect).toHaveDisplayValue('All Status')
      } else if (filterStatus === 'passed') {
        expect(statusSelect).toHaveDisplayValue('✅ Passed')
      } else if (filterStatus === 'failed') {
        expect(statusSelect).toHaveDisplayValue('❌ Failed')
      }

      unmount()
    })
  })

  it('should handle empty search query', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toHaveValue('')
  })

  it('should handle special characters in search query', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} searchQuery="test@#$%^&*()" />)

    const searchInput = screen.getByDisplayValue('test@#$%^&*()')
    expect(searchInput).toBeInTheDocument()
  })
})

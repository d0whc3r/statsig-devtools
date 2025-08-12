import { describe, expect, it, vi } from 'vitest'

import { ConfigurationSearchAndFilters } from './ConfigurationSearchAndFilters'

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

    expect(screen.getByText('15 of 25')).toBeInTheDocument()
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

    const typeSelect = screen.getByDisplayValue('Gates')
    expect(typeSelect).toBeInTheDocument()
  })

  it('should display correct filter status value', () => {
    render(<ConfigurationSearchAndFilters {...defaultProps} filterStatus="passed" />)

    const statusSelect = screen.getByDisplayValue('Passed')
    expect(statusSelect).toBeInTheDocument()
  })
})

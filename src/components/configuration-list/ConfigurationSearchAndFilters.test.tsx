import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigurationSearchAndFilters } from './ConfigurationSearchAndFilters'

import { fireEvent, render } from '@testing-library/react'

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input with correct placeholder', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const searchInput = container.querySelector('input[placeholder="Search configurations..."]')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render filter dropdowns', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = container.querySelectorAll('select')
    expect(selects).toHaveLength(2)
  })

  it('should call onSearchChange when typing in search input', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const searchInput = container.querySelector('input[placeholder="Search configurations..."]')
    expect(searchInput).toBeInTheDocument()

    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'test search' } })
      expect(defaultProps.onSearchChange).toHaveBeenCalled()
    }
  })

  it('should display search value in input', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} searchQuery="test value" />)

    const searchInput = container.querySelector('input[placeholder="Search configurations..."]') as HTMLInputElement
    expect(searchInput).toBeInTheDocument()
    expect(searchInput?.value).toBe('test value')
  })

  it('should display configuration count', () => {
    const { container } = render(
      <ConfigurationSearchAndFilters {...defaultProps} totalConfigurations={25} filteredCount={15} />,
    )

    const countText = container.textContent
    expect(countText).toContain('Showing 15 of 25 configurations')
  })

  it('should handle filter type changes', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = container.querySelectorAll('select')
    const typeSelect = selects[0] // First select should be type filter

    fireEvent.change(typeSelect, { target: { value: 'feature_gate' } })

    expect(defaultProps.onFilterTypeChange).toHaveBeenCalledWith('feature_gate')
  })

  it('should handle filter status changes', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const selects = container.querySelectorAll('select')
    const statusSelect = selects[1] // Second select should be status filter

    fireEvent.change(statusSelect, { target: { value: 'passed' } })

    expect(defaultProps.onFilterStatusChange).toHaveBeenCalledWith('passed')
  })

  it('should render clear button when hasActiveFilters is true', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} hasActiveFilters />)

    const clearButton = container.querySelector('button')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton?.textContent).toBe('Clear')
  })

  it('should not render clear button when hasActiveFilters is false', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} />)

    const clearButton = container.querySelector('button')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should call onClearFilters when clicking clear button', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} hasActiveFilters />)

    const clearButton = container.querySelector('button')
    expect(clearButton).toBeInTheDocument()

    if (clearButton) {
      fireEvent.click(clearButton)
      expect(defaultProps.onClearFilters).toHaveBeenCalled()
    }
  })

  it('should display correct filter type value', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} filterType="feature_gate" />)

    const selects = container.querySelectorAll('select')
    const typeSelect = selects[0] as HTMLSelectElement
    expect(typeSelect.value).toBe('feature_gate')
  })

  it('should display correct filter status value', () => {
    const { container } = render(<ConfigurationSearchAndFilters {...defaultProps} filterStatus="passed" />)

    const selects = container.querySelectorAll('select')
    const statusSelect = selects[1] as HTMLSelectElement
    expect(statusSelect.value).toBe('passed')
  })
})

import { describe, expect, it, vi } from 'vitest'

import { OverrideForm } from './OverrideForm'

import { render, screen } from '@testing-library/react'

// Mock the useOverrideForm hook
vi.mock('../../hooks/useOverrideForm', () => ({
  useOverrideForm: vi.fn(() => ({
    formData: { type: 'localStorage', key: '', value: '' },
    errors: {},
    isSubmitting: false,
    updateField: vi.fn(),
    submitForm: vi.fn(),
    resetForm: vi.fn(),
    isValid: vi.fn(() => true),
  })),
}))

describe('OverrideForm', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders form header correctly', () => {
    render(<OverrideForm {...mockProps} />)

    expect(screen.getByRole('heading', { name: 'Create Override' })).toBeInTheDocument()
    expect(screen.getByText('Configure storage values for testing')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<OverrideForm {...mockProps} />)

    expect(screen.getByLabelText('Storage Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Key')).toBeInTheDocument()
    expect(screen.getByLabelText('Value')).toBeInTheDocument()
  })

  it('renders form actions', () => {
    render(<OverrideForm {...mockProps} />)

    expect(screen.getByRole('button', { name: /create override/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('does not render cookie fields by default', () => {
    render(<OverrideForm {...mockProps} />)

    expect(screen.queryByText('Cookie Configuration')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Domain')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Path')).not.toBeInTheDocument()
  })
})

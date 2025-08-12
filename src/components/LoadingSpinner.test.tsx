import { describe, expect, it } from 'vitest'

import { LoadingSpinner } from './LoadingSpinner'

import { render, screen, within } from '@testing-library/react'

describe('LoadingSpinner', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container).toMatchSnapshot()
  })

  describe('basic rendering', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')

      // Check for spinner element using within
      const spinner = within(container).getByRole('generic')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2', 'border-slate-200')
    })

    it('should not render message when not provided', () => {
      render(<LoadingSpinner />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should render small spinner correctly', () => {
      render(<LoadingSpinner size="sm" />)

      const container = screen.getByTestId('loading-spinner')
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-4', 'h-4')
    })

    it('should render medium spinner correctly (default)', () => {
      render(<LoadingSpinner size="md" />)

      const container = screen.getByTestId('loading-spinner')
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('should render large spinner correctly', () => {
      render(<LoadingSpinner size="lg" />)

      const container = screen.getByTestId('loading-spinner')
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-12', 'h-12')
    })

    it('should default to medium size when size prop is not provided', () => {
      render(<LoadingSpinner />)

      const container = screen.getByTestId('loading-spinner')
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })
  })

  describe('message display', () => {
    it('should render message when provided', () => {
      const testMessage = 'Loading data...'
      render(<LoadingSpinner message={testMessage} />)

      const message = screen.getByText(testMessage)
      expect(message).toBeInTheDocument()
      expect(message).toHaveClass('mt-3', 'text-sm', 'font-medium', 'text-slate-600')
    })

    it('should render long message correctly', () => {
      const longMessage = 'This is a very long loading message that should still be displayed correctly'
      render(<LoadingSpinner message={longMessage} />)

      const message = screen.getByText(longMessage)
      expect(message).toBeInTheDocument()
      expect(message).toHaveClass('mt-3', 'text-sm', 'font-medium', 'text-slate-600')
    })

    it('should render empty string message', () => {
      render(<LoadingSpinner message="" />)

      // Empty string should not render a paragraph element
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })

    it('should handle special characters in message', () => {
      const specialMessage = 'Loading... 50% (10/20) ✓'
      render(<LoadingSpinner message={specialMessage} />)

      const message = screen.getByText(specialMessage)
      expect(message).toBeInTheDocument()
    })
  })

  describe('custom className', () => {
    it('should apply custom className to container', () => {
      const customClass = 'my-custom-class'
      render(<LoadingSpinner className={customClass} />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass(customClass)
      // Should still have default classes
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should apply multiple custom classes', () => {
      const customClasses = 'custom-class-1 custom-class-2 p-4'
      render(<LoadingSpinner className={customClasses} />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('custom-class-1', 'custom-class-2', 'p-4')
    })

    it('should handle empty className gracefully', () => {
      render(<LoadingSpinner className="" />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should default to empty string when className is not provided', () => {
      render(<LoadingSpinner />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })
  })

  describe('combined props', () => {
    it('should render correctly with all props provided', () => {
      const props = {
        size: 'lg' as const,
        message: 'Loading large content...',
        className: 'my-spinner-class',
      }

      render(<LoadingSpinner {...props} />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('my-spinner-class', 'flex', 'flex-col', 'items-center', 'justify-center')

      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-12', 'h-12')

      const message = screen.getByText('Loading large content...')
      expect(message).toBeInTheDocument()
    })

    it('should render small spinner with message and custom class', () => {
      render(<LoadingSpinner size="sm" message="Small loading..." className="compact" />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('compact')

      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-4', 'h-4')

      const message = screen.getByText('Small loading...')
      expect(message).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<LoadingSpinner message="Loading content" />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toBeInTheDocument()

      // Message should be readable by screen readers
      const message = screen.getByText('Loading content')
      expect(message).toBeInTheDocument()
    })

    it('should work without message for screen readers', () => {
      render(<LoadingSpinner />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toBeInTheDocument()
      // Should not have any text content when no message is provided
      expect(container).not.toHaveTextContent(/./)
    })
  })

  describe('spinner animation classes', () => {
    it('should have correct animation and styling classes', () => {
      render(<LoadingSpinner />)

      const container = screen.getByTestId('loading-spinner')
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2', 'border-slate-200')
    })

    it('should maintain animation classes across different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />)

      let container = screen.getByTestId('loading-spinner')
      let spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('animate-spin', 'border-2', 'border-slate-200')

      rerender(<LoadingSpinner size="lg" />)

      container = screen.getByTestId('loading-spinner')
      spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('animate-spin', 'border-2', 'border-slate-200')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined props gracefully', () => {
      const props = {
        size: undefined as any,
        message: undefined,
        className: undefined as any,
      }

      render(<LoadingSpinner {...props} />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')

      // Should default to medium size
      const spinner = within(container).getByRole('generic')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('should handle null message gracefully', () => {
      render(<LoadingSpinner message={null as any} />)

      const container = screen.getByTestId('loading-spinner')
      expect(container).toBeInTheDocument()

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })
  })
})

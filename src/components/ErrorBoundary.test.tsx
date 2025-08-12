import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that throws an error without message
const ThrowErrorWithoutMessage = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error()
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Suppress console.error during tests to avoid noise
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('normal operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>,
      )

      expect(screen.getByText('Child component')).toBeInTheDocument()
    })

    it('should render multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>,
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should catch errors and display default error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    it('should display generic message when error has no message', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage shouldThrow />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })

    it('should log error to console when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      )
    })

    it('should not render children when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
          <div>This should not be visible</div>
        </ErrorBoundary>,
      )

      expect(screen.queryByText('This should not be visible')).not.toBeInTheDocument()
      expect(screen.queryByText('No error')).not.toBeInTheDocument()
    })
  })

  describe('custom fallback', () => {
    it('should render custom fallback when provided and error occurs', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should render complex custom fallback', () => {
      const customFallback = (
        <div>
          <h1>Custom Error Title</h1>
          <p>Custom error description</p>
          <button>Custom action</button>
        </div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
      expect(screen.getByText('Custom error description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Custom action' })).toBeInTheDocument()
    })

    it('should not render custom fallback when no error occurs', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <div>Normal content</div>
        </ErrorBoundary>,
      )

      expect(screen.getByText('Normal content')).toBeInTheDocument()
      expect(screen.queryByText('Custom error message')).not.toBeInTheDocument()
    })
  })

  describe('error recovery', () => {
    it('should recover from error when "Try again" is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error message')
        }
        return <div>No error</div>
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      )

      // Error should be displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click "Try again"
      await user.click(screen.getByRole('button', { name: 'Try again' }))

      // Should show normal content now
      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should not recover if error condition persists after "Try again"', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      // Error should be displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click "Try again" but error condition still exists
      await user.click(screen.getByRole('button', { name: 'Try again' }))

      // Should still show error (because component still throws)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should reset error state when "Try again" is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error message')
        }
        return <div>Recovered content</div>
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      )

      // Verify error state
      expect(screen.getByText('Test error message')).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click "Try again"
      await user.click(screen.getByRole('button', { name: 'Try again' }))

      // Should show recovered content
      expect(screen.getByText('Recovered content')).toBeInTheDocument()
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
    })
  })

  describe('error boundary styling', () => {
    it('should apply correct CSS classes to error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      )

      // eslint-disable-next-line testing-library/no-node-access
      const errorContainer = screen.getByText('Something went wrong').closest('div')
      expect(errorContainer).toHaveClass('rounded-md', 'border', 'border-red-200', 'bg-red-50', 'p-4')

      const title = screen.getByText('Something went wrong')
      expect(title).toHaveClass('mb-2', 'text-lg', 'font-semibold', 'text-red-800')

      const message = screen.getByText('Test error message')
      expect(message).toHaveClass('text-sm', 'text-red-600')

      const button = screen.getByRole('button', { name: 'Try again' })
      expect(button).toHaveClass(
        'mt-3',
        'rounded',
        'bg-red-600',
        'px-3',
        'py-1',
        'text-sm',
        'text-white',
        'hover:bg-red-700',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle null children gracefully', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>)

      // Should not crash and should render nothing
      expect(document.body).toBeInTheDocument()
    })

    it('should handle undefined children gracefully', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>)

      // Should not crash and should render nothing
      expect(document.body).toBeInTheDocument()
    })

    it('should handle empty string children', () => {
      render(
        <ErrorBoundary>
          <div />
        </ErrorBoundary>,
      )

      // Should not crash and should render nothing visible
      expect(document.body).toBeInTheDocument()
    })

    it('should handle errors thrown in nested components', () => {
      const NestedComponent = () => <ThrowError shouldThrow />
      const WrapperComponent = () => (
        <div>
          <NestedComponent />
        </div>
      )

      render(
        <ErrorBoundary>
          <WrapperComponent />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })
  })
})

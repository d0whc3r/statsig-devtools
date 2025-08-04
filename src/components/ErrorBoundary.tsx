import { Component } from 'react'

import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-sm text-red-600">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
export default ErrorBoundary

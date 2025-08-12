import React from 'react'

interface ErrorAlertProps {
  error: string
  viewMode: 'popup' | 'sidebar' | 'tab'
}

/**
 * ErrorAlert component displays error messages in a styled alert box
 */
export function ErrorAlert({ error, viewMode }: ErrorAlertProps) {
  return (
    <div className={`alert-professional alert-error ${viewMode === 'popup' ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <svg
          className={`flex-shrink-0 text-red-500 ${viewMode === 'popup' ? 'h-5 w-5' : 'h-6 w-6'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <p className={`font-semibold text-red-800 ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>
            Authentication Error
          </p>
          <p className={`mt-1 text-red-700 ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>{error}</p>
        </div>
      </div>
    </div>
  )
}

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
    <div className={`rounded-md border border-red-200 bg-red-50 ${viewMode === 'popup' ? 'p-2' : 'p-3'}`}>
      <div className="flex">
        <svg
          className={`text-red-400 ${viewMode === 'popup' ? 'h-4 w-4' : 'h-5 w-5'}`}
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
        <span className={`ml-2 font-medium text-red-800 ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>{error}</span>
      </div>
    </div>
  )
}

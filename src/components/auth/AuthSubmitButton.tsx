import React from 'react'

import { LoadingSpinner } from '../LoadingSpinner'

interface AuthSubmitButtonProps {
  isLoading: boolean
  disabled: boolean
  viewMode: 'popup' | 'sidebar' | 'tab'
}

/**
 * AuthSubmitButton component renders the submit button with loading state
 */
export function AuthSubmitButton({ isLoading, disabled, viewMode }: AuthSubmitButtonProps) {
  /**
   * Get button text based on view mode and loading state
   */
  const getButtonText = () => {
    if (isLoading) {
      return viewMode === 'popup' ? 'Connecting...' : 'Connecting...'
    }
    return viewMode === 'popup' ? 'Connect' : 'Connect with Console API Key'
  }

  /**
   * Get button styles based on view mode
   */
  const getButtonStyles = () => {
    const baseStyles =
      'btn-primary relative z-10 flex w-full items-center justify-center rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

    switch (viewMode) {
      case 'tab':
        return `${baseStyles} px-8 py-4 text-lg`
      case 'popup':
        return `${baseStyles} px-4 py-2.5 text-sm`
      default:
        return `${baseStyles} px-6 py-3 text-base`
    }
  }

  /**
   * Get button inline styles
   */
  const getButtonInlineStyles = () => ({
    backgroundColor: viewMode === 'tab' ? '#2563eb' : undefined,
    minHeight: viewMode === 'popup' ? '28px' : viewMode === 'tab' ? '48px' : '40px',
  })

  return (
    <button type="submit" disabled={disabled} className={getButtonStyles()} style={getButtonInlineStyles()}>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {getButtonText()}
    </button>
  )
}

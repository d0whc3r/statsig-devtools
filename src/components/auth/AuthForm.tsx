import React from 'react'

import { useAuthForm } from '../../hooks/useAuthForm'
import { ApiKeyInput } from './ApiKeyInput'
import { AuthSubmitButton } from './AuthSubmitButton'
import { ErrorAlert } from './ErrorAlert'

import type { AuthState } from '../../types'

interface AuthFormProps {
  onAuthenticated: (authState: AuthState) => void
  initialError?: string
  viewMode: 'popup' | 'sidebar' | 'tab'
}

/**
 * AuthForm component handles the authentication form logic and rendering
 */
export function AuthForm({ onAuthenticated, initialError, viewMode }: AuthFormProps) {
  const { apiKey, isLoading, error, handleSubmit, handleInputChange } = useAuthForm({
    onAuthenticated,
    initialError,
  })

  /**
   * Get responsive form styles
   */
  const getFormStyles = () => {
    switch (viewMode) {
      case 'tab':
        return 'space-y-6'
      case 'popup':
        return 'space-y-3'
      default:
        return 'space-y-4'
    }
  }

  return (
    <form onSubmit={handleSubmit} className={getFormStyles()}>
      {/* Error Display */}
      {error && <ErrorAlert error={error} viewMode={viewMode} />}

      {/* Console API Key Input */}
      <ApiKeyInput value={apiKey} onChange={handleInputChange} disabled={isLoading} viewMode={viewMode} />

      {/* Submit Button */}
      <AuthSubmitButton isLoading={isLoading} disabled={isLoading || !apiKey.trim()} viewMode={viewMode} />
    </form>
  )
}

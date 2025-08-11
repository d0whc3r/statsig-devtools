import React from 'react'

import { useAuthStyles } from '../hooks/useAuthStyles'
import { AuthForm } from './auth/AuthForm'
import { AuthHeader } from './auth/AuthHeader'

import type { AuthState } from '../types'

interface AuthComponentProps {
  onAuthenticated: (authState: AuthState) => void
  initialError?: string
  viewMode?: 'popup' | 'sidebar' | 'tab'
}

/**
 * AuthComponent handles the authentication flow with a clean, modular structure
 */
export function AuthComponent({ onAuthenticated, initialError, viewMode = 'popup' }: AuthComponentProps) {
  const { containerStyles } = useAuthStyles({ viewMode })

  return (
    <div className={containerStyles}>
      <div className="flex flex-1 flex-col justify-center">
        <AuthHeader viewMode={viewMode} />
        <AuthForm onAuthenticated={onAuthenticated} initialError={initialError} viewMode={viewMode} />
      </div>
    </div>
  )
}

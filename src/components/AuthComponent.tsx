import React, { useCallback, useState } from 'react'

import { storageManager } from '../services/storage-manager'
import { unifiedStatsigService } from '../services/unified-statsig-api'
import { logger } from '../utils/logger'
import { LoadingSpinner } from './LoadingSpinner'

import type { AuthState } from '../types'

interface AuthComponentProps {
  onAuthenticated: (authState: AuthState) => void
  initialError?: string
  viewMode?: 'popup' | 'sidebar' | 'tab'
}

/**
 * AuthComponent handles the authentication flow
 */
export function AuthComponent({ onAuthenticated, initialError, viewMode = 'popup' }: AuthComponentProps) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(initialError)

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!apiKey.trim()) {
        setError('Console API key is required')
        return
      }

      // Validate that it's a Console API key
      if (!apiKey.trim().startsWith('console-')) {
        setError('Please enter a Console API key (must start with "console-")')
        return
      }

      setIsLoading(true)
      setError(undefined)

      try {
        // Validate the API key
        const validation = await unifiedStatsigService.validateApiKey(apiKey.trim())

        if (!validation.isValid) {
          setError(validation.error || 'Invalid API key')
          return
        }

        // Create auth state
        const authState: AuthState = {
          consoleApiKey: apiKey.trim(),
          clientSdkKey: apiKey.trim(),
          isAuthenticated: true,
          isLoading: false,
          projectName: validation.projectName,
        }

        // Save to storage
        await storageManager.storeConsoleApiKey(apiKey.trim())
        await storageManager.storeClientSdkKey(apiKey.trim())

        // Authenticate
        onAuthenticated(authState)

        logger.info('Authentication successful')
      } catch (error) {
        logger.error('Authentication failed:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [apiKey, onAuthenticated],
  )

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiKey(e.target.value)
      if (error) setError(undefined)
    },
    [error],
  )

  /**
   * Get responsive container styles
   */
  const getContainerStyles = () => {
    const baseStyles = 'w-full mx-auto'

    switch (viewMode) {
      case 'tab':
        return `${baseStyles} max-w-2xl p-8 min-h-screen flex flex-col justify-center`
      case 'sidebar':
        return `${baseStyles} max-w-md p-4 h-full flex flex-col justify-center`
      case 'popup':
      default:
        return `${baseStyles} p-3 h-full flex flex-col justify-center overflow-hidden`
    }
  }

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
    <div className={getContainerStyles()}>
      <div className="flex flex-1 flex-col justify-center">
        <div className={`mb-4 text-center ${viewMode === 'tab' ? 'mb-8' : ''}`}>
          <h1
            className={`text-primary mb-2 font-bold ${viewMode === 'tab' ? 'text-3xl' : viewMode === 'popup' ? 'text-lg' : 'text-xl'}`}
          >
            Statsig Developer Tools
          </h1>
          <p className={`text-secondary ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>
            Enter your Console API key to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className={getFormStyles()}>
          {/* Error Display */}
          {error && (
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
                <span className={`ml-2 font-medium text-red-800 ${viewMode === 'popup' ? 'text-xs' : 'text-sm'}`}>
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Console API Key Input */}
          <div>
            <label
              htmlFor="apiKey"
              className={`block font-medium text-gray-700 ${viewMode === 'popup' ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}
            >
              Console API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={handleInputChange}
              placeholder="console-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              disabled={isLoading}
              className={`w-full rounded-md border border-gray-300 font-mono placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
                viewMode === 'popup' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              }`}
              autoComplete="off"
            />
            <div
              className={`rounded-md border border-blue-200 bg-blue-50 ${viewMode === 'popup' ? 'mt-1 p-2' : 'mt-2 p-3'}`}
            >
              <p className={`font-medium text-blue-800 ${viewMode === 'popup' ? 'mb-0.5 text-xs' : 'mb-1 text-sm'}`}>
                Required: Console API Key
              </p>
              <p className={`text-blue-700 ${viewMode === 'popup' ? 'text-xs leading-tight' : 'text-xs'}`}>
                • Must start with <code className="rounded bg-blue-100 px-1">console-</code>
                {viewMode !== 'popup' && (
                  <>
                    <br />
                    • Found in: Statsig Console → Settings → Keys & Environments
                    <br />• <strong>Note:</strong> Server keys (secret-) and Client keys (client-) will not work
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !apiKey.trim()}
            className={`relative z-10 flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              viewMode === 'tab'
                ? 'px-8 py-4 text-lg font-semibold'
                : viewMode === 'popup'
                  ? 'px-3 py-1.5 text-xs'
                  : 'px-4 py-2 text-sm'
            }`}
            style={{
              backgroundColor: viewMode === 'tab' ? '#2563eb' : undefined,
              minHeight: viewMode === 'popup' ? '28px' : viewMode === 'tab' ? '48px' : '40px',
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {viewMode === 'popup' ? 'Connecting...' : 'Connecting...'}
              </>
            ) : viewMode === 'popup' ? (
              'Connect'
            ) : (
              'Connect with Console API Key'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

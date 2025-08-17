import { useCallback, useState } from 'react'

import { storageManager } from '../services/storage-manager'
import { unifiedStatsigService } from '../services/unified-statsig-api'
import { logger } from '../utils/logger'

import type { AuthState } from '../types'
import type React from 'react'

interface UseAuthFormProps {
  onAuthenticated: (authState: AuthState) => void
  initialError?: string
}

interface UseAuthFormReturn {
  apiKey: string
  isLoading: boolean
  error: string | undefined
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Custom hook to manage authentication form state and logic
 */
export function useAuthForm({ onAuthenticated, initialError }: UseAuthFormProps): UseAuthFormReturn {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(initialError)

  /**
   * Validate API key format
   */
  const validateApiKey = (key: string): string | null => {
    if (!key.trim()) {
      return 'Console API key is required'
    }

    if (!key.trim().startsWith('console-')) {
      return 'Please enter a Console API key (must start with "console-")'
    }

    return null
  }

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const validationError = validateApiKey(apiKey)
      if (validationError) {
        setError(validationError)
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
          isAuthenticated: true,
          isLoading: false,
        }

        // Save to storage
        await storageManager.storeConsoleApiKey(apiKey.trim())

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

  return {
    apiKey,
    isLoading,
    error,
    handleSubmit,
    handleInputChange,
  }
}

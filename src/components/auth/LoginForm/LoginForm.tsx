import { type FormEvent, useState } from 'react'

import { EyeIcon } from '@/src/assets/icons/EyeIcon'
import { EyeSlashIcon } from '@/src/assets/icons/EyeSlashIcon'
import { LoadingSpinner } from '@/src/components/LoadingSpinner/LoadingSpinner'
import { useManifestInfo } from '@/src/hooks/useManifestInfo'
import { useAuthStore } from '@/src/stores/auth-store'
import { useErrorStore } from '@/src/stores/error-store'
import { validateConsoleApiKey } from '@/src/utils/api-validation'

import { ApiKeyInfo, getLoginFormStyles, TabFeatures } from './LoginFormHelpers'

interface LoginFormProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function LoginForm({ viewMode }: LoginFormProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const { manifestInfo, isLoading: isLoadingManifest } = useManifestInfo()
  const { login, setIsValidatingKey, isValidatingKey } = useAuthStore()
  const { setGlobalError } = useErrorStore()

  // Don't render until manifest info is loaded
  if (isLoadingManifest || !manifestInfo) {
    return (
      <div className={getLoginFormStyles(viewMode).container}>
        <div className={`${getLoginFormStyles(viewMode).form} items-center justify-center`}>
          <LoadingSpinner size="md" className="mx-auto" />
          <p className="text-muted-foreground mt-4 text-center text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setGlobalError('Please enter your Console API key')
      return
    }

    if (!apiKey.startsWith('console-')) {
      setGlobalError('Console API key must start with "console-"')
      return
    }

    setIsValidatingKey(true)
    setGlobalError(null)
    try {
      const [error, isValid] = await validateConsoleApiKey(apiKey)

      if (isValid) {
        login(apiKey)
      } else {
        setGlobalError(error ?? 'Invalid API key. Please check your key and try again.')
      }
    } catch {
      setGlobalError('An unexpected error occurred. Please try again.')
    } finally {
      setIsValidatingKey(false)
    }
  }

  const styles = getLoginFormStyles(viewMode)

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* Welcome Section */}
        <div className={styles.header}>
          <div className="mb-4">
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              {viewMode === 'tab'
                ? 'Professional feature flag management and testing toolkit'
                : 'Connect to your Statsig workspace to get started'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-foreground block text-sm font-semibold">
              Console API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="console-..."
                className="input-field focus:border-primary-500 focus:ring-primary-500 pr-10 transition-all duration-200 focus:ring-2"
                disabled={isValidatingKey}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-muted-foreground hover:text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
                disabled={isValidatingKey}
                style={{ cursor: 'pointer' }}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            <ApiKeyInfo />
          </div>

          <button
            type="submit"
            disabled={isValidatingKey || !apiKey.trim()}
            className="btn-primary flex w-full items-center justify-center py-2.5 font-semibold transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            style={{ cursor: 'pointer' }}
          >
            {isValidatingKey ? (
              <>
                <LoadingSpinner size="sm" className="mr-2 border-white border-t-white/70" />
                Validating API Key...
              </>
            ) : (
              'Connect to Statsig'
            )}
          </button>
        </form>

        {viewMode === 'tab' && <TabFeatures />}
      </div>
    </div>
  )
}

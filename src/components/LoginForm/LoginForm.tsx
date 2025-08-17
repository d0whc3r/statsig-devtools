import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { useManifestInfo } from '@/src/hooks/useManifestInfo'
import { useViewMode } from '@/src/hooks/useViewMode'
import { useAuthStore } from '@/src/stores/auth.store'
import { useErrorStore } from '@/src/stores/error.store'
import { validateConsoleApiKey } from '@/src/utils/api-validation'
import { cn } from '@/src/utils/cn'

import { ApiKeyInfo } from '../ApiKeyInfo/ApiKeyInfo'
import { Button } from '../ui/Button/Button'
import { EnhancedInput } from '../ui/EnhancedInput/EnhancedInput'
import { Loading } from '../ui/Loading/Loading'

export function LoginForm() {
  const { viewMode } = useViewMode()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const { manifestInfo, isLoading: isLoadingManifest } = useManifestInfo()
  const { login, setIsValidatingKey, isValidatingKey } = useAuthStore()
  const { setGlobalError } = useErrorStore()

  if (isLoadingManifest || !manifestInfo) {
    return <Loading />
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

  return (
    <div
      className={cn('flex w-full items-center justify-center', {
        'p-4': viewMode === 'popup',
        'p-6': viewMode === 'sidebar',
        'p-8': viewMode === 'tab',
      })}
    >
      <div
        className={cn('w-full space-y-4', {
          'max-w-sm': viewMode === 'popup',
          'max-w-md': ['sidebar', 'tab'].includes(viewMode),
        })}
      >
        <h1 className="text-foreground text-center text-2xl font-semibold tracking-tight">
          Welcome to Statsig DevTools
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <EnhancedInput
              id="apiKey"
              label="Console API Key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="console-..."
              disabled={isValidatingKey}
              autoComplete="off"
              spellCheck={false}
              leftIcon={<KeyIcon className="h-4 w-4" />}
              rightIcon={showKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              onRightIconClick={() => setShowKey(!showKey)}
            />

            <div className="mt-2">
              <ApiKeyInfo />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={!apiKey.trim()}
            loading={isValidatingKey}
            loadingText="Validating..."
          >
            Connect to Statsig
          </Button>
        </form>

        <div className="text-center">
          <p className="text-muted-foreground text-xs">Your API key is encrypted and stored securely in your browser</p>
        </div>
      </div>
    </div>
  )
}

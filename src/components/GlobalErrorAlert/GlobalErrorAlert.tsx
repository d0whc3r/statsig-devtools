import { useEffect } from 'react'

import { ExclamationCircleIcon } from '@/src/assets/icons/ExclamationCircleIcon'
import { useErrorStore } from '@/src/stores/error-store'

export function GlobalErrorAlert() {
  const { globalError, isErrorVisible, clearGlobalError, setErrorVisible } = useErrorStore()

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (globalError && isErrorVisible) {
      const timer = setTimeout(() => {
        setErrorVisible(false)
        setTimeout(() => clearGlobalError(), 300) // Wait for animation to complete
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [globalError, isErrorVisible, setErrorVisible, clearGlobalError])

  if (!globalError) return null

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 transition-transform duration-300 ease-out ${
        isErrorVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-destructive/10 border-destructive/20 border-b px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleIcon className="text-destructive mr-3 h-5 w-5 flex-shrink-0" />
            <p className="text-destructive text-sm font-medium">{globalError}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorVisible(false)
              setTimeout(() => clearGlobalError(), 300)
            }}
            className="text-destructive/60 hover:text-destructive ml-4 transition-colors duration-200"
            style={{ cursor: 'pointer' }}
            aria-label="Dismiss error"
          >
            <span className="text-lg font-semibold">×</span>
          </button>
        </div>
      </div>
    </div>
  )
}

import { CircleAlertIcon } from 'lucide-react'
import { useEffect } from 'react'

import { useErrorStore } from '@/src/stores/error.store'
import { cn } from '@/src/utils/cn'

const AUTO_HIDE_DURATION = 5000

export function GlobalErrorAlert() {
  const { globalError, isErrorVisible, clearGlobalError, setErrorVisible } = useErrorStore()

  useEffect(() => {
    if (globalError && isErrorVisible) {
      const timer = setTimeout(() => {
        setErrorVisible(false)
        setTimeout(() => clearGlobalError(), 300) // Wait for animation to complete
      }, AUTO_HIDE_DURATION)

      return () => clearTimeout(timer)
    }
  }, [globalError, isErrorVisible, setErrorVisible, clearGlobalError])

  if (!globalError) return null

  return (
    <div
      className={cn(
        'absolute top-0 right-0 left-0 z-50 transition-transform duration-300 ease-out',
        isErrorVisible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <div className="bg-destructive border-destructive/30 border-b px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <CircleAlertIcon className="text-destructive-foreground mr-3 h-5 w-5 flex-shrink-0" />
            <p className="text-destructive-foreground text-sm font-medium">{globalError}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorVisible(false)
              setTimeout(() => clearGlobalError(), 300)
            }}
            className="text-destructive-foreground/80 hover:text-destructive-foreground hover:bg-destructive-foreground/10 ml-4 rounded-full p-1 transition-colors duration-200"
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

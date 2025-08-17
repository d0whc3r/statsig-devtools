import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner'

interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  const { viewMode } = useViewMode()
  return (
    <div
      className={cn(
        'flex flex-col',
        ['popup', 'sidebar'].includes(viewMode) && 'h-full w-full',
        viewMode === 'tab' && 'mx-auto min-h-screen w-full max-w-lg',
      )}
      role="status"
      aria-label="Loading..."
    >
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center',
          viewMode === 'popup' && 'space-y-2 p-4',
          viewMode === 'sidebar' && 'space-y-3 p-6',
          viewMode === 'tab' && 'space-y-4 p-8',
        )}
      >
        <div className="mx-auto">
          <LoadingSpinner />
        </div>
        <p
          className={cn(
            'text-muted-foreground text-center text-sm',
            viewMode === 'popup' && 'mt-2',
            viewMode === 'sidebar' && 'mt-3',
            viewMode === 'tab' && 'mt-4',
          )}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

export function LoadingSpinner() {
  const { viewMode } = useViewMode()
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600',
        viewMode === 'popup' && 'h-8 w-8',
        viewMode === 'sidebar' && 'h-12 w-12',
        viewMode === 'tab' && 'h-16 w-16',
      )}
    />
  )
}

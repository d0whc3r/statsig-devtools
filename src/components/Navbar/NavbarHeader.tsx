import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

interface NavbarHeaderProps {
  name: string
  version: string
}

export function NavbarHeader({ name, version }: NavbarHeaderProps) {
  const { viewMode } = useViewMode()
  return (
    <div className="flex-1">
      <h1
        className={cn(
          'text-foreground font-bold',
          viewMode === 'popup' && 'text-sm',
          viewMode === 'sidebar' && 'text-base',
          viewMode === 'tab' && 'text-lg',
        )}
      >
        {name}
      </h1>
      <p
        className={cn(
          'text-muted-foreground',
          (viewMode === 'popup' || viewMode === 'sidebar') && 'text-xs',
          viewMode === 'tab' && 'text-sm',
        )}
      >
        v{version}
      </p>
    </div>
  )
}

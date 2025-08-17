import { MoonIcon, SunIcon } from 'lucide-react'

import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

interface ThemeToggleButtonProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggleButton({ isDark, onToggle }: ThemeToggleButtonProps) {
  const { viewMode } = useViewMode()
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
      style={{ cursor: 'pointer' }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <SunIcon className={cn(viewMode === 'tab' ? 'h-5 w-5' : 'h-4 w-4')} />
      ) : (
        <MoonIcon className={cn(viewMode === 'tab' ? 'h-5 w-5' : 'h-4 w-4')} />
      )}
    </button>
  )
}

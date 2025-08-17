import { LogOutIcon } from 'lucide-react'

import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

interface LogoutButtonProps {
  isLoggingOut: boolean
  onLogout: () => void
}

export function LogoutButton({ isLoggingOut, onLogout }: LogoutButtonProps) {
  const { viewMode } = useViewMode()
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoggingOut}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-2 transition-colors disabled:opacity-50"
      style={{ cursor: 'pointer' }}
      title="Logout"
    >
      {isLoggingOut ? (
        <div className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
      ) : (
        <LogOutIcon className={cn(viewMode === 'tab' ? 'h-5 w-5' : 'h-4 w-4')} />
      )}
    </button>
  )
}

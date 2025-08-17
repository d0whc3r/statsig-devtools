import { useAuthInfo } from '@/src/hooks/useAuthInfo'
import { useManifestInfo } from '@/src/hooks/useManifestInfo'
import { useNavbarActions } from '@/src/hooks/useNavbarActions'
import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'

import { LogoutButton } from './LogoutButton'
import { NavbarHeader } from './NavbarHeader'
import { NavbarNavigationButtons } from './NavbarNavigationButtons'
import { ThemeToggleButton } from './ThemeToggleButton'

export function Navbar() {
  const { manifestInfo } = useManifestInfo()
  const { isAuthenticated } = useAuthInfo()
  const { handleOpenTab, handleOpenSidebar, handleLogout, toggleTheme, isDark, isLoggingOut } = useNavbarActions()
  const { viewMode } = useViewMode()

  // Don't show navbar if no manifest info yet
  if (!manifestInfo) {
    return null
  }

  return (
    <nav
      className={cn(
        'bg-background border-border flex items-center justify-between border-b',
        viewMode === 'popup' && 'p-3',
        viewMode === 'sidebar' && 'p-4',
        viewMode === 'tab' && 'p-4 shadow-sm',
      )}
    >
      <NavbarHeader name={manifestInfo.name} version={manifestInfo.version} />

      {/* Right side - Navigation buttons, theme toggle and logout */}
      <div className="flex items-center gap-1">
        <NavbarNavigationButtons onOpenTab={handleOpenTab} onOpenSidebar={handleOpenSidebar} />

        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />

        {isAuthenticated && <LogoutButton isLoggingOut={isLoggingOut} onLogout={handleLogout} />}
      </div>
    </nav>
  )
}

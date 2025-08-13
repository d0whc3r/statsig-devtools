import { LogoutIcon } from '@/src/assets/icons/LogoutIcon'
import { MoonIcon } from '@/src/assets/icons/MoonIcon'
import { SidebarIcon } from '@/src/assets/icons/SidebarIcon'
import { SunIcon } from '@/src/assets/icons/SunIcon'
import { TabIcon } from '@/src/assets/icons/TabIcon'
import { useManifestInfo } from '@/src/hooks/useManifestInfo'
import { useAuthStore } from '@/src/stores/auth-store'
import { useThemeStore } from '@/src/stores/theme-store'
import { openInTab, openSidebar } from '@/src/utils/browser-actions'

interface NavbarProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function Navbar({ viewMode }: NavbarProps) {
  const { manifestInfo } = useManifestInfo()
  const { isAuthenticated, logout, isLoggingOut } = useAuthStore()
  const { toggleTheme, isDark } = useThemeStore()

  const handleOpenTab = async () => {
    try {
      await openInTab()
    } catch {
      // Silently handle errors
    }
  }

  const handleOpenSidebar = async () => {
    try {
      await openSidebar()
    } catch {
      // Silently handle errors
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getNavbarClasses = () => {
    switch (viewMode) {
      case 'popup':
        return 'flex items-center justify-between p-3 bg-background border-b border-border'
      case 'sidebar':
        return 'flex items-center justify-between p-4 bg-background border-b border-border'
      case 'tab':
        return 'flex items-center justify-between p-4 bg-background border-b border-border shadow-sm'
    }
  }

  const getTitleClasses = () => {
    switch (viewMode) {
      case 'popup':
        return 'text-sm font-bold text-foreground'
      case 'sidebar':
        return 'text-base font-bold text-foreground'
      case 'tab':
        return 'text-lg font-bold text-foreground'
    }
  }

  const getVersionClasses = () => {
    switch (viewMode) {
      case 'popup':
      case 'sidebar':
        return 'text-xs text-muted-foreground'
      case 'tab':
        return 'text-sm text-muted-foreground'
    }
  }

  const getIconSize = () => {
    switch (viewMode) {
      case 'popup':
      case 'sidebar':
        return 'h-4 w-4'
      case 'tab':
        return 'h-5 w-5'
    }
  }

  // Don't show navbar if no manifest info yet
  if (!manifestInfo) {
    return null
  }

  return (
    <nav className={getNavbarClasses()}>
      {/* Left side - Title and version */}
      <div className="flex-1">
        <h1 className={getTitleClasses()}>{manifestInfo.name}</h1>
        <p className={getVersionClasses()}>v{manifestInfo.version}</p>
      </div>

      {/* Right side - Navigation buttons, theme toggle and logout */}
      <div className="flex items-center gap-1">
        {/* Navigation buttons - only show if not already in that view */}
        {viewMode !== 'tab' && (
          <button
            type="button"
            onClick={handleOpenTab}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
            style={{ cursor: 'pointer' }}
            title="Open in Tab"
          >
            <TabIcon className={getIconSize()} />
          </button>
        )}

        {viewMode !== 'sidebar' && (
          <button
            type="button"
            onClick={handleOpenSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
            style={{ cursor: 'pointer' }}
            title="Open Sidebar"
          >
            <SidebarIcon className={getIconSize()} />
          </button>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
          style={{ cursor: 'pointer' }}
          title={isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark() ? <SunIcon className={getIconSize()} /> : <MoonIcon className={getIconSize()} />}
        </button>

        {/* Logout button - only show if authenticated */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-2 transition-colors disabled:opacity-50"
            style={{ cursor: 'pointer' }}
            title="Logout"
          >
            {isLoggingOut ? (
              <div className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <LogoutIcon className={getIconSize()} />
            )}
          </button>
        )}
      </div>
    </nav>
  )
}

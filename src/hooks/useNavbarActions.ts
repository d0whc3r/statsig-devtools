import { useAuthStore } from '@/src/stores/auth.store'
import { useThemeStore } from '@/src/stores/theme.store'
import { openInTab, openSidebar } from '@/src/utils/browser-actions'

export function useNavbarActions() {
  const { coordinatedLogout, isLoggingOut } = useAuthStore()
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
    coordinatedLogout() // Ahora usa el logout coordinado automáticamente
  }

  return {
    handleOpenTab,
    handleOpenSidebar,
    handleLogout,
    toggleTheme,
    isDark: isDark(),
    isLoggingOut,
  }
}

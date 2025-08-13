import { useEffect } from 'react'

import { LoginForm } from '@/src/components/auth/LoginForm/LoginForm'
import { Dashboard } from '@/src/components/Dashboard/Dashboard'
import { GlobalErrorAlert } from '@/src/components/GlobalErrorAlert/GlobalErrorAlert'
import { Navbar } from '@/src/components/Navbar/Navbar'
import { useAuthStore } from '@/src/stores/auth-store'
import { useThemeStore } from '@/src/stores/theme-store'

export interface AppLayoutProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function AppLayout({ viewMode }: AppLayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()

  // Initialize theme on app mount
  useEffect(() => {
    // Apply the current theme to the DOM
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Initialize theme from storage and set up cross-entrypoint sync
    initializeTheme()
  }, [theme, initializeTheme])

  const containerClasses = {
    popup: 'popup-container',
    sidebar: 'sidebar-container',
    tab: 'tab-container',
  }

  const layoutClasses = {
    popup: 'popup-layout',
    sidebar: 'sidebar-layout',
    tab: 'tab-layout',
  }

  return (
    <>
      <GlobalErrorAlert />
      <div className={`${containerClasses[viewMode]} animate-fade-in`}>
        <div className={`${layoutClasses[viewMode]} text-foreground`}>
          <Navbar viewMode={viewMode} />
          {isAuthenticated ? <Dashboard viewMode={viewMode} /> : <LoginForm viewMode={viewMode} />}
        </div>
      </div>
    </>
  )
}

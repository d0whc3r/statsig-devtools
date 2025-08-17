import { useEffect } from 'react'

import { setupClientCache } from '@/src/api/cache/client-cache'
import { Dashboard } from '@/src/components/Dashboard/Dashboard'
import { LoginForm } from '@/src/components/LoginForm/LoginForm'
import { Navbar } from '@/src/components/Navbar/Navbar'
import { GlobalErrorAlert } from '@/src/components/ui/GlobalErrorAlert/GlobalErrorAlert'
import { useViewMode } from '@/src/hooks/useViewMode'
import { useAuthStore } from '@/src/stores/auth.store'
import { useThemeStore } from '@/src/stores/theme.store'
import { cn } from '@/src/utils/cn'

export interface AppLayoutProps {
  viewMode: 'popup' | 'tab' | 'sidebar'
}

export function AppLayout({ viewMode }: AppLayoutProps) {
  const { isAuthenticated, initializeAuth } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()
  const { setViewMode } = useViewMode()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Initialize theme from storage and set up cross-entrypoint sync
    initializeTheme()
  }, [theme, initializeTheme])

  // Initialize the viewMode in the store when the component mounts
  useEffect(() => {
    setViewMode(viewMode)
  }, [viewMode, setViewMode])

  // Initialize auth store
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Initialize client cache
  useEffect(() => {
    setupClientCache()
  }, [])

  return (
    <div
      className={cn('bg-background text-foreground relative', {
        'h-[600px] max-h-[600px]': viewMode === 'popup',
        'min-h-screen w-full': viewMode === 'tab',
        'h-screen max-h-screen': viewMode === 'sidebar',
      })}
    >
      <GlobalErrorAlert />
      <div className="flex h-full flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col">{isAuthenticated ? <Dashboard /> : <LoginForm />}</div>
      </div>
    </div>
  )
}

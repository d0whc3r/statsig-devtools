import { useDevTools } from '@/src/utils/dev-tools'

import type { ReactNode } from 'react'

export interface AppLayoutProps {
  viewMode: 'popup' | 'sidebar' | 'tab'
  children?: ReactNode
}

export function AppLayout({ viewMode, children }: AppLayoutProps) {
  useDevTools()
  const containerClasses = {
    popup: 'popup-container',
    sidebar: 'sidebar-container',
    tab: 'tab-container',
  }

  const layoutClasses = {
    popup: 'popup-layout',
    sidebar: 'w-full h-full flex flex-col',
    tab: 'tab-layout',
  }

  return (
    <div className={`${containerClasses[viewMode]} animate-fade-in`}>
      <div className={`${layoutClasses[viewMode]} text-neutral-900`}>{children}</div>
    </div>
  )
}

import { MenuIcon, MonitorIcon } from 'lucide-react'

import { useViewMode } from '@/src/hooks/useViewMode'

interface NavbarNavigationButtonsProps {
  onOpenTab: () => void
  onOpenSidebar: () => void
}

export function NavbarNavigationButtons({ onOpenTab, onOpenSidebar }: NavbarNavigationButtonsProps) {
  const { viewMode } = useViewMode()
  return (
    <>
      {viewMode !== 'tab' && (
        <button
          type="button"
          onClick={onOpenTab}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
          style={{ cursor: 'pointer' }}
          title="Open in Tab"
        >
          <MonitorIcon className="h-4 w-4" />
        </button>
      )}

      {viewMode !== 'sidebar' && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
          style={{ cursor: 'pointer' }}
          title="Open Sidebar"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      )}
    </>
  )
}

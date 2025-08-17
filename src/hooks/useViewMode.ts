import { useViewModeStore } from '@/src/stores/view-mode.store'

export function useViewMode() {
  const viewMode = useViewModeStore((state) => state.viewMode)
  const setViewMode = useViewModeStore((state) => state.setViewMode)

  return {
    viewMode,
    setViewMode,
  }
}

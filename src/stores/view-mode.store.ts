import { createEphemeralStore } from './store-helpers'

type ViewMode = 'popup' | 'sidebar' | 'tab'

interface ViewModeState {
  viewMode: ViewMode
  setViewMode: (viewMode: ViewMode) => void
}

export const useViewModeStore = createEphemeralStore<ViewModeState>(
  (set) => ({
    viewMode: 'popup', // default value
    setViewMode: (viewMode: ViewMode) => set({ viewMode }),
  }),
  'view-mode',
)

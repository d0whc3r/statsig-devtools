import { createEphemeralStore } from './store-helpers'

export interface UIState {
  viewMode: 'popup' | 'sidebar' | 'tab'
  isLoading: boolean
  notifications: unknown[]
}

export interface UIActions {
  reset: () => void
  setViewMode: (mode: 'popup' | 'sidebar' | 'tab') => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: unknown) => void
  removeNotification: (index: number) => void
  clearNotifications: () => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  viewMode: 'popup',
  isLoading: false,
  notifications: [],
}

export const useUIStore = createEphemeralStore<UIStore>(
  (set) => ({
    ...initialState,

    reset: () => set(() => initialState),

    setViewMode: (mode: 'popup' | 'sidebar' | 'tab') =>
      set((state) => {
        state.viewMode = mode
      }),

    setLoading: (loading: boolean) =>
      set((state) => {
        state.isLoading = loading
      }),

    addNotification: (notification: unknown) =>
      set((state) => {
        state.notifications.push(notification)
      }),

    removeNotification: (index: number) =>
      set((state) => {
        state.notifications.splice(index, 1)
      }),

    clearNotifications: () =>
      set((state) => {
        state.notifications = []
      }),
  }),
  'ui-store',
)

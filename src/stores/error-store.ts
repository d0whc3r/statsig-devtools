import { createSelectivelyPersistedStore } from './store-helpers'

export interface ErrorState {
  // Global error state
  globalError: string | null
  isErrorVisible: boolean
}

export interface ErrorActions {
  // Error actions
  setGlobalError: (error: string | null) => void
  clearGlobalError: () => void
  setErrorVisible: (visible: boolean) => void
}

export type ErrorStore = ErrorState & ErrorActions

const initialState: ErrorState = {
  globalError: null,
  isErrorVisible: false,
}

export const useErrorStore = createSelectivelyPersistedStore<ErrorStore>(
  (set) => ({
    ...initialState,

    // Error actions
    setGlobalError: (error: string | null) =>
      set((state) => {
        state.globalError = error
        state.isErrorVisible = !!error
      }),

    clearGlobalError: () =>
      set((state) => {
        state.globalError = null
        state.isErrorVisible = false
      }),

    setErrorVisible: (visible: boolean) =>
      set((state) => {
        state.isErrorVisible = visible
      }),
  }),
  'error-store',
  () => ({}), // Don't persist error state
  1,
)

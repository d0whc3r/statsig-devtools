import { createEphemeralStore } from './store-helpers'

export interface ConfigurationState {
  configurations: unknown[]
  isLoading: boolean
  error: string | null
}

export interface ConfigurationActions {
  reset: () => void
  setConfigurations: (configurations: unknown[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type ConfigurationStore = ConfigurationState & ConfigurationActions

const initialState: ConfigurationState = {
  configurations: [],
  isLoading: false,
  error: null,
}

export const useConfigurationStore = createEphemeralStore<ConfigurationStore>(
  (set) => ({
    ...initialState,

    reset: () => set(() => initialState),

    setConfigurations: (configurations: unknown[]) =>
      set((state) => {
        state.configurations = configurations
      }),

    setLoading: (loading: boolean) =>
      set((state) => {
        state.isLoading = loading
      }),

    setError: (error: string | null) =>
      set((state) => {
        state.error = error
      }),
  }),
  'configuration-store',
)

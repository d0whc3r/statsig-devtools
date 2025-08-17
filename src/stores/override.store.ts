import { createSelectivelyPersistedStore, generateStoreId } from './store-helpers'

export interface StorageOverride {
  id: string
  type: 'localStorage' | 'sessionStorage' | 'cookie'
  key: string
  value: string
  domain?: string | undefined
  path?: string | undefined
  expires?: number | undefined
  createdAt: number
}

export interface OverrideState {
  // Override data
  overrides: StorageOverride[]
}

export interface OverrideActions {
  // Override management
  addOverride: (override: Omit<StorageOverride, 'id' | 'createdAt'>) => void
  removeOverride: (id: string) => void
  removeAll: () => void
}

export type OverrideStore = OverrideState & OverrideActions

const initialState: OverrideState = {
  overrides: [],
}

export const useOverrideStore = createSelectivelyPersistedStore<OverrideStore>(
  (set) => ({
    ...initialState,

    // Override management
    addOverride: (override) =>
      set((state) => {
        const newOverride: StorageOverride = {
          ...override,
          id: generateStoreId('override'),
          createdAt: Date.now(),
        }
        state.overrides.push(newOverride)
      }),

    removeOverride: (id) =>
      set((state) => {
        state.overrides = state.overrides.filter((override) => override.id !== id)
      }),

    removeAll: () =>
      set((state) => {
        state.overrides = []
      }),
  }),
  'override-store',
  (state) => ({
    overrides: state.overrides,
  }),
  1,
)
